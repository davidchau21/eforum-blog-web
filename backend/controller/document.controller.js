import { BaseController } from "./BaseController.js";
import documentService from "../service/document.service.js";

class DocumentController extends BaseController {
  async uploadDocument(req, res) {
    try {
      const userId = req.user.id;
      const file = req.file; // standard single file upload
      const { title, description } = req.body;

      const result = await documentService.uploadDocument(userId, file, title, description);
      return this.sendSuccess(res, result, 201);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getUserDocuments(req, res) {
    try {
      const userId = req.user.id;
      const { search, sort, page, limit } = req.query;
      const result = await documentService.getDocuments(
        search,
        sort || "latest",
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 5,
        userId
      );
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getDocuments(req, res) {
    try {
      const { search, sort, page, limit, authorId } = req.query;
      const result = await documentService.getDocuments(
        search,
        sort,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 6,
        authorId
      );
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async getDocumentById(req, res) {
    try {
      const documentId = req.params.id;
      const result = await documentService.getDocumentById(documentId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 404);
    }
  }

  async incrementDownload(req, res) {
    try {
      const documentId = req.params.id;
      const result = await documentService.incrementDownload(documentId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async deleteDocument(req, res) {
    try {
      const documentId = req.params.id;
      const userId = req.user.id;
      const result = await documentService.deleteDocument(documentId, userId);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 403);
    }
  }
}

export default new DocumentController();
