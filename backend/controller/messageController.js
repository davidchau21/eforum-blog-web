import Message from "../Schema/Message.js";
import { getReceiverSocketId} from "../socket/socket.js";
import User from "../Schema/User.js";
import Conversation from "../Schema/Conversation.js";
import  EE from  "../socket/eventManager.js"
export const sendMessage = async (req, res, next) => {
    try {
        const { message,type } = req.body
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
        EE.emit('new-message',conversation.participants ,newMessage)

        res.status(201).json(newMessage)

    } catch (error) {
        next(error);
    }
};

export const getMessage = async (req, res, next) => {
    try {
        const { id: userToMessage } = req.params
        const senderId = req.user.id
    
        const conversation = await Conversation.findOne({
          participants: { $all: [senderId, userToMessage] },
        }).populate("messages")
    
        if (!conversation) {
          return res.status(200).json([])
        }
    
        const messages = conversation.messages
    
        res.status(200).json(messages)
    } catch (error) {
        next(error);
    }
};
