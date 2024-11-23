import Alert from "../Schema/Alert.js";
import User from "../Schema/User.js";
export const createAlert = async (req, res, next) => {
  try {
    const { message, userIds } = req.body;

    // Kiểm tra nếu không có người dùng hoặc thông báo không hợp lệ
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "No users available to notify." });
    }

    // Kiểm tra thông báo đã tồn tại cho cùng danh sách userIds
    const existingAlert = await Alert.findOne({
      message,
      notification_for: { $all: userIds }, // So khớp tất cả userIds
    });

    if (existingAlert) {
      return res.status(400).json({ message: "Alert already exists." });
    }

    // Tạo thông báo mới
    const alert = await Alert.create({
      notification_for: userIds, // Lưu danh sách ID người nhận
      user: req.user.id, // ID admin là người tạo thông báo
      message: message,
    });

    return res.status(200).json({ message: "Notification created successfully.", alert });
  } catch (error) {
    return next(error);
  }
};

export const getAllAlert = async (req, res, next) => {
  try {
    const { page = 0, limit = 10 } = req.query;
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);
      const totalAlerts = await Alert.countDocuments();
      return res.status(200).json({ list: alerts, total: totalAlerts });
  } catch (error) {
    return next(error);
  }
};

export const deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Alert.findByIdAndDelete(id);
    return res.status(200).json({ message: "Alert deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

export const getAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    return res.status(200).json(alert);
  } catch (error) {
    return next(error);
  }
};
