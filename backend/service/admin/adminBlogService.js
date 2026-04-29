import Blog from "../../Schema/Blog.js";
import Notification from "../../Schema/Notification.js";
import Comment from "../../Schema/Comment.js";
import SavedBlog from "../../Schema/SavedBlog.js";
import User from "../../Schema/User.js";

class AdminBlogService {
  /**
   * Admin: Get all blogs with filters
   */
  async getAllBlogsForAdmin({ isDraft, isActive, title, tags, page = 0, limit = 10, isReport }) {
    const findQuery = { isDeleted: { $in: [false, null] } };
    
    // Parse boolean strings if they come from query params
    if (isDraft !== undefined) findQuery.draft = isDraft === 'true' || isDraft === true;
    if (isActive !== undefined) findQuery.isActive = isActive === 'true' || isActive === true;
    if (title) findQuery.title = { $regex: title, $options: "i" };
    if (tags) findQuery.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (isReport !== undefined) findQuery.isReport = isReport === 'true' || isReport === true;

    const blogs = await Blog.find(findQuery)
      .sort({ publishedAt: -1 })
      .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
      .populate("reportUser", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
      .select("blog_id title des banner activity tags publishedAt isActive isDeleted isReport")
      .skip(page * limit)
      .limit(limit);

    const total = await Blog.countDocuments(findQuery);
    return { list: blogs, total };
  }

  /**
   * Admin: Toggle activation status
   */
  async toggleActivation(blog_id) {
    const blog = await Blog.findOne({ blog_id });
    if (!blog) throw new Error("Blog not found");

    blog.isActive = !blog.isActive;
    await blog.save();
    return { message: `Blog ${blog.isActive ? "activated" : "deactivated"} successfully` };
  }

  /**
   * Admin: Force delete a blog
   */
  async deleteBlog(blog_id) {
    const blog = await Blog.findOneAndDelete({ blog_id });
    if (!blog) throw new Error("Blog not found");

    // Delete associated data
    await Notification.deleteMany({ blog: blog._id });
    await Comment.deleteMany({ blog_id: blog._id });
    await SavedBlog.deleteMany({ blog: blog._id });

    // Decrement post count for author
    await User.findOneAndUpdate(
      { _id: blog.author },
      { $inc: { "account_info.total_posts": -1 } }
    );

    return { message: "Blog deleted successfully" };
  }

  async removeReportBlog(id) {
    return await Blog.findByIdAndUpdate(id, { $set: { isReport: false }, $unset: { reportUser: 1 } });
  }
}

export default new AdminBlogService();
