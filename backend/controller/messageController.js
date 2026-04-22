import Message from "../Schema/Message.js";
import { getReceiverSocketId } from "../socket/socket.js";
import User from "../Schema/User.js";
import Conversation from "../Schema/Conversation.js";
import EE from "../socket/eventManager.js";
export const sendMessage = async (req, res, next) => {
    try {
        const { message, type } = req.body
        const { id: receiverId } = req.params
        const senderId = req.user.id

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        })

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            })
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
            type
        })

        if (newMessage) {
            conversation.messages.push(newMessage._id)
        }

        await Promise.all([conversation.save(), newMessage.save()])

        // socket io functionality
        EE.emit('new-message', conversation.participants, newMessage)

        res.status(201).json(newMessage)

    } catch (error) {
        next(error);
    }
};

export const getMessage = async (req, res, next) => {
    try {
        const { id: userToMessage } = req.params;
        const senderId = req.user.id;
        const { limit = 10, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Query messages directly for better performance and pagination
        const messages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: userToMessage },
                { senderId: userToMessage, receiverId: senderId }
            ]
        })
        .sort({ createdAt: -1 }) // Get newest first
        .skip(skip)
        .limit(parseInt(limit));

        // We want to return them in ascending order for the UI, but the query got them newest first
        const resultMessages = messages.reverse();

        // Mark unread messages as seen
        const unreadMessageIds = messages
            .filter(m => m.receiverId.toString() === senderId.toString() && !m.seen)
            .map(m => m._id);

        if (unreadMessageIds.length > 0) {
            await Message.updateMany(
                { _id: { $in: unreadMessageIds } },
                { $set: { seen: true } }
            );
        }

        res.status(200).json(resultMessages);
    } catch (error) {
        next(error);
    }
};
