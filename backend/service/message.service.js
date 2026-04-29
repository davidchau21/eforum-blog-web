import Message from "../Schema/Message.js";
import Conversation from "../Schema/Conversation.js";
import EE from "../socket/eventManager.js";

class MessageService {
  async sendMessage(senderId, receiverId, { message, type }) {
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      type,
    });

    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    EE.emit('new-message', conversation.participants, newMessage);

    return newMessage;
  }

  async getMessages(senderId, userToMessage, { limit = 10, page = 1 }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({
      $or: [
        { senderId, receiverId: userToMessage },
        { senderId: userToMessage, receiverId: senderId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const unreadMessageIds = messages
      .filter((m) => m.receiverId.toString() === senderId.toString() && !m.seen)
      .map((m) => m._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany({ _id: { $in: unreadMessageIds } }, { $set: { seen: true } });
    }

    return messages.reverse();
  }

  async getNewMessagesCount(userId) {
    return await Message.countDocuments({
      receiverId: userId,
      seen: false,
    });
  }
}

export default new MessageService();
