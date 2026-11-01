import { Server } from "socket.io";
import http, { get } from "http";
import express from "express";
import EE from "./eventManager.js"
import "./notificationHandler.js"
import { allowedOrigins } from "../config/app.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { isRedisEnabled, redisPubClient, redisSubClient } from "../queue/redis.js";

const server = express();

const app = http.createServer(server);

const io = new Server(app, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

if (isRedisEnabled()) {
  io.adapter(createAdapter(redisPubClient, redisSubClient));
  console.log("Socket.io Redis adapter attached!");
}

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId]
}
export const setSocketId = (userId, socketId) => {
  return userSocketMap[userId] = socketId;
}

const userSocketMap = {};

EE.on('new-message', (users, newMessage) => {
  for (const user of users) {
    const receiverSocketId = getReceiverSocketId(user)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage)
    }
  }
});

// Emit new conversation entry to the specific user's sidebar
EE.on('new-conversation', (userId, conversationPayload) => {
  const socketId = getReceiverSocketId(userId.toString());
  if (socketId) {
    io.to(socketId).emit("newConversation", conversationPayload);
  }
});

EE.on('remove-conversation', (userId, conversationId) => {
  const socketId = getReceiverSocketId(userId.toString());
  if (socketId) {
    io.to(socketId).emit("removeConversation", conversationId.toString());
  }
});

EE.on('group-info-updated', (users, payload) => {
  for (const user of users) {
    const receiverSocketId = getReceiverSocketId(user);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("groupInfoUpdated", payload);
    }
  }
});

EE.on('online', () => {
  io.emit("online-users", Object.keys(userSocketMap));
});

// Notifications are now handled by notificationHandler.js via the 'publish-notification' event

io.on("connection", (socket) => {
  // console.log("a user connected", socket.id);

  const userId = socket.handshake.auth.token;

  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.join(`user_${userId}`);
    io.emit("online-users", Object.keys(userSocketMap)); // Emit sự kiện online-users
  }

  // Sự kiện gửi thông báo từ client
  socket.on("sendNotification", (data) => {
    if (data.receiverId) {
      io.to(`user_${data.receiverId}`).emit("newNotification", data);
    }
  });

  socket.on("disconnect", () => {
    // console.log("user disconnected", socket.id);
    if (userId) { // Kiểm tra nếu userId tồn tại trước khi xóa
      delete userSocketMap[userId];
    }
    io.emit("online-users", Object.keys(userSocketMap));
  });
});

export { app, server, io };
