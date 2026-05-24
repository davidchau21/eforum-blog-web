import { BaseController } from "../BaseController.js";
import adminTagService from "../../service/admin/adminTagService.js";
import adminActivityLogService from "../../service/admin/adminActivityLogService.js";

class AdminTagController extends BaseController {
  async updateTag(req, res) {
    try {
      const { id } = req.params;
      const { tag_name } = req.body;
      await adminTagService.updateTag(id, req.body);

      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "CATEGORY_UPDATE",
        targetType: "Category",
        targetId: id,
        details: `Cập nhật danh mục thành: "${tag_name}"`,
        ip: req.ip,
      });

      return this.sendSuccess(res, "Tag updated successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deleteTag(req, res) {
    try {
      const { id } = req.params;
      await adminTagService.deleteTag(id);

      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "CATEGORY_DELETE",
        targetType: "Category",
        targetId: id,
        details: `Xóa danh mục (ID: ${id})`,
        ip: req.ip,
      });

      return this.sendSuccess(res, "Tag deleted successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminTagController();
