import User from "../Schema/User.js";
import Notification from "../Schema/Notification.js";
import UserFollow from "../Schema/UserFollow.js";
import { setSocketId } from "../socket/socket.js";
import EventEmitter from "eventemitter3";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import Conversation from "../Schema/Conversation.js";
import EE from "../socket/eventManager.js";
import Message from "../Schema/Message.js";
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

export const getUserForSidebar = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;

    const allUserExceptLoggedIn = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password -email");

    const conversations = await Conversation.find({
      participants: { $in: [loggedInUserId] },
    });

    const userWithConversation = await Promise.all(allUserExceptLoggedIn.map(async (user) => {
      const conversation = conversations.find(conversation => conversation.participants.includes(user._id));

      let unread_count = 0;
      let last_message = null;
      let last_message_time = null;
      let last_message_sender = null;

      if (conversation && conversation.messages && conversation.messages.length > 0) {
        // Get unread count
        unread_count = await Message.countDocuments({
          _id: { $in: conversation.messages },
          receiverId: loggedInUserId,
          seen: false
        });

        // Get the very last message
        const lastMsgDoc = await Message.findOne({
          _id: { $in: conversation.messages }
        }).sort({ createdAt: -1 });

        if (lastMsgDoc) {
          const isImage = lastMsgDoc.type === "img" || 
                          /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(lastMsgDoc.message) ||
                          lastMsgDoc.message.includes('supabase.co/storage/v1/object/public/');
          
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
        last_message_sender
      };
    }));

    // Sort by last_message_time descending so most recent chats are at the top
    userWithConversation.sort((a, b) => {
      const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
      const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
      return timeB - timeA;
    });

    res.status(200).json(userWithConversation);
  } catch (error) {
    return next(error);
  }
};

export const getAllUser = async (req, res, next) => {
  try {
    const { page = 0, limit = 10 } = req.query;
    const userList = await User.find()
      .select("-personal_info.password")
      .skip(page * limit)
      .limit(limit)
      .sort({ joinedAt: -1 });
    const totalUser = await User.countDocuments();
    return res.status(200).json({ list: userList, total: totalUser });
  } catch (error) {
    return next(error);
  }
};
export const findUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-personal_info.password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    let { fullname, email, password, role } = req.body;

    // Validation checks
    if (fullname.length < 3) {
      return res
        .status(403)
        .json({ error: "Fullname must be at least 3 letters long" });
    }
    if (!email.length) {
      return res.status(403).json({ error: "Enter Email" });
    }
    if (!emailRegex.test(email)) {
      return res.status(403).json({ error: "Email is invalid" });
    }
    if (!passwordRegex.test(password)) {
      return res.status(403).json({
        error:
          "Password should be 6 to 20 characters long with a numeric, 1 lowercase, and 1 uppercase letter",
      });
    }

    // Hash password
    const hashed_password = await bcrypt.hash(password, 10);

    // Generate username
    let username = await generateUsername(email);

    // Create a new user object
    let user = new User({
      personal_info: {
        fullname,
        email,
        password: hashed_password,
        username,
        role,
      },
      verified: true, // Marking the account as verified
    });

    // Save user to the database
    await user.save({ new: true, validateModifiedOnly: true });

    return res.status(200).json({ message: "User created successfully" });
  } catch (err) {
    // Handle duplicate email error (Mongoose error code 11000)
    if (err.code === 11000) {
      return res.status(500).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { fullname, role } = req.body;

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update specific fields
    await User.findByIdAndUpdate(
      id,
      {
        $set: {
          "personal_info.fullname": fullname || user.personal_info.fullname,
          "personal_info.role": role || user.personal_info.role,
        },
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const userOnline = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const socketId = req.body.socketId;

    // console.log("socketId", socketId, loggedInUserId);
    if (!socketId) return res.status(200).json({ date: Date.now() });
    setSocketId(loggedInUserId, socketId);
    EE.emit("online");
    return res.status(200).json({ date: Date.now() });
  } catch (error) {
    return next(error);
  }
};

const generateUsername = async (email) => {
  let username = email.split("@")[0];

  const isUsernameNotUnique = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);

  isUsernameNotUnique ? (username += nanoid().substring(0, 5)) : "";

  return username;
};

export const blockComment = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndUpdate(userId, {
      blocked_comment: !user.blocked_comment,
    });
    return res.status(200).json({ message: "Unblocked/blocked successfully" });
  } catch (error) {
    return next(error);
  }
};

