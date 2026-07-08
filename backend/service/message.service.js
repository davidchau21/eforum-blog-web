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

  async deleteConversation(userId, targetId) {
    // 1. Try finding by conversation ID first (works for group chats)
    let conversation = null;
    try {
      conversation = await Conversation.findById(targetId);
    } catch (e) {
      // Ignore cast errors for non-object IDs
    }

    // 2. Fallback to participant search for 1-1 chats (where targetId is otherUserId)
    if (!conversation) {
      conversation = await Conversation.findOne({
        participants: { $all: [userId, targetId] },
        isGroup: false,
      });
    }

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

  // Create a new group conversation
  async createGroupConversation(creatorId, groupName, participantIds, groupAvatar = "") {
    // Add creator to the participants list if not already there
    const uniqueParticipants = Array.from(
      new Set([creatorId.toString(), ...participantIds.map((id) => id.toString())])
    );

    const conversation = await Conversation.create({
      participants: uniqueParticipants,
      isGroup: true,
      groupName,
      groupAvatar,
      creator: creatorId,
    });

    // Enrich conversation creator details for sidebar notification
    const creatorUser = await User.findById(creatorId).select(
      "-personal_info.password -personal_info.email"
    );

    // Payload sent to all participants to add to their sidebars
    const groupPayload = {
      _id: conversation._id, // Group conversation ID
      isGroup: true,
      personal_info: {
        fullname: groupName,
        username: `group_${conversation._id}`,
        profile_img: groupAvatar || "https://cdn-icons-png.flaticon.com/512/166/166258.png", // Default group avatar
      },
      conversation: conversation._id,
      last_message: "Nhóm đã được tạo",
      last_message_time: conversation.createdAt,
      last_message_sender: creatorId,
      unread_count: 0,
    };

    // Emit socket event to all group participants
    for (const participantId of uniqueParticipants) {
      EE.emit("new-conversation", participantId, groupPayload);
    }

    return conversation;
  }

  // Send a message to a group conversation
  async sendGroupMessage(senderId, conversationId, { message, type }) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Group conversation not found");
    }

    // Verify sender is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === senderId.toString()
    );
    if (!isParticipant) {
      throw new Error("Unauthorized");
    }

    // If conversation was soft-deleted by any members, pull them back
    let wasSoftDeletedUpdated = false;
    if (conversation.deleted_by && conversation.deleted_by.length > 0) {
      conversation.deleted_by = conversation.deleted_by.filter(
        (id) => id.toString() !== senderId.toString()
      );
      // Also restore it for other participants who had hidden it, since there's new activity
      conversation.deleted_by = [];
      wasSoftDeletedUpdated = true;
      await conversation.save();
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId,
      message,
      type,
    });

    await newMessage.save();

    // Populate sender details for socket emission in group chat
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "personal_info.fullname personal_info.profile_img personal_info.username"
    );

    const formattedMessage = populatedMessage.toObject();
    if (populatedMessage.senderId) {
      formattedMessage.senderName = populatedMessage.senderId.personal_info?.fullname;
      formattedMessage.senderAvatar = populatedMessage.senderId.personal_info?.profile_img;
      formattedMessage.senderUsername = populatedMessage.senderId.personal_info?.username;
      formattedMessage.senderId = populatedMessage.senderId._id;
    }

    // Socket: Emit newMessage to room
    EE.emit("new-message", conversation.participants, formattedMessage);

    // If restored/first message, refresh sidebar lists
    const senderUser = await User.findById(senderId).select(
      "-personal_info.password -personal_info.email"
    );

    const groupPayload = {
      _id: conversation._id,
      isGroup: true,
      personal_info: {
        fullname: conversation.groupName,
        username: `group_${conversation._id}`,
        profile_img: conversation.groupAvatar || "https://cdn-icons-png.flaticon.com/512/166/166258.png",
      },
      conversation: conversation._id,
      last_message: type === "text" ? message : "[File]",
      last_message_time: newMessage.createdAt,
      last_message_sender: senderId,
    };

    for (const participantId of conversation.participants) {
      // Calculate actual unread count for this participant
      const pUnreadCount = await Message.countDocuments({
        conversationId: conversation._id,
        senderId: { $ne: participantId },
        readBy: { $ne: participantId },
      });

      // Emit to refresh sidebar with latest message
      EE.emit("new-conversation", participantId, {
        ...groupPayload,
        unread_count: pUnreadCount,
      });
    }

    return newMessage;
  }

  // Get messages for a group chat
  async getGroupMessages(senderId, conversationId, { limit = 10, page = 1 }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Group conversation not found");
    }

    // Verify sender is participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === senderId.toString()
    );
    if (!isParticipant) {
      throw new Error("Unauthorized");
    }

    // Mark group messages as read by the sender
    await Message.updateMany(
      {
        conversationId: conversation._id,
        senderId: { $ne: senderId },
        readBy: { $ne: senderId },
      },
      {
        $addToSet: { readBy: senderId },
      },
    );

    const messages = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("senderId", "personal_info.fullname personal_info.profile_img personal_info.username"); // Populate sender info for group chats

    // Map messages to attach populated sender details directly
    const formattedMessages = messages.map(m => {
      const obj = m.toObject();
      if (m.senderId) {
        obj.senderName = m.senderId.personal_info?.fullname;
        obj.senderAvatar = m.senderId.personal_info?.profile_img;
        obj.senderUsername = m.senderId.personal_info?.username;
        obj.senderId = m.senderId._id;
      }
      return obj;
    });

    return formattedMessages.reverse();
  }

  // Get all media in a conversation (1-1 or Group)
  async getConversationMedia(userId, targetId) {
    // 1. Try finding conversation directly by targetId (if targetId is conversationId)
    let conversation = await Conversation.findById(targetId);

    // 2. If not found, targetId is likely otherUserId (chat 1-1). Find by participants
    if (!conversation) {
      conversation = await Conversation.findOne({
        participants: { $all: [userId, targetId] },
      });
    }

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

  // Get group conversation details with populated participants
  async getGroupInfo(userId, conversationId) {
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "personal_info.fullname personal_info.profile_img personal_info.username");
    if (!conversation) {
      throw new Error("Group chat not found");
    }

    // Verify requesting user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new Error("Unauthorized");
    }

    return conversation;
  }

  // Leave a group chat
  async leaveGroup(userId, conversationId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Group chat not found");
    }

    if (conversation.creator.toString() === userId.toString() && conversation.participants.length > 1) {
      throw new Error("Trưởng nhóm phải chuyển quyền trưởng nhóm cho thành viên khác trước khi rời nhóm.");
    }

    const initialLength = conversation.participants.length;
    conversation.participants = conversation.participants.filter(
      (p) => p.toString() !== userId.toString()
    );

    if (conversation.participants.length === initialLength) {
      throw new Error("You are not a participant of this group");
    }

    if (conversation.participants.length === 0) {
      // Physical delete if last member leaves
      await Message.deleteMany({ conversationId: conversation._id });
      await Conversation.findByIdAndDelete(conversation._id);
    } else {
      let nextCreatorText = "";
      // If the owner leaves, transfer ownership to the next participant
      if (conversation.creator.toString() === userId.toString()) {
        conversation.creator = conversation.participants[0];
        const nextCreator = await User.findById(conversation.creator).select("personal_info.fullname");
        nextCreatorText = ` Trưởng nhóm mới: ${nextCreator?.personal_info.fullname || "Thành viên"}.`;
      }
      await conversation.save();

      // Create a system message notifying that the user left
      const leavingUser = await User.findById(userId).select("personal_info.fullname");
      const leaveText = `${leavingUser?.personal_info.fullname || "Thành viên"} đã rời khỏi nhóm.${nextCreatorText}`;

      const newMessage = new Message({
        conversationId: conversation._id,
        senderId: userId,
        message: leaveText,
        type: "system",
      });

      await newMessage.save();

      // Emit new message and notify remaining members' sidebars
      EE.emit("new-message", conversation.participants, newMessage);

      const groupPayload = {
        _id: conversation._id,
        isGroup: true,
        personal_info: {
          fullname: conversation.groupName,
          username: `group_${conversation._id}`,
          profile_img: conversation.groupAvatar || "https://cdn-icons-png.flaticon.com/512/166/166258.png",
        },
        conversation: conversation._id,
        last_message: leaveText,
        last_message_time: newMessage.createdAt,
        last_message_sender: userId,
      };

      for (const pId of conversation.participants) {
        const pUnreadCount = await Message.countDocuments({
          conversationId: conversation._id,
          senderId: { $ne: pId },
          readBy: { $ne: pId },
        });
        EE.emit("new-conversation", pId, {
          ...groupPayload,
          unread_count: pUnreadCount,
        });
      }
    }

    return { success: true };
  }

  // Remove a member from a group chat (creator only)
  async removeGroupMember(userId, conversationId, memberId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Group chat not found");
    }

    // Verify requesting user is the creator
    if (conversation.creator.toString() !== userId.toString()) {
      throw new Error("Only the group creator can remove members");
    }

    // Verify member to remove is in the group
    const initialLength = conversation.participants.length;
    conversation.participants = conversation.participants.filter(
      (p) => p.toString() !== memberId.toString()
    );

    if (conversation.participants.length === initialLength) {
      throw new Error("User is not a member of this group");
    }

    await conversation.save();

    // Create a system message notifying that the member was removed
    const removedUser = await User.findById(memberId).select("personal_info.fullname");
    const systemText = `${removedUser?.personal_info.fullname || "Thành viên"} đã bị xóa khỏi nhóm bởi trưởng nhóm.`;

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId: userId,
      message: systemText,
      type: "system",
    });

    await newMessage.save();

    // Notify remaining participants
    EE.emit("new-message", conversation.participants, newMessage);

    // Socket: Notify the removed user to remove conversation from their sidebar
    EE.emit("remove-conversation", memberId, conversation._id);

    return { success: true };
  }

  // Transfer group ownership/creator role (creator only)
  async changeGroupCreator(userId, conversationId, newCreatorId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Group chat not found");
    }

    // Verify requesting user is the creator
    if (conversation.creator.toString() !== userId.toString()) {
      throw new Error("Only the group creator can transfer ownership");
    }

    // Verify new creator is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === newCreatorId.toString()
    );
    if (!isParticipant) {
      throw new Error("New creator must be a participant of the group");
    }

    conversation.creator = newCreatorId;
    await conversation.save();

    // Create system message
    const newCreatorUser = await User.findById(newCreatorId).select("personal_info.fullname");
    const systemText = `${newCreatorUser?.personal_info.fullname || "Thành viên"} đã được bổ nhiệm làm trưởng nhóm mới.`;

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId: userId,
      message: systemText,
      type: "system",
    });

    await newMessage.save();

    // Notify all participants
    EE.emit("new-message", conversation.participants, newMessage);

    return { success: true };
  }

  // Add members to a group chat (participants allowed depending on toggle setting)
  async addGroupMembers(userId, conversationId, participantIds) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Group chat not found");
    }

    // Verify requesting user is a participant
    const isRequesterParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isRequesterParticipant) {
      throw new Error("Unauthorized");
    }

    // Check if invitation permission is disabled for non-creators
    const isCreator = conversation.creator.toString() === userId.toString();
    if (!isCreator && conversation.membersCanInvite === false) {
      throw new Error("Trưởng nhóm đã tắt tính năng tự ý mời thành viên.");
    }

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      throw new Error("Vui lòng chọn ít nhất một thành viên để thêm.");
    }

    // Find users who are not already in the group
    const currentParticipantIds = conversation.participants.map((p) => p.toString());
    const newMemberIds = participantIds.filter((pId) => !currentParticipantIds.includes(pId.toString()));

    if (newMemberIds.length === 0) {
      throw new Error("Các thành viên được chọn đều đã có mặt trong nhóm.");
    }

    // Add new member IDs to participants array
    conversation.participants.push(...newMemberIds);
    await conversation.save();

    // Fetch details of added users for system text
    const addedUsers = await User.find({ _id: { $in: newMemberIds } }).select("personal_info.fullname");
    const addedNames = addedUsers.map((u) => u.personal_info.fullname).join(", ");

    const senderUser = await User.findById(userId).select("personal_info.fullname");
    const systemText = `${senderUser?.personal_info.fullname || "Thành viên"} đã thêm ${addedNames} vào nhóm.`;

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId: userId,
      message: systemText,
      type: "system",
    });

    await newMessage.save();

    // Populate sender details for realtime emission
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "personal_info.fullname personal_info.profile_img personal_info.username"
    );
    const formattedMessage = populatedMessage.toObject();
    if (populatedMessage.senderId) {
      formattedMessage.senderName = populatedMessage.senderId.personal_info?.fullname;
      formattedMessage.senderAvatar = populatedMessage.senderId.personal_info?.profile_img;
      formattedMessage.senderUsername = populatedMessage.senderId.personal_info?.username;
      formattedMessage.senderId = populatedMessage.senderId._id;
    }

    // Notify all participants
    EE.emit("new-message", conversation.participants, formattedMessage);

    // Socket: Notify the newly added users to load the group on their sidebars
    const groupPayload = {
      _id: conversation._id,
      isGroup: true,
      personal_info: {
        fullname: conversation.groupName,
        username: `group_${conversation._id}`,
        profile_img: conversation.groupAvatar || "https://cdn-icons-png.flaticon.com/512/166/166258.png",
      },
      conversation: conversation._id,
      last_message: systemText,
      last_message_time: newMessage.createdAt,
      last_message_sender: userId,
    };

    for (const newMemberId of newMemberIds) {
      const pUnreadCount = await Message.countDocuments({
        conversationId: conversation._id,
        senderId: { $ne: newMemberId },
        readBy: { $ne: newMemberId },
      });
      EE.emit("new-conversation", newMemberId, {
        ...groupPayload,
        unread_count: pUnreadCount,
      });
    }

    return { success: true };
  }

  // Toggle invitation permission (creator only)
  async toggleInvitePermission(userId, conversationId, membersCanInvite) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Group chat not found");
    }

    // Verify requesting user is the creator
    if (conversation.creator.toString() !== userId.toString()) {
      throw new Error("Only the group creator can change invitation permissions");
    }

    conversation.membersCanInvite = membersCanInvite;
    await conversation.save();

    const statusText = membersCanInvite
      ? "cho phép tất cả thành viên mời người khác."
      : "tắt tính năng tự ý mời thành viên.";

    const systemText = `Trưởng nhóm đã ${statusText}`;

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId: userId,
      message: systemText,
      type: "system",
    });

    await newMessage.save();

    // Notify all participants
    EE.emit("new-message", conversation.participants, newMessage);

    return { success: true };
  }

  // Update group information (groupName, groupAvatar, groupDescription)
  async updateGroupInfo(userId, conversationId, { groupName, groupAvatar, groupDescription }) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Group chat not found");
    }

    // Verify requesting user is the creator
    if (conversation.creator.toString() !== userId.toString()) {
      throw new Error("Only the group creator can update group information");
    }

    let systemText = "";
    const senderUser = await User.findById(userId).select("personal_info.fullname");
    const senderName = senderUser?.personal_info.fullname || "Trưởng nhóm";

    if (groupName && groupName !== conversation.groupName) {
      conversation.groupName = groupName;
      systemText = `${senderName} đã đổi tên nhóm thành "${groupName}".`;
    }

    if (groupAvatar && groupAvatar !== conversation.groupAvatar) {
      conversation.groupAvatar = groupAvatar;
      if (systemText) {
        systemText += ` Đồng thời cập nhật ảnh đại diện của nhóm.`;
      } else {
        systemText = `${senderName} đã cập nhật ảnh đại diện của nhóm.`;
      }
    }

    // groupDescription can be empty string (clearing it), so check !== undefined
    if (groupDescription !== undefined && groupDescription !== conversation.groupDescription) {
      conversation.groupDescription = groupDescription;
      if (systemText) {
        systemText += ` Cập nhật mô tả nhóm.`;
      } else {
        systemText = `${senderName} đã cập nhật mô tả của nhóm.`;
      }
    }

    if (!systemText) {
      return { success: true, conversation };
    }

    await conversation.save();

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId: userId,
      message: systemText,
      type: "system",
    });

    await newMessage.save();

    // Notify all participants
    EE.emit("new-message", conversation.participants, newMessage);

    // Notify all participants about the updated group info
    const updatedPayload = {
      conversationId: conversation._id,
      groupName: conversation.groupName,
      groupAvatar: conversation.groupAvatar,
      groupDescription: conversation.groupDescription,
      systemText,
    };
    EE.emit("group-info-updated", conversation.participants, updatedPayload);

    return { success: true, conversation, systemText };
  }

  // Disband a group chat (creator only)
  async disbandGroup(userId, conversationId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Group chat not found");
    }

    // Verify requesting user is the creator
    if (conversation.creator.toString() !== userId.toString()) {
      throw new Error("Only the group creator can disband the group");
    }

    // Save participants for notification before deletion
    const participants = [...conversation.participants];

    // 1. Physically delete all messages in the group
    await Message.deleteMany({ conversationId: conversation._id });

    // 2. Physically delete the conversation document
    await Conversation.findByIdAndDelete(conversation._id);

    // 3. Socket: Notify all participants to remove this conversation from their sidebars
    for (const participantId of participants) {
      EE.emit("remove-conversation", participantId, conversation._id);
    }

    return { success: true };
  }
}

export default new MessageService();
