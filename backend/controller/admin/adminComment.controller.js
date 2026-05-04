import { BaseController } from "../BaseController.js";
import adminCommentService from "../../service/admin/adminCommentService.js";

class AdminCommentController extends BaseController {
  async getAllComments(req, res) {
    try {
      const result = await adminCommentService.getAllComments(req.query);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deleteComment(req, res) {
    try {
      const { id } = req.params;
      await adminCommentService.deleteComment(id);
      return this.sendSuccess(res, "Comment deleted successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async removeReportComment(req, res) {
    try {
      const { id } = req.params;
      await adminCommentService.removeReportComment(id);
      return this.sendSuccess(res, "Report removed successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminCommentController();
