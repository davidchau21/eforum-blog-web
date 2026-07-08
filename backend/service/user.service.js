import User from "../Schema/User.js";
import UserFollow from "../Schema/UserFollow.js";
import Notification from "../Schema/Notification.js";
import Conversation from "../Schema/Conversation.js";
import Message from "../Schema/Message.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import EE from "../socket/eventManager.js";

class UserService {
  /**
   * Generate a unique username based on email
   */
  async generateUsername(email) {
    let username = email.split("@")[0];
    const isUsernameNotUnique = await User.exists({ "personal_info.username": username });
    if (isUsernameNotUnique) {
      username += nanoid().substring(0, 5);
    }
    return username;
  }

  /**
   * Create a new user
   */
  async createUser({ fullname, email, password, role }) {
    const hashed_password = await bcrypt.hash(password, 10);
    const username = await this.generateUsername(email);

    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hashed_password,
        username,
        role,
      },
      verified: true,
    });

    return await user.save();
  }

  /**
   * Update user details
   */
  async updateUser(id, { fullname, role }) {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    const updateData = {};
    if (fullname) updateData["personal_info.fullname"] = fullname;
    if (role) updateData["personal_info.role"] = role;

    return await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async searchUsers(query = "", page = 1, limit = 20, loggedInUserId = null, forGroupInvite = false) {
    const skipVal = (page - 1) * limit;

    // Normal search path (excluding followed users, etc. - used for friend discovery)
    if (!forGroupInvite) {
      let filter = {
        $or: [
          { "personal_info.username": new RegExp(query, "i") },
          { "personal_info.fullname": new RegExp(query, "i") },
          { "personal_info.email": new RegExp(query, "i") }
        ]
      };

      if (loggedInUserId) {
        const followedDocs = await UserFollow.find({ follower: loggedInUserId }).select("following -_id");
        const followedUserIds = followedDocs.map(doc => doc.following);
        const excludeIds = [loggedInUserId, ...followedUserIds];
        filter._id = { $nin: excludeIds };
      }

      return await User.find(filter)
        .skip(skipVal)
        .limit(limit)
        .select("personal_info.fullname personal_info.username personal_info.profile_img personal_info.bio");
    }

    // Group Invite search path: Prioritize friends (mutual follows) and followers, combined with search
    if (loggedInUserId) {
      // 1. Fetch user follows to determine relationships
      const followings = await UserFollow.find({ follower: loggedInUserId }).select("following -_id");
      const followingIds = followings.map(f => f.following.toString());

      const followers = await UserFollow.find({ following: loggedInUserId }).select("follower -_id");
      const followerIds = followers.map(f => f.follower.toString());

      const mutualSet = new Set(followingIds.filter(id => followerIds.includes(id)));
      const followerSet = new Set(followerIds.filter(id => !mutualSet.has(id)));

      // 2. If search query is empty, return mutual friends and followers directly
      if (!query.trim()) {
        const allSortedIds = [
          ...Array.from(mutualSet),
          ...Array.from(followerSet)
        ];
        
        if (allSortedIds.length === 0) return [];
        
        const paginatedIds = allSortedIds.slice(skipVal, skipVal + limit);
        const users = await User.find({ _id: { $in: paginatedIds } })
          .select("personal_info.fullname personal_info.username personal_info.profile_img personal_info.bio");

        // Sort to match paginatedIds order
        const usersMap = {};
        users.forEach(u => {
          usersMap[u._id.toString()] = u;
        });

        return paginatedIds.map(id => usersMap[id]).filter(Boolean);
      }

      // 3. If there is a search query, search all matching users and prioritize
      const filter = {
        $or: [
          { "personal_info.username": new RegExp(query, "i") },
          { "personal_info.fullname": new RegExp(query, "i") },
          { "personal_info.email": new RegExp(query, "i") }
        ],
        _id: { $ne: loggedInUserId } // Exclude self
      };

      const matchedUsers = await User.find(filter)
        .select("personal_info.fullname personal_info.username personal_info.profile_img personal_info.bio");

      const friends = [];
      const followersOnly = [];
      const others = [];

      for (const u of matchedUsers) {
        const uIdStr = u._id.toString();
        if (mutualSet.has(uIdStr)) {
          friends.push(u);
        } else if (followerSet.has(uIdStr)) {
          followersOnly.push(u);
        } else {
          others.push(u);
        }
      }

      const allSorted = [...friends, ...followersOnly, ...others];
      return allSorted.slice(skipVal, skipVal + limit);
    } else {
      // Fallback if not logged in (anonymous users cannot invite, but return basic matches)
      let filter = {
        $or: [
          { "personal_info.username": new RegExp(query, "i") },
          { "personal_info.fullname": new RegExp(query, "i") },
          { "personal_info.email": new RegExp(query, "i") }
        ]
      };
      return await User.find(filter)
        .skip(skipVal)
        .limit(limit)
        .select("personal_info.fullname personal_info.username personal_info.profile_img personal_info.bio");
    }
  }

  async getProfile(username) {
    const user = await User.findOne({ "personal_info.username": username })
      .select("-personal_info.password -google_auth -updatedAt");
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateProfileImg(userId, url) {
    await User.findOneAndUpdate({ _id: userId }, { "personal_info.profile_img": url });
    return { profile_img: url };
  }

  async updateProfile(userId, { username, bio, social_links, fullname }) {
    let updateObj = {};
    if (fullname) {
      if (fullname.length < 3) throw new Error("Full name should be at least 3 letters long");
      updateObj["personal_info.fullname"] = fullname;
    }
    if (username) {
      if (username.length < 3) throw new Error("Username should be at least 3 letters long");
      updateObj["personal_info.username"] = username;
    }
    if (bio !== undefined) {
      if (bio.length > 150) throw new Error("Bio should not be more than 150 characters");
      updateObj["personal_info.bio"] = bio;
    }
    if (social_links) {
      for (let link in social_links) {
        if (social_links[link].length) {
          let hostname = new URL(social_links[link]).hostname;
          if (!hostname.includes(`${link}.com`) && link != "website") {
            throw new Error(`${link} link is invalid. You must enter a full link`);
          }
        }
      }
      updateObj.social_links = social_links;
    }

    if (Object.keys(updateObj).length === 0) throw new Error("No fields provided to update");

    const user = await User.findOneAndUpdate({ _id: userId }, updateObj, {
      runValidators: true,
      new: true,
    });
    return {
      username: user.personal_info.username,
      fullname: user.personal_info.fullname,
    };
  }

  /**
   * Follow or unfollow a user
   */
  async toggleFollow(followerId, followingId) {
    if (followerId === followingId) throw new Error("You cannot follow yourself");

    const isFollowing = await UserFollow.exists({ follower: followerId, following: followingId });

    if (isFollowing) {
      await UserFollow.findOneAndDelete({ follower: followerId, following: followingId });
      await User.findByIdAndUpdate(followerId, { $inc: { "account_info.total_following": -1 } });
      await User.findByIdAndUpdate(followingId, { $inc: { "account_info.total_followers": -1 } });
      await Notification.findOneAndDelete({ user: followerId, notification_for: followingId, type: "follow" });
      return { followed_status: false };
    } else {
      const targetExists = await User.exists({ _id: followingId });
      if (!targetExists) throw new Error("Target user not found");

      await UserFollow.create({ follower: followerId, following: followingId });
      await User.findByIdAndUpdate(followerId, { $inc: { "account_info.total_following": 1 } });
      await User.findByIdAndUpdate(followingId, { $inc: { "account_info.total_followers": 1 } });
      
      EE.emit("publish-notification", {
        type: "follow",
        notification_for: followingId,
        user: followerId,
      });
      
      return { followed_status: true };
    }
  }

  /**
   * Get users for sidebar with conversation info
   */
  async getUsersForSidebar(loggedInUserId) {
    const allUserExceptLoggedIn = await User.find({ _id: { $ne: loggedInUserId } }).select("-personal_info.password -personal_info.email");

    // Fetch all active conversations for the logged-in user
    const conversations = await Conversation.find({
      participants: { $in: [loggedInUserId] },
      deleted_by: { $nin: [loggedInUserId] },
    });

    const directConversations = conversations.filter(c => !c.isGroup);
    const groupConversations = conversations.filter(c => c.isGroup);

    // 1. Map 1-1 conversations (associated with other users)
    const directChatUsers = await Promise.all(
      allUserExceptLoggedIn.map(async (user) => {
        const conversation = directConversations.find((c) => c.participants.includes(user._id));
        let unread_count = 0;
        let last_message = null;
        let last_message_time = null;
        let last_message_sender = null;

        if (conversation) {
          unread_count = await Message.countDocuments({
            conversationId: conversation._id,
            receiverId: loggedInUserId,
            seen: false,
          });

          const lastMsgDoc = await Message.findOne({
            conversationId: conversation._id,
          }).sort({ createdAt: -1 });

          if (lastMsgDoc) {
            const isImage =
              lastMsgDoc.type === "img" ||
              /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(lastMsgDoc.message);
            last_message = isImage ? "[Ảnh]" : lastMsgDoc.message;
            last_message_time = lastMsgDoc.createdAt;
            last_message_sender = lastMsgDoc.senderId;
          }
        }

        return {
          ...user.toObject(),
          isGroup: false,
          conversation: conversation ? conversation._id : null,
          unread_count,
          last_message,
          last_message_time,
          last_message_sender,
        };
      })
    );

    // 2. Map Group conversations into sidebar entries
    const groupChatEntries = await Promise.all(
      groupConversations.map(async (group) => {
        let unread_count = 0;
        let last_message = null;
        let last_message_time = group.createdAt;
        let last_message_sender = group.creator;

        // Count group messages that the current user hasn't seen
        unread_count = await Message.countDocuments({
          conversationId: group._id,
          senderId: { $ne: loggedInUserId },
          readBy: { $ne: loggedInUserId },
        });

        const lastMsgDoc = await Message.findOne({
          conversationId: group._id,
        }).sort({ createdAt: -1 });

        if (lastMsgDoc) {
          const isImage =
            lastMsgDoc.type === "img" ||
            /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(lastMsgDoc.message);
          
          // Get sender display name for preview (e.g. "John: Hello")
          const senderUser = await User.findById(lastMsgDoc.senderId).select("personal_info.fullname");
          const senderName = senderUser ? senderUser.personal_info.fullname.split(" ").pop() : "User";

          last_message = isImage ? `${senderName}: [Ảnh]` : `${senderName}: ${lastMsgDoc.message}`;
          last_message_time = lastMsgDoc.createdAt;
          last_message_sender = lastMsgDoc.senderId;
        } else {
          last_message = "Nhóm đã được tạo";
        }

        return {
          _id: group._id, // Map group ID as the target ID
          isGroup: true,
          personal_info: {
            fullname: group.groupName,
            username: `group_${group._id}`,
            profile_img: group.groupAvatar || "https://cdn-icons-png.flaticon.com/512/166/166258.png",
            bio: `Nhóm chat tạo bởi chủ phòng. ${group.participants.length} thành viên.`,
          },
          conversation: group._id,
          unread_count,
          last_message,
          last_message_time,
          last_message_sender,
        };
      })
    );

    // Combine both entries
    const allSidebarEntries = [...directChatUsers, ...groupChatEntries];

    // Sort by latest message time
    return allSidebarEntries.sort((a, b) => {
      const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
      const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
      return timeB - timeA;
    });
  }

  async userOnline(userId, socketId) {
    // Note: setSocketId needs to be imported or handled
    // For now, we'll assume it's available or handled in the controller if it's too complex
    return { date: Date.now() };
  }

  async getFollowingStatus(followerId, targetId) {
    const isFollowing = await UserFollow.exists({ follower: followerId, following: targetId });
    return { followed_status: !!isFollowing };
  }

  async getFollowers(user_id, page = 1, limit = 10) {
    const user = await User.exists({ _id: user_id });
    if (!user) throw new Error("User not found");

    const followerDocs = await UserFollow.find({ following: user_id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("follower -_id");

    const followerIds = followerDocs.map((item) => item.follower);
    const followers = await User.find({ _id: { $in: followerIds } })
      .select("personal_info.fullname personal_info.username personal_info.profile_img personal_info.bio");

    return followerIds.map(id => followers.find(f => f._id.toString() === id.toString())).filter(Boolean);
  }

  async getFollowingList(user_id, page = 1, limit = 10) {
    const user = await User.exists({ _id: user_id });
    if (!user) throw new Error("User not found");

    const followingDocs = await UserFollow.find({ follower: user_id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("following -_id");

    const followingIds = followingDocs.map((item) => item.following);
    const following = await User.find({ _id: { $in: followingIds } })
      .select("personal_info.fullname personal_info.username personal_info.profile_img personal_info.bio");

    return followingIds.map(id => following.find(f => f._id.toString() === id.toString())).filter(Boolean);
  }

  /**
   * Soft-delete: deactivate a user's own account (sets disabled = true)
   * The account can be restored by an admin later.
   */
  async deactivateAccount(userId, password) {
    const user = await User.findById(userId).select("personal_info.password google_auth disabled");
    if (!user) throw new Error("Không tìm thấy tài khoản.");
    if (user.disabled) throw new Error("Tài khoản đã bị vô hiệu hóa trước đó.");

    // Verify password (skip for Google-authenticated accounts)
    if (!user.google_auth) {
      if (!password) throw new Error("Vui lòng nhập mật khẩu để xác nhận.");
      const isMatch = await bcrypt.compare(password, user.personal_info.password);
      if (!isMatch) throw new Error("Mật khẩu không đúng. Vui lòng thử lại.");
    }

    await User.findByIdAndUpdate(userId, { disabled: true });
  }
}

export default new UserService();

