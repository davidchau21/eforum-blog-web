import { BaseController } from "../BaseController.js";
import adminBlogService from "../../service/admin/adminBlogService.js";
import adminActivityLogService from "../../service/admin/adminActivityLogService.js";

class AdminBlogController extends BaseController {
  async listBlogs(req, res) {
    try {
      const result = await adminBlogService.getAllBlogsForAdmin(req.query);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async toggleActivation(req, res) {
    try {
      const { id } = req.params;
      const result = await adminBlogService.toggleActivation(id);

      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "BLOG_DISABLE",
        targetType: "Blog",
        targetId: id,
        details: `${result.draft ? "Khóa/Gỡ nháp" : "Mở khóa/Xuất bản"} bài viết (ID: ${id})`,
        ip: req.ip,
      });

      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deleteBlog(req, res) {
    try {
      const { id } = req.params;
      const result = await adminBlogService.deleteBlog(id);

      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "BLOG_DELETE",
        targetType: "Blog",
        targetId: id,
        details: `Xóa vĩnh viễn bài viết (ID: ${id})`,
        ip: req.ip,
      });

      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async removeReportBlog(req, res) {
    try {
      const { id } = req.params;
      await adminBlogService.removeReportBlog(id);

      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "BLOG_REPORT_RESOLVE",
        targetType: "Blog",
        targetId: id,
        details: `Gỡ bỏ báo cáo vi phạm cho bài viết (ID: ${id})`,
        ip: req.ip,
      });

      return this.sendSuccess(res, "Report removed successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminBlogController();
