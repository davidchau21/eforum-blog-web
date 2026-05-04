import { BaseController } from "./BaseController.js";
import searchService from "../service/search.service.js";

class SearchController extends BaseController {
  async googleSearch(req, res) {
    try {
      const { query } = req.query;
      if (!query) return this.sendError(res, "Missing query parameter", 400);
      const result = await searchService.googleSearch(req.query);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async duckduckgoSearch(req, res) {
    try {
      const { query } = req.query;
      if (!query) return this.sendError(res, "Missing query parameter", 400);
      const result = await searchService.duckduckgoSearch(query);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async googleScholarSearch(req, res) {
    try {
      const { query } = req.query;
      if (!query) return this.sendError(res, "Missing query parameter", 400);
      const result = await searchService.googleScholarSearch(query);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }
}

export default new SearchController();
