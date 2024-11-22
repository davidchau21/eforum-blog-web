import express from "express";
import { isAdmin, isAuthenticate } from "../middleware/verifyToken.js";
import {
  createNotification,
  deleteNotification,
  getAllNotifications,
  getNotificationById,
//   updateNotification,
} from "../controller/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", isAuthenticate, getAllNotifications);
notificationRouter.get("/:id", isAuthenticate, getNotificationById);
notificationRouter.post("/", isAdmin, createNotification);
// notificationRouter.put("/:id", isAdmin, updateNotification);
notificationRouter.delete("/:id", isAdmin, deleteNotification);

export default notificationRouter;
