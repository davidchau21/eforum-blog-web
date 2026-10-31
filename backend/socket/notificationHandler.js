import Notification from "../Schema/Notification.js";
import EE from "./eventManager.js";
import { getReceiverSocketId, io } from "./socket.js";
import { isRedisEnabled } from "../queue/redis.js";
import { notificationQueue } from "../queue/notification.queue.js";

/**
 * Listener for creating and publishing notifications
 * This handles both persistence (DB) and real-time (Socket.io)
 */
EE.on("publish-notification", async (data) => {
    try {
        if (isRedisEnabled() && notificationQueue) {
            // Push job to BullMQ for asynchronous processing
            await notificationQueue.add("publish", data);
        } else {
            // Fallback: Synchronous/in-memory processing if Redis is not enabled
            const { type, blog, notification_for, user, comment, reply, replied_on_comment, metadata, group, role } = data;

            // 1. Save to Database (Background Persistence)
            const notification = new Notification({
                type,
                blog,
                notification_for,
                user,
                comment,
                reply,
                replied_on_comment,
                metadata,
                group,
                role
            });

            const savedNotification = await notification.save();

            // Populate user info for the frontend to display immediately
            const populatedNotification = await Notification.findById(savedNotification._id)
                .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
                .populate("blog", "title blog_id")
                .populate("group", "name banner avatar");

            // 2. Publish to Socket.io (Real-time Foreground)
            const targetUserId = notification_for.toString();
            io.to(`user_${targetUserId}`).emit("newNotification", populatedNotification);
        }
    } catch (error) {
        console.error("Error publishing notification:", error);
    }
});
