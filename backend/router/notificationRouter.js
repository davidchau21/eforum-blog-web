import express from "express";
import { isAuthenticate } from "../middleware/verifyToken.js";
import notificationController from "../controller/notification.controller.js";

const notificationRouter = express.Router();

notificationRouter.post("/delete", isAuthenticate, (req, res) => notificationController.deleteNotification(req, res));
notificationRouter.get("/new", isAuthenticate, (req, res) => notificationController.getNewNotificationCount(req, res));
notificationRouter.post("/list", isAuthenticate, (req, res) => notificationController.getNotifications(req, res));
notificationRouter.post("/count", isAuthenticate, (req, res) => notificationController.allNotificationsCount(req, res));

export default notificationRouter;
