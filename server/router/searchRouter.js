import express from "express";
import { googleSearchOne, duckduckgoSearchOne, googleScholarSearchOne} from "../controller/searchController.js";

const router = express.Router();

router.get('/google', googleSearchOne);
router.get('/duckduckgo', duckduckgoSearchOne);
router.get('/scholar', googleScholarSearchOne);

export default router;