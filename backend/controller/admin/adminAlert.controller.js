import { BaseController } from "../BaseController.js";
import adminAlertService from "../../service/admin/adminAlertService.js";

class AdminAlertController extends BaseController {
  async createAlert(req, res) {
    try {
      const adminId = req.user.id;
      const result = await adminAlertService.createAlert(adminId, req.body);
      return this.sendSuccess(res, { message: "Notification created successfully.", alert: result });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deleteAlert(req, res) {
    try {
      const { id } = req.params;
      await adminAlertService.deleteAlert(id);
      return this.sendSuccess(res, "Alert deleted successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminAlertController();
