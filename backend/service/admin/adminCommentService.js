import Comment from "../../Schema/Comment.js";

class AdminCommentService {
  async getAllComments({ page = 0, limit = 10, isReport }) {
    const query = {};
    if (isReport === "true" || isReport === true) {
      query.isReport = true;
    }
    const list = await Comment.find(query)
      .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
      .populate("blog_id", "title")
      .sort({ commentedAt: -1 })
      .skip(Number(page) * Number(limit))
      .limit(Number(limit));
    const total = await Comment.countDocuments(query);
    return { list, total };
  }

  async deleteComment(id) {
    // Note: Recursive deletion might be better, but for now simple delete
    return await Comment.findByIdAndDelete(id);
  }

  async removeReportComment(id) {
    return await Comment.findByIdAndUpdate(id, { $set: { isReport: false }, $unset: { reportUser: 1 } });
  }
}

export default new AdminCommentService();
