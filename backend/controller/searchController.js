import axios from 'axios';
import { search } from 'duck-duck-scrape';
import {
    googleSearchConfig,
    scholarSearchConfig,
} from "../config/search.js";

const googleSearchUrl = googleSearchConfig.url;
const googleApiKey = googleSearchConfig.apiKey;
const googleCx = googleSearchConfig.cx;

const api_key = scholarSearchConfig.apiKey;
const url = scholarSearchConfig.url;


// search one keyword 
export const googleSearchOne = async (req, res) => {
    const { query, start = 1 } = req.query; 
    if (!query) return res.status(400).json({ error: 'Missing query parameter' });

    try {
        const response = await axios.get(googleSearchUrl, {
            params: {
                key: googleApiKey,
                cx: googleCx,
                q: query,
                start: parseInt(start), 
                num: 10, 
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing query' });
    }
};

// search one keyword
export const duckduckgoSearchOne = async (req, res) => {
    const { query } = req.query; 
    if (!query) return res.status(400).json({ error: 'Missing query parameter' });

    try {
        const results = await search(query);
        const topResults = results.results.slice(0, 10);
        res.status(200).json(topResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing query' });
    }
};


export const duckduckgoSearchOne1 = async (req, res) => {
    const { query } = req.query; 
    if (!query) return res.status(400).json({ error: 'Missing query parameter' });

    try {
        const response = await axios.get('https://api.duckduckgo.com/', {
            params: {
                q: query,
                format: 'json',
                no_redirect: '1',
                no_html: '1',
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing query' });
    }
};

export const googleScholarSearchOne = async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Missing query parameter' });

    try {
        const response = await axios.get(url, {
            params: {
                api_key: api_key,
                query: query,
                language: scholarSearchConfig.language,
                page: 0,
                results: scholarSearchConfig.results,
            },
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing query' });
    }
};
