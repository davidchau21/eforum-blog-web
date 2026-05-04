import axios from 'axios';
import { search as ddgSearch } from 'duck-duck-scrape';
import { googleSearchConfig, scholarSearchConfig } from "../config/search.js";

class SearchService {
  async googleSearch({ query, start = 1 }) {
    const response = await axios.get(googleSearchConfig.url, {
      params: {
        key: googleSearchConfig.apiKey,
        cx: googleSearchConfig.cx,
        q: query,
        start: parseInt(start),
        num: 10,
      },
    });
    return response.data;
  }

  async duckduckgoSearch(query) {
    const results = await ddgSearch(query);
    return results.results.slice(0, 10);
  }

  async googleScholarSearch(query) {
    const response = await axios.get(scholarSearchConfig.url, {
      params: {
        api_key: scholarSearchConfig.apiKey,
        query: query,
        language: scholarSearchConfig.language,
        page: 0,
        results: scholarSearchConfig.results,
      },
    });
    return response.data;
  }
}

export default new SearchService();
