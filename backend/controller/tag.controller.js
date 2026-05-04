import { BaseController } from "./BaseController.js";
import tagService from "../service/tag.service.js";

class TagController extends BaseController {
  async createTag(req, res) {
    try {
      const { tag_name } = req.body;
      const result = await tagService.createTag(tag_name);
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
