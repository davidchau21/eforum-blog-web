import { BaseController } from "../BaseController.js";
import adminBlogService from "../../service/admin/adminBlogService.js";

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
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deleteBlog(req, res) {
    try {
      const { id } = req.params;
      const result = await adminBlogService.deleteBlog(id);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async removeReportBlog(req, res) {
    try {
      const { id } = req.params;
      await adminBlogService.removeReportBlog(id);
      return this.sendSuccess(res, "Report removed successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminBlogController();
