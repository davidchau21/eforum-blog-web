import { env } from "./env.js";

export const googleSearchConfig = {
  url: env.GOOGLE_SEARCH_URL,
  apiKey: env.GOOGLE_API_KEY,
  cx: env.GOOGLE_CX,
};

export const scholarSearchConfig = {
  apiKey: env.SCRAPINGDOG_API_KEY || "673059586bacfc160ce4192e",
  url: env.GOOGLE_SCHOLAR_URL || "https://api.scrapingdog.com/google_scholar/",
  language: env.GOOGLE_SCHOLAR_LANGUAGE || "vi",
  results: Number(env.GOOGLE_SCHOLAR_RESULTS) || 10,
};
