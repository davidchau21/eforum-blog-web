import express from "express";
import { isAdmin } from "../middleware/verifyToken.js";
import {
  blogStatistics,
  blogStatisticsByDate,
  getStats,
  totalBlog,
  totalComment,
  totalUser,
  userGrowth,
  userGrowthChart,
  weeklyInteractionStatistics,
} from "../controller/reportController.js";

const reportRouter = express.Router();

reportRouter.get("/total-user", isAdmin, totalUser);
reportRouter.get("/total-blog", isAdmin, totalBlog);
reportRouter.get("/total-comment", isAdmin, totalComment);
reportRouter.get("/user-growth", isAdmin, userGrowth);
reportRouter.get("/user-chart-bydate", isAdmin, userGrowthChart);
reportRouter.get("/blog-statistic", isAdmin, blogStatistics);
reportRouter.get("/weekly-interactions", isAdmin, weeklyInteractionStatistics);
reportRouter.get("/blog-statistics-bydate", isAdmin, blogStatisticsByDate);
reportRouter.get("/get-stats", isAdmin, getStats);

export default reportRouter;
