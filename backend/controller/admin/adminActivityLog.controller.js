import { BaseController } from "../BaseController.js";
import adminActivityLogService from "../../service/admin/adminActivityLogService.js";

class AdminActivityLogController extends BaseController {
  async getActivityLogs(req, res) {
    try {
      const result = await adminActivityLogService.getActivityLogs(req.query);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminActivityLogController();
