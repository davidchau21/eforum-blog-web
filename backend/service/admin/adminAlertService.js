import Alert from "../../Schema/Alert.js";

class AdminAlertService {
  async createAlert(adminId, { message, userIds }) {
    if (!Array.isArray(userIds) || userIds.length === 0) throw new Error("No users available to notify.");

    const existingAlert = await Alert.findOne({
      message,
      notification_for: { $all: userIds },
    });
    if (existingAlert) throw new Error("Alert already exists.");

    return await Alert.create({
      notification_for: userIds,
      user: adminId,
      message,
    });
  }

  async deleteAlert(id) {
    return await Alert.findByIdAndDelete(id);
  }
}

export default new AdminAlertService();
