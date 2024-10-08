import express from "express";
import { isAuthenticate } from "../middleware/verifyToken.js";
import { getUserForSidebar ,userOnline } from "../controller/userController.js";

const router = express.Router();

router.get("/", isAuthenticate, getUserForSidebar);
router.post("/online", isAuthenticate, userOnline);

export default router;