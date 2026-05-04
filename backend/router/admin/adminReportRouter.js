import express from "express";
import { isAdmin } from "../../middleware/verifyToken.js";
import adminReportController from "../../controller/admin/adminReport.controller.js";

const adminReportRouter = express.Router();

adminReportRouter.get("/total-user", isAdmin, (req, res) => adminReportController.totalUser(req, res));
adminReportRouter.get("/total-blog", isAdmin, (req, res) => adminReportController.totalBlog(req, res));
adminReportRouter.get("/total-comment", isAdmin, (req, res) => adminReportController.totalComment(req, res));
adminReportRouter.get("/user-growth", isAdmin, (req, res) => adminReportController.userGrowth(req, res));
adminReportRouter.get("/user-chart-bydate", isAdmin, (req, res) => adminReportController.userGrowthChart(req, res));
adminReportRouter.get("/blog-statistic", isAdmin, (req, res) => adminReportController.blogStatistics(req, res));
adminReportRouter.get("/weekly-interactions", isAdmin, (req, res) => adminReportController.weeklyInteractionStatistics(req, res));
adminReportRouter.get("/blog-statistics-bydate", isAdmin, (req, res) => adminReportController.blogStatisticsByDate(req, res));
adminReportRouter.get("/get-stats", isAdmin, (req, res) => adminReportController.getStats(req, res));

export default adminReportRouter;
