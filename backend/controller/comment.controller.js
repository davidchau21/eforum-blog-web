import { BaseController } from "./BaseController.js";
import commentService from "../service/comment.service.js";

class CommentController extends BaseController {
  async addComment(req, res) {
    try {
      const userId = req.user.id || req.user;
      const result = await commentService.addComment(userId, req.body);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getBlogComments(req, res) {
    try {
      const result = await commentService.getBlogComments(req.body);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getReplies(req, res) {
    try {
      const result = await commentService.getReplies(req.body);
      return this.sendSuccess(res, { replies: result });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deleteComment(req, res) {
    try {
      const userId = req.user.id || req.user;
      const result = await commentService.deleteComment(userId, req.body);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async hideComment(req, res) {
    try {
      const userId = req.user.id || req.user;
      const result = await commentService.hideComment(userId, req.body);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async reportComment(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await commentService.reportComment(userId, id);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new CommentController();
