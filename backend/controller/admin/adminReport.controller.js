import { BaseController } from "../BaseController.js";
import adminReportService from "../../service/admin/adminReportService.js";

class AdminReportController extends BaseController {
  async totalUser(req, res) {
    try {
      const count = await adminReportService.getTotalUsers();
      return this.sendSuccess(res, { totalUser: count });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async totalBlog(req, res) {
    try {
      const count = await adminReportService.getTotalBlogs();
      return this.sendSuccess(res, { totalBlog: count });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async totalComment(req, res) {
    try {
      const count = await adminReportService.getTotalComments();
      return this.sendSuccess(res, { totalComment: count });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async userGrowth(req, res) {
    try {
      const result = await adminReportService.getUserGrowth(req.query);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async userGrowthChart(req, res) {
    try {
      const result = await adminReportService.getUserGrowthChart(req.query);
      return this.sendSuccess(res, { growthData: result });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async blogStatistics(req, res) {
    try {
      const result = await adminReportService.getBlogStatistics();
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async weeklyInteractionStatistics(req, res) {
    try {
      const result = await adminReportService.getWeeklyInteractionStatistics();
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async blogStatisticsByDate(req, res) {
    try {
      const result = await adminReportService.getBlogStatisticsByDate(req.query);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getStats(req, res) {
    try {
      const result = await adminReportService.getStats();
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new AdminReportController();
