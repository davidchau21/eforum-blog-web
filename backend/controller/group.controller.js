import { BaseController } from "./BaseController.js";
import groupService from "../service/group.service.js";

class GroupController extends BaseController {
  async createGroup(req, res) {
    try {
      const userId = req.user.id;
      const result = await groupService.createGroup(userId, req.body);
      return this.sendSuccess(res, result, 201);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getGroups(req, res) {
    try {
      const { search, page, limit, joinedOnly, filter } = req.query;
      const userId = req.user ? req.user.id : null;

      let filterVal = filter || "all";
      if (joinedOnly === "true" || joinedOnly === true) {
        filterVal = "mine";
      }

      const result = await groupService.getGroups(
        search,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 10,
        userId,
        filterVal
      );
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getGroupById(req, res) {
    try {
      const groupId = req.params.id;
      const userId = req.user ? req.user.id : null;
      const result = await groupService.getGroupById(groupId, userId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async joinGroup(req, res) {
    try {
      const groupId = req.params.id;
      const userId = req.user.id;
      const result = await groupService.joinGroup(groupId, userId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async leaveGroup(req, res) {
    try {
      const groupId = req.params.id;
      const userId = req.user.id;
      const result = await groupService.leaveGroup(groupId, userId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getMembers(req, res) {
    try {
      const groupId = req.params.id;
      const requesterId = req.user ? req.user.id : null;
      const { status, page, limit } = req.query;
      const result = await groupService.getMembers(
        groupId,
        requesterId,
        status || "JOINED",
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 20
      );
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async approveMember(req, res) {
    try {
      const groupId = req.params.id;
      const targetUserId = req.params.userId;
      const requesterId = req.user.id;
      const result = await groupService.approveMemberRequest(groupId, targetUserId, requesterId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async removeMember(req, res) {
    try {
      const groupId = req.params.id;
      const targetUserId = req.params.userId;
      const requesterId = req.user.id;
      const result = await groupService.removeMember(groupId, targetUserId, requesterId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async updateMemberRole(req, res) {
    try {
      const groupId = req.params.id;
      const targetUserId = req.params.userId;
      const { role } = req.body;
      const requesterId = req.user.id;
      const result = await groupService.updateMemberRole(groupId, targetUserId, role, requesterId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async updateGroupSettings(req, res) {
    try {
      const groupId = req.params.id;
      const requesterId = req.user.id;
      const result = await groupService.updateGroupSettings(groupId, req.body, requesterId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getGroupBlogs(req, res) {
    try {
      const groupId = req.params.id;
      const { search, page, limit, author } = req.query;
      const userId = req.user ? req.user.id : null;
      const result = await groupService.getGroupBlogs(
        groupId,
        search,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 6,
        userId,
        author
      );
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getUserGroupBlogs(req, res) {
    try {
      const groupId = req.params.id;
      const requesterId = req.user.id;
      const { filter, page, limit, search } = req.query;
      const result = await groupService.getUserGroupBlogs(
        groupId,
        requesterId,
        {
          filter,
          page: page ? parseInt(page) : 1,
          limit: limit ? parseInt(limit) : 6,
          search
        }
      );
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getGroupDocuments(req, res) {
    try {
      const groupId = req.params.id;
      const { search, page, limit } = req.query;
      const userId = req.user ? req.user.id : null;
      const result = await groupService.getGroupDocuments(
        groupId,
        search,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 6,
        userId
      );
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async deleteGroup(req, res) {
    try {
      const groupId = req.params.id;
      const userId = req.user.id;
      const result = await groupService.deleteGroup(groupId, userId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async inviteMember(req, res) {
    try {
      const groupId = req.params.id;
      const { targetUserId } = req.body;
      const requesterId = req.user.id;
      const result = await groupService.inviteMember(groupId, targetUserId, requesterId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async toggleMuteNotifications(req, res) {
    try {
      const groupId = req.params.id;
      const userId = req.user.id;
      const result = await groupService.toggleMuteNotifications(groupId, userId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getPendingBlogs(req, res) {
    try {
      const groupId = req.params.id;
      const requesterId = req.user.id;
      const result = await groupService.getPendingBlogs(groupId, requesterId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async approveBlog(req, res) {
    try {
      const groupId = req.params.id;
      const blogId = req.params.blogId;
      const requesterId = req.user.id;
      const result = await groupService.approveGroupBlog(groupId, blogId, requesterId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async rejectBlog(req, res) {
    try {
      const groupId = req.params.id;
      const blogId = req.params.blogId;
      const requesterId = req.user.id;
      const result = await groupService.rejectGroupBlog(groupId, blogId, requesterId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getGroupStats(req, res) {
    try {
      const groupId = req.params.id;
      const requesterId = req.user.id;
      const { range, startDate, endDate } = req.query;
      const result = await groupService.getGroupStats(groupId, requesterId, range, startDate, endDate);
      return this.sendSuccess(res, result);
    } catch (error) {
      // If it's a permission denied error, return 403 Forbidden
      const status = error.message.includes("quyền") ? 403 : 400;
      return this.sendError(res, error.message, status);
    }
  }

  async getTrendingGroups(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 5;
      const result = await groupService.getTrendingGroups(limit);
      return this.sendSuccess(res, { groups: result });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new GroupController();
