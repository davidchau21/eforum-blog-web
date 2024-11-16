import { Server } from "socket.io";
import http, { get } from "http";
import express from "express";
import  EE from  "./eventManager.js"
const server = express();

const app = http.createServer(server);

const io = new Server(app, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
})

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId]
}
export const setSocketId = (userId,socketId) => {
    return userSocketMap[userId]=socketId;

}

const userSocketMap = {};

io.on("connection", (socket) => {
    // console.log("a user connected", socket.id);

    const userId = socket.handshake.auth.token;

    if (userId) {
      userSocketMap[userId] = socket.id;

      io.emit("online-users", Object.keys(userSocketMap)); // Emit sự kiện online-users
    }
    EE.on('new-message', (users,newMessage) => {

        for (const user of users){
            const receiverSocketId = getReceiverSocketId(user)
            if (receiverSocketId) {
                // console.log(receiverSocketId,'receiverSocketId')
                io.to(receiverSocketId).emit("newMessage", newMessage)
            }
        }
    });
    EE.on('online',()=>{
        io.emit("online-users", Object.keys(userSocketMap));
    })
    socket.on("disconnect", () => {
        // console.log("user disconnected", socket.id);
        if (userId) { // Kiểm tra nếu userId tồn tại trước khi xóa
          delete userSocketMap[userId];
        }
        io.emit("online-users", Object.keys(userSocketMap));
    });
    }
);

export { app, server, io };