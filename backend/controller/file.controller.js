import { BaseController } from "./BaseController.js";
import fileService from "../service/file.service.js";

class FileController extends BaseController {
  async uploadFiles(req, res) {
    try {
      const userId = req.user.id;
      const result = await fileService.uploadFiles(userId, req.files);
      return this.sendSuccess(res, result);
    } catch (error) {
      if (error.message === "No files uploaded") {
        return this.sendError(res, error.message, 400);
      }
      return this.sendError(res, error.message);
    }
  }

  async getUploadUrl(req, res) {
    try {
      const result = await fileService.getUploadUrl();
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new FileController();
