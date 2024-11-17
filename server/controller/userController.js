import User from '../Schema/User.js';
import Conversation from '../Schema/Conversation.js';
import { setSocketId } from '../socket/socket.js';
import EE from "../socket/eventManager.js"
export const getUserForSidebar = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;

    const allUserExceptLoggedIn = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password -email");

    // ngoài trả kết quả là tất cả user và cho biết những user nào có conversation

    const conversations = await Conversation.find({
      participants: { $in: [loggedInUserId] },
    });
    const userWithConversation = allUserExceptLoggedIn.map(user => {
      const conversation = conversations.find(conversation => conversation.participants.includes(user._id));
      return { ...user.toObject(), conversation: conversation ? conversation._id : null };
    });

    res.status(200).json(userWithConversation);
  } catch (error) {
    next(error)
  }
}
export const userOnline = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const socketId = req.body.socketId

    // console.log('socketId', socketId, loggedInUserId) 
    if (!socketId) return res.status(200).json({ date: Date.now() });
    setSocketId(loggedInUserId, socketId)
    EE.emit('online');
    res.status(200).json({ date: Date.now() });
  } catch (error) {
    next(error)
  }
}