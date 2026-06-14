import express from "express";
import chatController from "../controller/chat.controller.js";

const router = express.Router();

router.post("/support", (req, res) => chatController.handleSupportChat(req, res));

export default router;
