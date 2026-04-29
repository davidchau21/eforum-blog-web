import { BaseController } from "./BaseController.js";
import alertService from "../service/alert.service.js";

class AlertController extends BaseController {

  async getAllAlerts(req, res) {
    try {
      const result = await alertService.getAllAlerts(req.query);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getAlertById(req, res) {
    try {
      const { id } = req.params;
      const result = await alertService.getAlertById(id);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

}

export default new AlertController();
