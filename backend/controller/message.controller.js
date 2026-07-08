import { BaseController } from "./BaseController.js";
import messageService from "../service/message.service.js";

class MessageController extends BaseController {
  async sendMessage(req, res) {
    try {
      const { id: receiverId } = req.params;
      const senderId = req.user.id;
      const result = await messageService.sendMessage(senderId, receiverId, req.body);
      return this.sendSuccess(res, result, 201);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getMessages(req, res) {
    try {
      const { id: userToMessage } = req.params;
      const senderId = req.user.id;
      const result = await messageService.getMessages(senderId, userToMessage, req.query);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getNewMessagesCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await messageService.getNewMessagesCount(userId);
      return this.sendSuccess(res, { new_messages_available: count });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deleteConversation(req, res) {
    try {
      const { id: otherUserId } = req.params;
      const userId = req.user.id;
      const result = await messageService.deleteConversation(userId, otherUserId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getConversationMedia(req, res) {
    try {
      const { id: otherUserId } = req.params;
      const userId = req.user.id;
      const media = await messageService.getConversationMedia(userId, otherUserId);
      return this.sendSuccess(res, media);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async createGroupConversation(req, res) {
    try {
      const creatorId = req.user.id;
      const { groupName, participantIds, groupAvatar } = req.body;
      if (!groupName || !participantIds || !Array.isArray(participantIds)) {
        return this.sendBadRequest(res, "Missing group name or participants");
      }
      const group = await messageService.createGroupConversation(creatorId, groupName, participantIds, groupAvatar);
      return this.sendSuccess(res, group, 201);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async sendGroupMessage(req, res) {
    try {
      const { conversationId } = req.params;
      const senderId = req.user.id;
      const message = await messageService.sendGroupMessage(senderId, conversationId, req.body);
      return this.sendSuccess(res, message, 201);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getGroupMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const senderId = req.user.id;
      const messages = await messageService.getGroupMessages(senderId, conversationId, req.query);
      return this.sendSuccess(res, messages);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getGroupInfo(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      const group = await messageService.getGroupInfo(userId, conversationId);
      return this.sendSuccess(res, group);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async leaveGroup(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      const result = await messageService.leaveGroup(userId, conversationId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async removeGroupMember(req, res) {
    try {
      const { conversationId } = req.params;
      const { memberId } = req.body;
      const userId = req.user.id;
      if (!memberId) {
        return this.sendBadRequest(res, "Missing member ID to remove");
      }
      const result = await messageService.removeGroupMember(userId, conversationId, memberId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async changeGroupCreator(req, res) {
    try {
      const { conversationId } = req.params;
      const { newCreatorId } = req.body;
      const userId = req.user.id;
      if (!newCreatorId) {
        return this.sendBadRequest(res, "Missing new creator ID");
      }
      const result = await messageService.changeGroupCreator(userId, conversationId, newCreatorId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async addGroupMembers(req, res) {
    try {
      const { conversationId } = req.params;
      const { participantIds } = req.body;
      const userId = req.user.id;
      if (!participantIds || !Array.isArray(participantIds)) {
        return this.sendBadRequest(res, "Missing participantIds array");
      }
      const result = await messageService.addGroupMembers(userId, conversationId, participantIds);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async toggleInvitePermission(req, res) {
    try {
      const { conversationId } = req.params;
      const { membersCanInvite } = req.body;
      const userId = req.user.id;
      if (membersCanInvite === undefined) {
        return this.sendBadRequest(res, "Missing membersCanInvite flag");
      }
      const result = await messageService.toggleInvitePermission(userId, conversationId, membersCanInvite);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async updateGroupInfo(req, res) {
    try {
      const { conversationId } = req.params;
      const { groupName, groupAvatar, groupDescription } = req.body;
      const userId = req.user.id;
      const result = await messageService.updateGroupInfo(userId, conversationId, { groupName, groupAvatar, groupDescription });
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async disbandGroup(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      const result = await messageService.disbandGroup(userId, conversationId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new MessageController();
