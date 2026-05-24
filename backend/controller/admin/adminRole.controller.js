import { BaseController } from "../BaseController.js";
import adminRoleService from "../../service/admin/adminRoleService.js";
import adminActivityLogService from "../../service/admin/adminActivityLogService.js";

class AdminRoleController extends BaseController {
  async getAllRoles(req, res) {
    try {
      const result = await adminRoleService.getAllRoles();
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getAllPermissions(req, res) {
    try {
      const result = await adminRoleService.getAllPermissions();
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async createRole(req, res) {
    try {
      const result = await adminRoleService.createRole(req.body);
      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "ROLE_CREATE",
        targetType: "Role",
        targetId: result._id,
        details: `Tạo vai trò mới: "${result.role_name}"`,
        ip: req.ip,
      });
      return this.sendSuccess(res, result, 201);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async updateRolePermissions(req, res) {
    try {
      const { id } = req.params;
      const result = await adminRoleService.updateRolePermissions(id, req.body);
      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "ROLE_UPDATE",
        targetType: "Role",
        targetId: id,
        details: `Cập nhật quyền hạn cho vai trò: "${result.role_name}"`,
        ip: req.ip,
      });
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      await adminRoleService.deleteRole(id);
      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "ROLE_DELETE",
        targetType: "Role",
        targetId: id,
        details: `Xóa vai trò tùy chỉnh (ID: ${id})`,
        ip: req.ip,
      });
      return this.sendSuccess(res, "Role deleted successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async createPermission(req, res) {
    try {
      const result = await adminRoleService.createPermission(req.body);
      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "PERMISSION_CREATE",
        targetType: "Permission",
        targetId: result._id,
        details: `Tạo quyền hạn mới: "${result.permission_name}" (${result.permission_code}) trong nhóm: "${result.module_name}"`,
        ip: req.ip,
      });
      return this.sendSuccess(res, result, 201);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async updatePermission(req, res) {
    try {
      const { id } = req.params;
      const result = await adminRoleService.updatePermission(id, req.body);
      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "PERMISSION_UPDATE",
        targetType: "Permission",
        targetId: id,
        details: `Cập nhật thông tin quyền hạn: "${result.permission_name}" (${result.permission_code})`,
        ip: req.ip,
      });
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deletePermission(req, res) {
    try {
      const { id } = req.params;
      const result = await adminRoleService.deletePermission(id);
      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "PERMISSION_DELETE",
        targetType: "Permission",
        targetId: id,
        details: `Xóa quyền hệ thống: "${result.permission_name}" (${result.permission_code})`,
        ip: req.ip,
      });
      return this.sendSuccess(res, "Permission deleted successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminRoleController();
