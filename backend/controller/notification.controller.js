import { BaseController } from "./BaseController.js";
import notificationService from "../service/notification.service.js";

class NotificationController extends BaseController {
  async deleteNotification(req, res) {
    try {
      const userId = req.user.id || req.user;
      const { _id } = req.body;
      await notificationService.deleteNotification(userId, _id);
      return this.sendSuccess(res, { status: "done" });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getNewNotificationCount(req, res) {
    try {
      const userId = req.user.id || req.user;
      const count = await notificationService.getNewNotificationCount(userId);
      return this.sendSuccess(res, { new_notification_available: count });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getNotifications(req, res) {
    try {
      const userId = req.user.id || req.user;
      const result = await notificationService.getNotifications(userId, req.body);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async allNotificationsCount(req, res) {
    try {
      const userId = req.user.id || req.user;
      const { filter } = req.body;
      const count = await notificationService.allNotificationsCount(userId, filter);
      return this.sendSuccess(res, { totalDocs: count });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new NotificationController();
