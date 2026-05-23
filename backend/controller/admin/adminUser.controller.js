import { BaseController } from "../BaseController.js";
import adminUserService from "../../service/admin/adminUserService.js";
import adminActivityLogService from "../../service/admin/adminActivityLogService.js";

class AdminUserController extends BaseController {
  async getAllUsers(req, res) {
    try {
      const result = await adminUserService.getAllUsers(req.query);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async findUserById(req, res) {
    try {
      const { id } = req.params;
      const result = await adminUserService.findUserById(id);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async createUser(req, res) {
    try {
      const result = await adminUserService.createUser(req.body);
      
      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "USER_CREATE",
        targetType: "User",
        targetId: result._id,
        details: `Tạo tài khoản mới: "${result.personal_info.fullname}" (@${result.personal_info.username})`,
        ip: req.ip,
      });

      return this.sendSuccess(res, "User created successfully");
    } catch (error) {
      if (error.code === 11000) {
        return this.sendError(res, "Email already exists", 409);
      }
      return this.sendError(res, error.message);
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const result = await adminUserService.updateUser(id, req.body);

      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "USER_UPDATE",
        targetType: "User",
        targetId: id,
        details: `Cập nhật thông tin tài khoản: "${result.personal_info.fullname}" (@${result.personal_info.username})`,
        ip: req.ip,
      });

      return this.sendSuccess(res, "User updated successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async toggleBlockComment(req, res) {
    try {
      const { id } = req.params;
      const result = await adminUserService.toggleBlockComment(id);

      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "USER_BLOCK",
        targetType: "User",
        targetId: id,
        details: `${result.status === "blocked" ? "Khóa" : "Mở khóa"} quyền bình luận của tài khoản (ID: ${id})`,
        ip: req.ip,
      });

      return this.sendSuccess(res, `User ${result.status} successfully`);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getMyProfile(req, res) {
    try {
      const userId = req.user.id;
      const result = await adminUserService.getMyProfile(userId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async toggleDisableUser(req, res) {
    try {
      const { id } = req.params;
      const result = await adminUserService.toggleDisableUser(id);

      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "USER_BLOCK",
        targetType: "User",
        targetId: id,
        details: `${result.status === "disabled" ? "Khóa" : "Mở khóa"} hoạt động tài khoản (ID: ${id})`,
        ip: req.ip,
      });

      return this.sendSuccess(res, `User ${result.status} successfully`);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await adminUserService.deleteUser(id);

      // Log dynamic action
      await adminActivityLogService.log({
        userId: req.user.id,
        action: "USER_DELETE",
        targetType: "User",
        targetId: id,
        details: `Xóa tài khoản thành viên (ID: ${id})`,
        ip: req.ip,
      });

      return this.sendSuccess(res, "User deleted successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminUserController();
