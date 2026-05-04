import Notification from "../Schema/Notification.js";
import EE from "./eventManager.js";
import { getReceiverSocketId, io } from "./socket.js";

/**
 * Listener for creating and publishing notifications
 * This handles both persistence (DB) and real-time (Socket.io)
 */
EE.on("publish-notification", async (data) => {
    try {
        const { type, blog, notification_for, user, comment, reply, replied_on_comment, metadata } = data;

        // 1. Save to Database (Background Persistence)
        const notification = new Notification({
            type,
            blog,
            notification_for,
            user,
            comment,
            reply,
            replied_on_comment,
            metadata
        });

        const savedNotification = await notification.save();

        // Populate user info for the frontend to display immediately
        const populatedNotification = await Notification.findById(savedNotification._id)
            .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
            .populate("blog", "title blog_id");

        // 2. Publish to Socket.io (Real-time Foreground)
        const receiverSocketId = getReceiverSocketId(notification_for);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newNotification", populatedNotification);
        }

        // console.log(`Notification of type ${type} published to user ${notification_for}`);
    } catch (error) {
        console.error("Error publishing notification:", error);
    }
});
