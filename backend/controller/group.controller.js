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
      const { search, page, limit } = req.query;
      const userId = req.user ? req.user.id : null;
      const result = await groupService.getGroupBlogs(
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
}

export default new GroupController();
