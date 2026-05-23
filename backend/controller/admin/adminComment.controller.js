import { BaseController } from "../BaseController.js";
import adminCommentService from "../../service/admin/adminCommentService.js";
import adminActivityLogService from "../../service/admin/adminActivityLogService.js";

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

      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "COMMENT_DELETE",
        targetType: "Comment",
        targetId: id,
        details: `Xóa bình luận vi phạm (ID: ${id})`,
        ip: req.ip,
      });

      return this.sendSuccess(res, "Comment deleted successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async removeReportComment(req, res) {
    try {
      const { id } = req.params;
      await adminCommentService.removeReportComment(id);

      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "COMMENT_REPORT_RESOLVE",
        targetType: "Comment",
        targetId: id,
        details: `Gỡ bỏ báo cáo vi phạm cho bình luận (ID: ${id})`,
        ip: req.ip,
      });

      return this.sendSuccess(res, "Report removed successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminCommentController();
