import Alert from "../Schema/Alert.js";
import User from "../Schema/User.js";
export const createAlert = async (req, res, next) => {
  try {
    const { message } = req.body;

    // Kiểm tra thông báo đã tồn tại hay chưa
    const existingAlert = await Alert.findOne({
      message,
    });

    if (existingAlert) {
      return res.status(400).json({ message: "Alert already exists" });
    }

    // Lấy tất cả người dùng (trừ admin)
    const users = await User.find({ 'personal_info.role': { $ne: 'ADMIN' } });

    // Kiểm tra nếu không có người dùng
    if (!users.length) {
      return res.status(404).json({ message: "No users available to notify." });
    }

    // Tạo thông báo với trường blog là null, title từ notification_info
    const alert = await Alert.create({
      notification_for: users.map((user) => user.id), // Gửi tới tất cả người dùng
      user: req.user.id, // Admin là người tạo thông báo
      message: message,
    });   

    return res.status(200).json(alert);
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
