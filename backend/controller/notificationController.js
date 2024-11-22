import Notification from "../Schema/Notification.js";
export const createNotification = async (req, res, next) => {
  try {
    const { notification_info } = req.body;
    const existingNotification = await Notification.findOne({ notification_info });
    if (existingNotification) {
      return res.status(400).json({ message: "Notification already exists" });
    }
    const notification = await Notification.create({ notification_info });
    return res.status(200).json(notification);
  } catch (error) {
    return next(error);
  }
};

export const getAllNotifications = async (req, res, next) => {
  try {
    const { page = 0, limit = 10 } = req.query;
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);
    const totalNotifications = await Notification.countDocuments();
    return res.status(200).json({ list: notifications, total: totalTags });
  } catch (error) {
    return next(error);
  }
};

// export const updateTag = async (req, res, next) => {
//   try {
//     const { tag_name, is_disabled } = req.body;
//     const { id } = req.params;
//     const existingTag = await Tag.findOne({ tag_name });
//     const updateTag = await Tag.findById(id);
//     if (existingTag && updateTag._id !== existingTag._id) {
//       return res.status(400).json({ message: "Tag name already exists" });
//     }
//     await Tag.findByIdAndUpdate(id, { tag_name, is_disabled });
//     return res.status(200).json({ message: "Tag updated successfully" });
//   } catch (error) {
//     return next(error);
//   }
// };

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    return res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

export const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    return res.status(200).json(tag);
  } catch (error) {
    return next(error);
  }
};
