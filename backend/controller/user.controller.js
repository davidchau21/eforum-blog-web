import { BaseController } from "./BaseController.js";
import userService from "../service/user.service.js";

class UserController extends BaseController {
  async getUserForSidebar(req, res) {
    try {
      const loggedInUserId = req.user.id;
      const result = await userService.getUsersForSidebar(loggedInUserId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async toggleFollow(req, res) {
    try {
      const followerId = req.user.id;
      const { target_id } = req.body;
      const result = await userService.toggleFollow(followerId, target_id);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async searchUsers(req, res) {
    try {
      const { query } = req.body;
      const users = await userService.searchUsers(query);
      return this.sendSuccess(res, { users });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getProfile(req, res) {
    try {
      const { username } = req.body;
      const user = await userService.getProfile(username);
      return this.sendSuccess(res, user);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async updateProfileImg(req, res) {
    try {
      const userId = req.user.id;
      const { url } = req.body;
      const result = await userService.updateProfileImg(userId, url);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const result = await userService.updateProfile(userId, req.body);
      return this.sendSuccess(res, result);
    } catch (error) {
      if (error.message.includes("E11000") || error.message.includes("already exists")) {
        return this.sendError(res, "Username already exists", 409);
      }
      return this.sendError(res, error.message);
    }
  }

  async getFollowingStatus(req, res) {
    try {
      const followerId = req.user.id;
      const { target_id } = req.body;
      const result = await userService.getFollowingStatus(followerId, target_id);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getFollowers(req, res) {
    try {
      const { user_id, page, limit } = req.query;
      const result = await userService.getFollowers(user_id, page, limit);
      return this.sendSuccess(res, { followers: result });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getFollowing(req, res) {
    try {
      const { user_id, page, limit } = req.query;
      const result = await userService.getFollowingList(user_id, page, limit);
      return this.sendSuccess(res, { following: result });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async userOnline(req, res) {
    try {
      const userId = req.user.id;
      const { socketId } = req.body;
      await userService.setSocketId(userId, socketId);
      return this.sendSuccess(res, "User is online");
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new UserController();
