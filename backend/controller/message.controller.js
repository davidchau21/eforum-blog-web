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
}

export default new MessageController();
