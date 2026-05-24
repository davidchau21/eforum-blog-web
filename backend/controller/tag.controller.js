import { BaseController } from "./BaseController.js";
import tagService from "../service/tag.service.js";
import adminActivityLogService from "../service/admin/adminActivityLogService.js";

class TagController extends BaseController {
  async createTag(req, res) {
    try {
      const { tag_name } = req.body;
      const result = await tagService.createTag(tag_name);

      // Log dynamic action if authenticated
      if (req.user && req.user.id) {
        await adminActivityLogService.log({
          userId: req.user.id,
          action: "CATEGORY_CREATE",
          targetType: "Category",
          targetId: result._id,
          details: `Tạo danh mục mới: "${tag_name}"`,
          ip: req.ip,
        });
      }

      return this.sendSuccess(res, result);
    } catch (error) {
      if (error.message === "Tag already exists") {
        return this.sendSuccess(res, { message: "Tag already exists" }, 201);
      }
      return this.sendError(res, error.message);
    }
  }

  async getAllTags(req, res) {
    try {
      const result = await tagService.getAllTags(req.query);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getTagById(req, res) {
    try {
      const { id } = req.params;
      const result = await tagService.getTagById(id);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new TagController();
