import express from "express";
import searchController from "../controller/search.controller.js";

const router = express.Router();

router.get('/google', (req, res) => searchController.googleSearch(req, res));
router.get('/duckduckgo', (req, res) => searchController.duckduckgoSearch(req, res));
router.get('/scholar', (req, res) => searchController.googleScholarSearch(req, res));

export default router;