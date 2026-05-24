import ActivityLog from "../../Schema/ActivityLog.js";
import { getClientIp } from "../../utils/ip.js";

class AdminActivityLogService {
  /**
   * Log an administrative activity
   */
  async log({ userId, action, targetType, targetId, details, ip, req }) {
    try {
      let clientIp = "127.0.0.1";
      if (req) {
        clientIp = getClientIp(req);
      } else if (ip) {
        clientIp = ip === "::1" || ip === "::ffff:127.0.0.1" ? "127.0.0.1" : ip;
      }

      await ActivityLog.create({
        user: userId,
        action,
        target_type: targetType,
        target_id: targetId ? String(targetId) : undefined,
        details,
        ip_address: clientIp,
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
  }

  /**
   * Get paginated list of activity logs
   */
  async getActivityLogs({ page = 0, limit = 10 }) {
    const list = await ActivityLog.find()
      .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
      .skip(page * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await ActivityLog.countDocuments();
    return { list, total };
  }
}

export default new AdminActivityLogService();