export const followUser = async (req, res) => {
  let user_id = req.user.id; // current user
  let { target_id } = req.body; // user to follow

  if (user_id === target_id) {
    return res.status(403).json({ error: "You cannot follow yourself" });
  }

  try {
    const isFollowing = await UserFollow.exists({
      follower: user_id,
      following: target_id,
    });

    if (isFollowing) {
      await UserFollow.findOneAndDelete({
        follower: user_id,
        following: target_id,
      });
      await User.findByIdAndUpdate(user_id, {
        $inc: { "account_info.total_following": -1 },
      });
      await User.findByIdAndUpdate(target_id, {
        $inc: { "account_info.total_followers": -1 },
      });

      // Remove follow notification
      await Notification.findOneAndDelete({
        user: user_id,
        notification_for: target_id,
        type: "follow",
      });

      return res.status(200).json({ followed_status: false });
    } else {
      const targetUser = await User.exists({ _id: target_id });
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      await UserFollow.create({
        follower: user_id,
        following: target_id,
      });
      await User.findByIdAndUpdate(user_id, {
        $inc: { "account_info.total_following": 1 },
      });
      await User.findByIdAndUpdate(target_id, {
        $inc: { "account_info.total_followers": 1 },
      });

      EE.emit("publish-notification", {
        type: "follow",
        notification_for: target_id,
        user: user_id,
      });

      return res.status(200).json({ followed_status: true });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getFollowingStatus = async (req, res) => {
  let user_id = req.user.id;
  let { target_id } = req.body;

  try {
    const isFollowing = await UserFollow.exists({
      follower: user_id,
      following: target_id,
    });
    return res.status(200).json({ followed_status: !!isFollowing });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getFollowers = async (req, res) => {
  let { user_id, page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  try {
    const user = await User.exists({ _id: user_id });
    if (!user) return res.status(404).json({ error: "User not found" });

    const followerDocs = await UserFollow.find({ following: user_id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("follower -_id");

    const followerIds = followerDocs.map((item) => item.follower);

    const followers = await User.aggregate([
      { $match: { _id: { $in: followerIds } } },
      {
        $project: {
          "personal_info.fullname": 1,
          "personal_info.username": 1,
          "personal_info.profile_img": 1,
          "personal_info.bio": 1,
        }
      }
    ]);

    const followerMap = new Map(
      followers.map((item) => [item._id.toString(), item])
    );
    const orderedFollowers = followerIds
      .map((id) => followerMap.get(id.toString()))
      .filter(Boolean);

    return res.status(200).json({ followers: orderedFollowers });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export const getFollowing = async (req, res) => {
  let { user_id, page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  try {
    const user = await User.exists({ _id: user_id });
    if (!user) return res.status(404).json({ error: "User not found" });

    const followingDocs = await UserFollow.find({ follower: user_id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("following -_id");

    const followingIds = followingDocs.map((item) => item.following);

    const following = await User.aggregate([
      { $match: { _id: { $in: followingIds } } },
      {
        $project: {
          "personal_info.fullname": 1,
          "personal_info.username": 1,
          "personal_info.profile_img": 1,
          "personal_info.bio": 1,
        }
      }
    ]);

    const followingMap = new Map(
      following.map((item) => [item._id.toString(), item])
    );
    const orderedFollowing = followingIds
      .map((id) => followingMap.get(id.toString()))
      .filter(Boolean);

    return res.status(200).json({ following: orderedFollowing });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
