import { BaseController } from "./BaseController.js";
import chatService from "../service/chat.service.js";

class ChatController extends BaseController {
  async handleSupportChat(req, res) {
    const { message } = req.body;
    
    if (!message || message.trim() === "") {
      return this.sendError(res, "Message is required", 400);
    }

    try {
      const response = await chatService.getSupportChatResponseStream(message);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const reader = response.body.getReader();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          res.write(value);
        }
      }

      res.end();

    } catch (error) {
      console.error("Error in RAG Chatbot:", error.message);
      return this.sendError(res, "Đã xảy ra lỗi khi kết nối với máy chủ AI: " + error.message);
    }
  }
}

export default new ChatController();
