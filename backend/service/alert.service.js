import Alert from "../Schema/Alert.js";

class AlertService {
  async getAllAlerts({ page = 0, limit = 10 }) {
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);
    const total = await Alert.countDocuments();
    return { list: alerts, total };
  }

  async getAlertById(id) {
    const alert = await Alert.findById(id);
    if (!alert) throw new Error("Alert not found");
    return alert;
  }
}

export default new AlertService();
