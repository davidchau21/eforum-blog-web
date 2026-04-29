import Notification from "../Schema/Notification.js";

class NotificationService {
  async deleteNotification(userId, _id) {
    return await Notification.findOneAndDelete({ _id, notification_for: userId });
  }

  async getNewNotificationCount(userId) {
    return await Notification.countDocuments({
      notification_for: userId,
      seen: false,
      user: { $ne: userId },
    });
  }

  async getNotifications(userId, { page, filter, deletedDocCount }) {
    const maxLimit = 10;
    let findQuery = { notification_for: userId, user: { $ne: userId } };
    let skipDocs = (page - 1) * maxLimit;

    if (filter !== "all") findQuery.type = filter;
    if (deletedDocCount) skipDocs -= deletedDocCount;

    const notifications = await Notification.find(findQuery)
      .skip(skipDocs)
      .limit(maxLimit)
      .populate("blog", "title blog_id")
      .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
      .populate("comment", "comment")
      .populate("replied_on_comment", "comment")
      .populate("reply", "comment")
      .sort({ createdAt: -1 })
      .select("createdAt type seen reply");

    await Notification.updateMany(
      { _id: { $in: notifications.map((n) => n._id) }, seen: false },
      { $set: { seen: true } }
    );

    const totalDocs = await Notification.countDocuments(findQuery);
    return { notifications, totalDocs };
  }

  async allNotificationsCount(userId, filter) {
    let findQuery = { notification_for: userId, user: { $ne: userId } };
    if (filter != "all") findQuery.type = filter;
    return await Notification.countDocuments(findQuery);
  }
}

export default new NotificationService();
