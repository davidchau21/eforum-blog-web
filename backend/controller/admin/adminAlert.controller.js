import { BaseController } from "../BaseController.js";
import adminAlertService from "../../service/admin/adminAlertService.js";
import adminActivityLogService from "../../service/admin/adminActivityLogService.js";

class AdminAlertController extends BaseController {
  async createAlert(req, res) {
    try {
      const adminId = req.user.id;
      const result = await adminAlertService.createAlert(adminId, req.body);
      
      // Log dynamic action
      await adminActivityLogService.log({
        userId: adminId,
        action: "ALERT_PUBLISH",
        targetType: "Notification",
        targetId: result._id,
        details: `Phát sóng thông báo mới: "${result.message}" tới ${result.notification_for.length} người nhận`,
        ip: req.ip,
      });

      return this.sendSuccess(res, { message: "Notification created successfully.", alert: result });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deleteAlert(req, res) {
    try {
      const { id } = req.params;
      await adminAlertService.deleteAlert(id);

      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "ALERT_DELETE",
        targetType: "Notification",
        targetId: id,
        details: `Xóa thông báo hệ thống (ID: ${id})`,
        ip: req.ip,
      });

      return this.sendSuccess(res, "Alert deleted successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminAlertController();
