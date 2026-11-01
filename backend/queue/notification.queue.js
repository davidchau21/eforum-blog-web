import { Queue, Worker } from "bullmq";
import { isRedisEnabled, redisClient } from "./redis.js";
import Notification from "../Schema/Notification.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

const QUEUE_NAME = "notificationQueue";

export let notificationQueue = null;
export let notificationWorker = null;

export const initNotificationQueue = () => {
  if (!isRedisEnabled()) return;

  // 1. Khởi tạo hàng đợi BullMQ
  notificationQueue = new Queue(QUEUE_NAME, {
    connection: redisClient,
  });

  // 2. Khởi tạo Worker xử lý thông báo chạy ngầm với connection riêng biệt
  notificationWorker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { data } = job;
      const { type, blog, notification_for, user, comment, reply, replied_on_comment, metadata, group, role } = data;

      // Lưu vào Database
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
        role,
      });

      const savedNotification = await notification.save();

      // Lấy thông tin populate
      const populatedNotification = await Notification.findById(savedNotification._id)
        .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
        .populate("blog", "title blog_id")
        .populate("group", "name banner avatar");

      // Gửi thông báo thời gian thực qua socket (Room-based tương thích Redis adapter)
      const targetUserId = notification_for.toString();
      io.to(`user_${targetUserId}`).emit("newNotification", populatedNotification);
    },
    {
      connection: redisClient.duplicate(),
      settings: {
        backoff: {
          type: "exponential",
          delay: 5000, // Tự động thử lại sau 5s, 10s, 20s... nếu xảy ra lỗi
        },
      },
    }
  );

  notificationWorker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
  });

  console.log("BullMQ Notification Queue and Worker initialized successfully!");
};
