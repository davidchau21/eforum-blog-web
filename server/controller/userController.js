import User from '../Schema/User.js';
import {setSocketId} from '../Socket/Socket.js';
import EE from "../socket/eventManager.js"
export const getUserForSidebar = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;

    const allUserExceptLoggedIn = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password -email");

    res.status(200).json(allUserExceptLoggedIn);
  } catch (error) {
    next(error)
  }
}
export const userOnline = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const socketId = req.body.socketId

    console.log('socketId',socketId,loggedInUserId)
    if(!socketId) return res.status(200).json({date: Date.now()});
    setSocketId(loggedInUserId, socketId)
    EE.emit('online');
    res.status(200).json({date: Date.now()});
  } catch (error) {
    next(error)
  }
}