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
  async getActivityLogs({ page = 0, limit = 10, startDate, endDate, action }) {
    const query = {};

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Action type filter
    if (action) {
      query.action = action;
    }

    const list = await ActivityLog.find(query)
      .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
      .skip(Number(page) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await ActivityLog.countDocuments(query);
    return { list, total };
  }
}

export default new AdminActivityLogService();
