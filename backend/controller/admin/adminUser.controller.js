import { BaseController } from "../BaseController.js";
import adminUserService from "../../service/admin/adminUserService.js";
import User from "../../Schema/User.js";

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
      await adminUserService.updateUser(id, req.body);
      return this.sendSuccess(res, "User updated successfully");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async toggleBlockComment(req, res) {
    try {
      const { id } = req.params;
      const result = await adminUserService.toggleBlockComment(id);
      return this.sendSuccess(res, `User ${result.status} successfully`);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminUserController();
