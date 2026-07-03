import Message from "../Schema/Message.js";
import Conversation from "../Schema/Conversation.js";
import User from "../Schema/User.js";
import EE from "../socket/eventManager.js";

class MessageService {
  async sendMessage(senderId, receiverId, { message, type }) {
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    const isNewConversation = !conversation;
    let wasSoftDeletedForSender = false;
    let wasSoftDeletedForReceiver = false;

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    } else {
      // If conversation already exists but was soft-deleted by sender or receiver, restore it
      if (conversation.deleted_by && conversation.deleted_by.length > 0) {
        const senderIdx = conversation.deleted_by.findIndex(id => id.toString() === senderId.toString());
        if (senderIdx > -1) {
          conversation.deleted_by.splice(senderIdx, 1);
          wasSoftDeletedForSender = true;
        }

        const receiverIdx = conversation.deleted_by.findIndex(id => id.toString() === receiverId.toString());
        if (receiverIdx > -1) {
          conversation.deleted_by.splice(receiverIdx, 1);
          wasSoftDeletedForReceiver = true;
        }

        await conversation.save();
      }
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId,
      message,
      type,
    });

    await newMessage.save();

    EE.emit("new-message", conversation.participants, newMessage);

    // If this is the first message or it was soft-deleted, notify to restore/add in sidebar
    if (isNewConversation || wasSoftDeletedForSender || wasSoftDeletedForReceiver) {
      const [senderUser, receiverUser] = await Promise.all([
        User.findById(senderId).select("-personal_info.password -personal_info.email"),
        User.findById(receiverId).select("-personal_info.password -personal_info.email"),
      ]);

      // Payload for sender's sidebar: the receiver's entry with conversation metadata
      const senderPayload = {
        ...receiverUser.toObject(),
        conversation: conversation._id,
        last_message: type === "text" ? message : "[File]",
        last_message_time: newMessage.createdAt,
        last_message_sender: senderId,
        unread_count: 0,
      };

      // Payload for receiver's sidebar: the sender's entry with conversation metadata
      const receiverPayload = {
        ...senderUser.toObject(),
        conversation: conversation._id,
        last_message: type === "text" ? message : "[File]",
        last_message_time: newMessage.createdAt,
        last_message_sender: senderId,
        unread_count: 1,
      };

      if (isNewConversation || wasSoftDeletedForSender) {
        EE.emit("new-conversation", senderId, senderPayload);
      }
      if (isNewConversation || wasSoftDeletedForReceiver) {
        EE.emit("new-conversation", receiverId, receiverPayload);
      }
    }

    return newMessage;
  }


  async getMessages(senderId, userToMessage, { limit = 10, page = 1 }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToMessage] },
    });

    if (!conversation) return [];

    // If the conversation was soft-deleted by the sender, restore it when they view the messages again
    if (conversation.deleted_by && conversation.deleted_by.length > 0) {
      const senderIdx = conversation.deleted_by.findIndex(id => id.toString() === senderId.toString());
      if (senderIdx > -1) {
        conversation.deleted_by.splice(senderIdx, 1);
        await conversation.save();

        // Emit new-conversation event to refresh sender's sidebar immediately
        const senderUser = await User.findById(senderId).select("-personal_info.password -personal_info.email");
        const receiverUser = await User.findById(userToMessage).select("-personal_info.password -personal_info.email");
        
        // Find last message to construct sidebar item preview
        const lastMsgDoc = await Message.findOne({ conversationId: conversation._id }).sort({ createdAt: -1 });

        const senderPayload = {
          ...receiverUser.toObject(),
          conversation: conversation._id,
          last_message: lastMsgDoc ? (lastMsgDoc.type === "text" ? lastMsgDoc.message : "[File]") : "",
          last_message_time: lastMsgDoc ? lastMsgDoc.createdAt : conversation.updatedAt,
          last_message_sender: lastMsgDoc ? lastMsgDoc.senderId : null,
          unread_count: 0,
        };

        EE.emit("new-conversation", senderId, senderPayload);
      }
    }

    const messages = await Message.find({
      conversationId: conversation._id,
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

  async deleteConversation(userId, otherUserId) {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Verify the requester is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new Error("Unauthorized");
    }

    // Soft-delete: mark this user as having deleted the conversation
    const alreadyDeleted = conversation.deleted_by?.some(
      (id) => id.toString() === userId.toString()
    );

    if (!alreadyDeleted) {
      conversation.deleted_by = conversation.deleted_by || [];
      conversation.deleted_by.push(userId);
      await conversation.save();
    }

    // If ALL participants have deleted → physically remove everything
    const allDeleted = conversation.participants.every((p) =>
      conversation.deleted_by.some((id) => id.toString() === p.toString())
    );

    if (allDeleted) {
      await Message.deleteMany({ conversationId: conversation._id });
      await Conversation.findByIdAndDelete(conversation._id);
    }

    return { success: true, conversationId: conversation._id };
  }

  async getConversationMedia(userId, otherUserId) {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation) return [];

    // Query all messages that are either attachments (non-text) OR text messages containing HTTP/HTTPS links
    const messages = await Message.find({
      conversationId: conversation._id,
      $or: [
        { type: { $ne: "text" } },
        {
          type: "text",
          message: { $regex: /https?:\/\/[^\s]+/i },
        },
      ],
    }).sort({ createdAt: -1 });

    return messages;
  }
}

export default new MessageService();
