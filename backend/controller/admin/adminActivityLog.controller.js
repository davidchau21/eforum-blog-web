import { BaseController } from "../BaseController.js";
import adminActivityLogService from "../../service/admin/adminActivityLogService.js";

class AdminActivityLogController extends BaseController {
  async getActivityLogs(req, res) {
    try {
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 10;

      const result = await adminActivityLogService.getActivityLogs({ page, limit });
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminActivityLogController();
