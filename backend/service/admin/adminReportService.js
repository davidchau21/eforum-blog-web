import Blog from "../../Schema/Blog.js";
import Comment from "../../Schema/Comment.js";
import User from "../../Schema/User.js";
import moment from "moment";

class AdminReportService {
  async getTotalUsers() {
    return await User.countDocuments();
  }

  async getTotalBlogs() {
    return await Blog.countDocuments({ isDeleted: { $in: [false, null] } });
  }

  async getTotalComments() {
    return await Comment.countDocuments();
  }

  async getUserGrowth({ startDate, endDate }) {
    if (!startDate || !endDate) throw new Error("Vui lòng cung cấp ngày bắt đầu và ngày kết thúc.");
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) throw new Error("Ngày không hợp lệ.");

    const startUserCount = await User.countDocuments({ joinedAt: { $lte: start } });
    const endUserCount = await User.countDocuments({ joinedAt: { $lte: end } });
    const growth = ((endUserCount - startUserCount) / (startUserCount || 1)) * 100;

    return { startDate, endDate, startUserCount, endUserCount, growth: `${growth.toFixed(2)}%` };
  }

  async getUserGrowthChart({ startDate, endDate }) {
    if (!startDate || !endDate) throw new Error("Vui lòng cung cấp ngày bắt đầu và ngày kết thúc.");
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) throw new Error("Ngày không hợp lệ.");

    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const interval = daysDiff < 7 ? daysDiff : 7;

    const dates = [];
    for (let i = 0; i <= interval; i++) {
      dates.push(new Date(start.getTime() + (timeDiff / interval) * i));
    }

    const userCounts = await Promise.all(dates.map(date => User.countDocuments({ joinedAt: { $lte: date } })));
    return dates.map((date, index) => ({
      date: date.toISOString().split('T')[0],
      userCount: userCounts[index],
    }));
  }

  async getBlogStatistics() {
    const blogStats = await Blog.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: "$activity.total_likes" },
          totalShares: { $sum: "$activity.total_share" },
          totalComments: { $sum: "$activity.total_comments" },
        },
      },
    ]);
    return {
      totalLikes: blogStats[0]?.totalLikes || 0,
      totalShares: blogStats[0]?.totalShares || 0,
      totalComments: blogStats[0]?.totalComments || 0,
    };
  }

  async getWeeklyInteractionStatistics() {
    const today = moment().startOf("day").toDate();
    const sevenDaysAgo = moment().subtract(6, "days").startOf("day").toDate();

    const interactionStats = await Blog.aggregate([
      { $match: { publishedAt: { $gte: sevenDaysAgo, $lte: today } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$publishedAt" } },
          totalLikes: { $sum: "$activity.total_likes" },
          totalShares: { $sum: "$activity.total_share" },
          totalComments: { $sum: "$activity.total_comments" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const sevenDays = Array.from({ length: 7 }, (_, i) => moment().subtract(6 - i, "days").format("YYYY-MM-DD"));
    return sevenDays.map((date) => {
      const stat = interactionStats.find((s) => s._id === date) || {};
      return {
        date,
        totalLikes: stat.totalLikes || 0,
        totalShares: stat.totalShares || 0,
        totalComments: stat.totalComments || 0,
      };
    });
  }

  async getBlogStatisticsByDate({ startDate, endDate }) {
    if (!startDate || !endDate) throw new Error("Start date and end date are required");
    const start = moment(startDate).startOf("day").toDate();
    const end = moment(endDate).endOf("day").toDate();
    if (isNaN(start) || isNaN(end)) throw new Error("Invalid date format");

    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const interval = daysDiff < 7 ? daysDiff : 7;

    const dates = [];
    for (let i = 0; i <= interval; i++) {
      dates.push(new Date(start.getTime() + (timeDiff / interval) * i));
    }

    const blogsStats = await Promise.all(
      dates.map(date => Blog.aggregate([
        { $match: { publishedAt: { $lte: date } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$publishedAt" } },
            totalBlogs: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]))
    );

    return dates.map((date, index) => {
      const stat = blogsStats[index].find(s => s._id === date.toISOString().split('T')[0]) || {};
      return {
        date: date.toISOString().split('T')[0],
        totalBlogs: stat.totalBlogs || 0,
      };
    });
  }

  async getStats() {
    const totalStats = await Blog.aggregate([
      { $match: { isDeleted: { $in: [false, null] } } },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: "$activity.total_likes" },
          totalShares: { $sum: "$activity.total_share" },
          totalReads: { $sum: "$activity.total_reads" },
        },
      },
    ]);

    return {
      totalLikes: totalStats[0]?.totalLikes || 0,
      totalShares: totalStats[0]?.totalShares || 0,
      totalReads: totalStats[0]?.totalReads || 0,
    };
  }
}

export default new AdminReportService();
