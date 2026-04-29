import { BaseController } from "./BaseController.js";
import blogService from "../service/blog.service.js";

class UserBlogController extends BaseController {
  async createBlog(req, res) {
    try {
      const authorId = req.user.id || req.user;
      const result = await blogService.createOrUpdateBlog({
        ...req.body,
        authorId,
      });
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendForbidden(res, error.message);
    }
  }

  async getBlog(req, res) {
    try {
      const { blog_id, draft, mode } = req.body;
      const userId = req.user ? req.user.id : null;
      const result = await blogService.getBlog({ blog_id, draft, mode, userId });
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deleteBlog(req, res) {
    try {
      const userId = req.user.id || req.user;
      const { blog_id } = req.body;
      const result = await blogService.deleteBlog(blog_id, userId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getLatestBlogs(req, res) {
    try {
      const { page } = req.body;
      // Note: We can expand this to include followingIds and interests
      const result = await blogService.getLatestBlogs({ page });
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getAllLatestBlogsCount(req, res) {
    try {
      const count = await blogService.getAllLatestBlogsCount();
      return this.sendSuccess(res, { totalDocs: count });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getTrendingBlogs(req, res) {
    try {
      const blogs = await blogService.getTrendingBlogs();
      return this.sendSuccess(res, { blogs });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async searchBlogs(req, res) {
    try {
      const blogs = await blogService.searchBlogs(req.body);
      return this.sendSuccess(res, { blogs });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async searchBlogsCount(req, res) {
    try {
      const count = await blogService.searchBlogsCount(req.body);
      return this.sendSuccess(res, { totalDocs: count });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async trackInterest(req, res) {
    try {
      const userId = req.user.id || req.user;
      const status = await blogService.trackInterest(userId, req.body.tags);
      return this.sendSuccess(res, { status });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async shareBlog(req, res) {
    try {
      const userId = req.user.id || req.user;
      const { blog_id, ...metadata } = req.body;
      const result = await blogService.shareBlog(blog_id, userId, metadata);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async likeBlog(req, res) {
    try {
      const userId = req.user.id || req.user;
      const { _id, islikedByUser } = req.body;
      const result = await blogService.likeBlog(_id, userId, islikedByUser);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async isLikedByUser(req, res) {
    try {
      const userId = req.user.id || req.user;
      const { _id } = req.body;
      const result = await blogService.isLikedByUser(_id, userId);
      return this.sendSuccess(res, { result });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getUserWrittenBlogs(req, res) {
    try {
      const userId = req.user.id || req.user;
      const blogs = await blogService.getUserWrittenBlogs(userId, req.body);
      return this.sendSuccess(res, { blogs });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getUserWrittenBlogsCount(req, res) {
    try {
      const userId = req.user.id || req.user;
      const count = await blogService.getUserWrittenBlogsCount(userId, req.body);
      return this.sendSuccess(res, { totalDocs: count });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async saveBlog(req, res) {
    try {
      const userId = req.user.id;
      const { blog_id } = req.body;
      const result = await blogService.saveBlog(userId, blog_id);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getSavedBlogs(req, res) {
    try {
      const userId = req.user.id;
      const { page } = req.query;
      const result = await blogService.getSavedBlogs(userId, page);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getSavedBlogsCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await blogService.getSavedBlogsCount(userId);
      return this.sendSuccess(res, { totalDocs: count });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async isSavedByUser(req, res) {
    try {
      const userId = req.user.id;
      const { blog_id } = req.body;
      const result = await blogService.isSavedByUser(userId, blog_id);
      return this.sendSuccess(res, { result });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getBlogById(req, res) {
    try {
      const { id } = req.params;
      const result = await blogService.getBlogById(id);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async reportBlog(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await blogService.reportBlog(id, userId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getFollowingBlogs(req, res) {
    try {
      const userId = req.user.id;
      const { page } = req.body;
      const result = await blogService.getFollowingBlogs(userId, page);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getFollowingBlogsCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await blogService.getFollowingBlogsCount(userId);
      return this.sendSuccess(res, { totalDocs: count });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getAdminBlogs(req, res) {
    try {
      const result = await blogService.getAdminBlogs();
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new UserBlogController();
