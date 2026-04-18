import User from "../Schema/User.js";
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
              last_message = lastMsgDoc.message;
              last_message_time = lastMsgDoc.createdAt;
          }
      }

      return { 
          ...user.toObject(), 
          conversation: conversation ? conversation._id : null, 
          unread_count,
          last_message,
          last_message_time
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
