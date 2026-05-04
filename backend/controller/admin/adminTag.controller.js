import { BaseController } from "../BaseController.js";
import adminTagService from "../../service/admin/adminTagService.js";

class AdminTagController extends BaseController {
  async updateTag(req, res) {
    try {
      const { id } = req.params;
      await adminTagService.updateTag(id, req.body);
      return this.sendSuccess(res, "Tag updated successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deleteTag(req, res) {
    try {
      const { id } = req.params;
      await adminTagService.deleteTag(id);
      return this.sendSuccess(res, "Tag deleted successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminTagController();
