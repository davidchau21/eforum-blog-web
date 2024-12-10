import Blog from "../Schema/Blog.js";
import Comment from "../Schema/Comment.js";
import User from "../Schema/User.js";
import moment from "moment";

export const totalUser = async (req, res) => {
  try {
    const totalUser = await User.countDocuments();
    return res.status(200).json({ totalUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const totalBlog = async (req, res) => {
  try {
    const totalBlog = await Blog.countDocuments({
      isDeleted: { $in: [false, null] },
    });
    return res.status(200).json({ totalBlog });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const totalComment = async (req, res) => {
  try {
    const totalComment = await Comment.countDocuments();
    return res.status(200).json({ totalComment });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const userGrowth = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Kiểm tra xem người dùng đã cung cấp ngày bắt đầu và ngày kết thúc chưa
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Vui lòng cung cấp ngày bắt đầu và ngày kết thúc." });
    }

    // Chuyển đổi ngày thành dạng Date object
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Ngày không hợp lệ." });
    }

    // Lấy số lượng người dùng vào ngày bắt đầu
    const startUserCount = await User.countDocuments({

      joinedAt: { $lte: start },
    });

    // Lấy số lượng người dùng vào ngày kết thúc
    const endUserCount = await User.countDocuments({
      joinedAt: { $lte: end },
    });

    // Tính tỷ lệ tăng/giảm
    const growth = ((endUserCount - startUserCount) / (startUserCount || 1)) * 100;

    return res.status(200).json({
      startDate,
      endDate,
      startUserCount,
      endUserCount,
      growth: `${growth.toFixed(2)}%`,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const userGrowthChart = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Vui lòng cung cấp ngày bắt đầu và ngày kết thúc." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Ngày không hợp lệ." });
    }

    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const interval = daysDiff < 7 ? daysDiff : 7;

    const dates = [];
    for (let i = 0; i <= interval; i++) {
      dates.push(new Date(start.getTime() + (timeDiff / interval) * i));
    }

    const userCounts = await Promise.all(
      dates.map(date => User.countDocuments({ joinedAt: { $lte: date } }))
    );

    const growthData = dates.map((date, index) => ({
      date: date.toISOString().split('T')[0],
      userCount: userCounts[index],
    }));

    return res.status(200).json({ growthData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const blogStatistics = async (req, res) => {
  try {
    // Tính tổng số likes, shares, và comments từ tất cả các blog chưa bị xóa
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

    // Chuẩn bị dữ liệu trả về
    const result = {
      totalLikes: blogStats[0]?.totalLikes || 0,
      totalShares: blogStats[0]?.totalShares || 0,
      totalComments: blogStats[0]?.totalComments || 0,
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const weeklyInteractionStatistics = async (req, res) => {
  try {
    // Lấy ngày hiện tại và tính toán 7 ngày trước
    const today = moment().startOf("day").toDate();
    const sevenDaysAgo = moment().subtract(6, "days").startOf("day").toDate();

    // Lấy dữ liệu tương tác theo ngày
    const interactionStats = await Blog.aggregate([
      {
        $match: {
          // isDeleted: false,
          publishedAt: { $gte: sevenDaysAgo, $lte: today },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$publishedAt" } },
          totalLikes: { $sum: "$activity.total_likes" },
          totalShares: { $sum: "$activity.total_share" },
          totalComments: { $sum: "$activity.total_comments" },
        },
      },
      { $sort: { _id: 1 } }, // Sắp xếp theo ngày tăng dần
    ]);

    // Tạo danh sách 7 ngày từ hiện tại
    const sevenDays = Array.from({ length: 7 }, (_, i) =>
      moment().subtract(6 - i, "days").format("YYYY-MM-DD")
    );

    // Định dạng kết quả để đảm bảo mỗi ngày đều có dữ liệu
    const statsFormatted = sevenDays.map((date) => {
      const stat = interactionStats.find((s) => s._id === date) || {};
      return {
        date,
        totalLikes: stat.totalLikes || 0,
        totalShares: stat.totalShares || 0,
        totalComments: stat.totalComments || 0,
      };
    });

    // Trả về kết quả
    return res.status(200).json(statsFormatted);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// export const blogStatisticsByDate = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     if (!startDate || !endDate) {
//       return res.status(400).json({ error: "Start date and end date are required" });
//     }

//     const start = moment(startDate).startOf("day").toDate();
//     const end = moment(endDate).endOf("day").toDate();

//     if (isNaN(start) || isNaN(end)) {
//       return res.status(400).json({ error: "Invalid date format" });
//     }

//     const timeDiff = end.getTime() - start.getTime();
//     const interval = timeDiff / 6;

//     const dates = [];
//     for (let i = 0; i <= 6; i++) {
//       dates.push(new Date(start.getTime() + interval * i));
//     }

//     const blogsStats = await Promise.all(
//       dates.map(date => Blog.aggregate([
//         {
//           $match: {
//             isDeleted: false,
//             publishedAt: { $lte: date },
//           },
//         },
//         {
//           $group: {
//             _id: { $dateToString: { format: "%Y-%m-%d", date: "$publishedAt" } },
//             totalBlogs: { $sum: 1 },
//           },
//         },
//         { $sort: { _id: 1 } },
//       ]))
//     );

//     const statsFormatted = dates.map((date, index) => {
//       const stat = blogsStats[index].find(s => s._id === date.toISOString().split('T')[0]) || {};
//       return {
//         date: date.toISOString().split('T')[0],
//         totalBlogs: stat.totalBlogs || 0,
//       };
//     });

//     return res.status(200).json(statsFormatted);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };
export const blogStatisticsByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    const start = moment(startDate).startOf("day").toDate();
    const end = moment(endDate).endOf("day").toDate();

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const interval = daysDiff < 7 ? daysDiff : 7;

    const dates = [];
    for (let i = 0; i <= interval; i++) {
      dates.push(new Date(start.getTime() + (timeDiff / interval) * i));
    }

    const blogsStats = await Promise.all(
      dates.map(date => Blog.aggregate([
        {
          $match: {
            publishedAt: { $lte: date },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$publishedAt" } },
            totalBlogs: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]))
    );

    const statsFormatted = dates.map((date, index) => {
      const stat = blogsStats[index].find(s => s._id === date.toISOString().split('T')[0]) || {};
      return {
        date: date.toISOString().split('T')[0],
        totalBlogs: stat.totalBlogs || 0,
      };
    });

    return res.status(200).json(statsFormatted);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
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

    const result = {
      totalLikes: totalStats[0]?.totalLikes || 0,
      totalShares: totalStats[0]?.totalShares || 0,
      totalReads: totalStats[0]?.totalReads || 0,
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
