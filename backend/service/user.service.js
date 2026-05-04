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

  async searchUsers(query) {
    return await User.find({ "personal_info.username": new RegExp(query, "i") })
      .limit(50)
      .select("personal_info.fullname personal_info.username personal_info.profile_img -_id");
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
    const conversations = await Conversation.find({ participants: { $in: [loggedInUserId] } });

    const userWithConversation = await Promise.all(
      allUserExceptLoggedIn.map(async (user) => {
        const conversation = conversations.find((c) => c.participants.includes(user._id));
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
          conversation: conversation ? conversation._id : null,
          unread_count,
          last_message,
          last_message_time,
          last_message_sender,
        };
      })
    );

    return userWithConversation.sort((a, b) => {
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
}

export default new UserService();
