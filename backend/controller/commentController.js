import Blog from "../Schema/Blog.js";
import Comment from "../Schema/Comment.js";
import Notification from "../Schema/Notification.js";
import User from "../Schema/User.js";

export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteCommentById(id);
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const { blog_id, page = 0, limit = 10, isReport } = req.query;
    const findQuery = {};
    if (blog_id) {
      findQuery.blog_id = blog_id;
    }
    if (isReport) {
      findQuery.isReport = isReport;
    }
    const comments = await Comment.find(findQuery)
      .populate(
        "commented_by",
        "personal_info.username personal_info.fullname personal_info.profile_img "
      )
      .populate(
        "reportUser",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .skip(page * limit)
      .limit(limit);
    const totalComments = await Comment.countDocuments(findQuery);
    return res.status(200).json({ list: comments, total: totalComments });
  } catch (error) {
    return next(error);
  }
};

export const deleteCommentById = async (_id) => {
  try {
    const comment = await Comment.findOneAndDelete({ _id });
    if (!comment) {
      console.log(`Comment with id ${_id} not found`);
      return;
    }

    const deletePromises = [];

    if (comment.parent) {
      deletePromises.push(
        Comment.findOneAndUpdate(
          { _id: comment.parent },
          { $pull: { children: _id } }
        ).then(() => console.log("Comment deleted from parent"))
      );
    }

    deletePromises.push(
      Notification.findOneAndDelete({ comment: _id }).then(() =>
        console.log("Comment notification deleted")
      )
    );

    deletePromises.push(
      Notification.findOneAndUpdate(
        { reply: _id },
        { $unset: { reply: 1 } }
      ).then(() => console.log("Reply notification deleted"))
    );

    deletePromises.push(
      Blog.findOneAndUpdate(
        { _id: comment.blog_id },
        {
          $pull: { comments: _id },
          $inc: { "activity.total_comments": -1 },
          ...(comment.parent ? {} : { "activity.total_parent_comments": -1 }),
        }
      ).then(() => {
        if (comment.children.length) {
          return Promise.all(
            comment.children.map((replyId) => deleteCommentById(replyId))
          );
        }
      })
    );

    await Promise.all(deletePromises);
  } catch (err) {
    console.log(`Error deleting comment: ${err.message}`);
  }
};

export const reportComment = async (req, res) => {
  try {
    const reportUserId = req.user.id;
    const report = await User.findById(reportUserId);
    const commentId = req.params.id;
    const existingBlog = await Comment.findById(commentId);
    if (!existingBlog) {
      return res.status(404).json({ error: "Comment not found" });
    }
    await Comment.findByIdAndUpdate(commentId, {
      $set: { isReport: true, reportUser: report._id },
    });
    return res.status(200).json({ message: "Comment report successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const removeReportComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const existingBlog = await Comment.findById(commentId);
    console.log(commentId);
    if (!existingBlog) {
      return res.status(404).json({ error: "Comment not found" });
    }
    await Comment.findByIdAndUpdate(commentId, {
      $set: { isReport: false, reportUser: null },
    });
    return res
      .status(200)
      .json({ message: "Comment delete report successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
