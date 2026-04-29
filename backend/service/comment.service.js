import Comment from "../Schema/Comment.js";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";
import Notification from "../Schema/Notification.js";
import EE from "../socket/eventManager.js";

class CommentService {
  async deleteCommentsRecursive(_id) {
    const comment = await Comment.findOneAndDelete({ _id });
    if (!comment) return;

    if (comment.parent) {
      await Comment.findOneAndUpdate({ _id: comment.parent }, { $pull: { children: _id } });
    }

    await Notification.findOneAndDelete({ comment: _id });
    await Notification.findOneAndUpdate({ reply: _id }, { $unset: { reply: 1 } });

    await Blog.findOneAndUpdate(
      { _id: comment.blog_id },
      {
        $pull: { comments: _id },
        $inc: { "activity.total_comments": -1 },
        "activity.total_parent_comments": comment.parent ? 0 : -1,
      }
    );

    if (comment.children.length) {
      await Promise.all(comment.children.map((childId) => this.deleteCommentsRecursive(childId)));
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

    if (replying_to) {
      commentObj.parent = replying_to;
      commentObj.isReply = true;
    }

    const commentFile = await new Comment(commentObj).save();

    await Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
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
      const replyingToCommentDoc = await Comment.findOneAndUpdate(
        { _id: replying_to },
        { $push: { children: commentFile._id } }
      );
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
      children: commentFile.children,
      image: commentFile.image,
    };
  }

  async getBlogComments({ blog_id, skip }) {
    return await Comment.find({ blog_id, isReply: false })
      .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
      .skip(skip)
      .limit(5)
      .sort({ commentedAt: -1 });
  }

  async getReplies({ _id, skip }) {
    const doc = await Comment.findOne({ _id })
      .populate({
        path: "children",
        options: { limit: 5, skip: skip, sort: { commentedAt: -1 } },
        populate: {
          path: "commented_by",
          select: "personal_info.profile_img personal_info.fullname personal_info.username",
        },
        select: "-blog_id -updatedAt",
      })
      .select("children");
    return doc.children;
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
