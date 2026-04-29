import mongoose from "mongoose";
import Comment from "../Schema/Comment.js";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";
import Notification from "../Schema/Notification.js";
import File from "../Schema/File.js";
import EE from "../socket/eventManager.js";

class CommentService {
  async deleteCommentsRecursive(_id) {
    const comment = await Comment.findOneAndDelete({ _id });
    if (!comment) return;

    await Notification.findOneAndDelete({ comment: _id });
    await Notification.findOneAndUpdate({ reply: _id }, { $unset: { reply: 1 } });

    await Blog.findOneAndUpdate(
      { _id: comment.blog_id },
      {
        $inc: { "activity.total_comments": -1 },
        "activity.total_parent_comments": comment.parent ? 0 : -1,
      }
    );

    // Find children using parent ID instead of children array
    const children = await Comment.find({ parent: _id });
    if (children.length) {
      await Promise.all(children.map((child) => this.deleteCommentsRecursive(child._id)));
    }
  }

  async addComment(userId, { _id, comment, blog_author, replying_to, notification_id, image }) {
    const user = await User.findById(userId);
    if (user && user.blocked_comment) throw new Error("You are blocked from commenting");

    if (!comment && !image) throw new Error("Write something or upload an image to leave a comment");

    let commentObj = {
      blog_id: _id,
      blog_author,
      comment,
      commented_by: userId,
      image,
    };

    let level = 0;
    let replyingToCommentDoc = null;

    if (replying_to) {
      replyingToCommentDoc = await Comment.findById(replying_to);
      if (!replyingToCommentDoc) throw new Error("Parent comment not found");

      level = replyingToCommentDoc.level + 1;
      if (level > 2) throw new Error("Chỉ cho phép trả lời bình luận tối đa 3 cấp");

      commentObj.parent = replying_to;
      commentObj.isReply = true;
      commentObj.level = level;
    }

    const commentFile = await new Comment(commentObj).save();

    if (image) {
      await new File({
        type: "image/comment",
        user: userId,
        location: image,
      }).save();
    }

    await Blog.findOneAndUpdate(
      { _id },
      {
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": replying_to ? 0 : 1,
        },
      }
    );

    let notificationObj = {
      type: replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: userId,
      comment: commentFile._id,
    };

    if (replying_to) {
      notificationObj.replied_on_comment = replying_to;
      notificationObj.notification_for = replyingToCommentDoc.commented_by;
    }

    if (userId != notificationObj.notification_for) {
      EE.emit("publish-notification", notificationObj);
    }

    if (replying_to && notification_id) {
      await Notification.findOneAndUpdate({ _id: notification_id }, { reply: commentFile._id });
    }

    return {
      comment: commentFile.comment,
      commentedAt: commentFile.commentedAt,
      _id: commentFile._id,
      user_id: userId,
      image: commentFile.image,
      level: commentFile.level,
      repliesCount: 0,
    };
  }

  async getBlogComments({ blog_id, skip }) {
    const comments = await Comment.find({ blog_id, isReply: false })
      .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
      .skip(skip)
      .limit(5)
      .sort({ commentedAt: -1 });

    return await Promise.all(comments.map(async (comment) => {
      const repliesCount = await Comment.countDocuments({ parent: comment._id });
      return { ...comment.toObject(), repliesCount };
    }));
  }

  async getReplies({ _id, skip }) {
    const replies = await Comment.find({ parent: _id })
      .populate("commented_by", "personal_info.profile_img personal_info.fullname personal_info.username")
      .skip(skip)
      .limit(5)
      .sort({ commentedAt: -1 })
      .select("-blog_id -updatedAt");

    return await Promise.all(replies.map(async (reply) => {
      const repliesCount = await Comment.countDocuments({ parent: reply._id });
      return { ...reply.toObject(), repliesCount };
    }));
  }

  async deleteComment(userId, { _id }) {
    const comment = await Comment.findById(_id);
    if (!comment) throw new Error("Comment not found");
    if (userId == comment.commented_by || userId == comment.blog_author) {
      await this.deleteCommentsRecursive(_id);
      return { status: "done" };
    } else {
      throw new Error("You can not delete this comment");
    }
  }

  async hideComment(userId, { _id }) {
    const comment = await Comment.findById(_id);
    if (!comment) throw new Error("Comment not found");
    if (userId != comment.blog_author) throw new Error("Only the blog author can hide comments");

    comment.isHidden = !comment.isHidden;
    await comment.save();
    return { status: "done", isHidden: comment.isHidden };
  }

  async reportComment(userId, commentId) {
    const comment = await Comment.findByIdAndUpdate(commentId, {
      $set: { isReport: true, reportUser: userId },
    });
    if (!comment) throw new Error("Comment not found");
    return { message: "Comment report successfully" };
  }
}

export default new CommentService();
