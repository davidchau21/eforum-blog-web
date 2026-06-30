import { BaseController } from "../BaseController.js";
import adminGroupService from "../../service/admin/adminGroupService.js";
import adminActivityLogService from "../../service/admin/adminActivityLogService.js";

class AdminGroupController extends BaseController {
  async listGroups(req, res) {
    try {
      const result = await adminGroupService.getAllGroupsForAdmin(req.query);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async toggleGroupStatus(req, res) {
    try {
      const { id } = req.params;
      const result = await adminGroupService.toggleGroupStatus(id);

      await adminActivityLogService.log({
        userId: req.user.id,
        action: "GROUP_DISABLE",
        targetType: "Group",
        targetId: id,
        details: result.isDisabled
          ? `Vô hiệu hóa nhóm học tập (ID: ${id})`
          : `Kích hoạt lại nhóm học tập (ID: ${id})`,
        ip: req.ip,
      });

      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deleteGroup(req, res) {
    try {
      const { id } = req.params;
      const result = await adminGroupService.deleteGroup(id);

      await adminActivityLogService.log({
        userId: req.user.id,
        action: "GROUP_DELETE",
        targetType: "Group",
        targetId: id,
        details: `Xóa vĩnh viễn nhóm học tập (ID: ${id})`,
        ip: req.ip,
      });

      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminGroupController();
