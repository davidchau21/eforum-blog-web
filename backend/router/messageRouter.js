import express from "express";
import { isAuthenticate } from "../middleware/verifyToken.js";
import messageController from "../controller/message.controller.js";

const router = express.Router();

router.get("/new-messages", isAuthenticate, (req, res) => messageController.getNewMessagesCount(req, res));
router.get("/:id", isAuthenticate, (req, res) => messageController.getMessages(req, res));
router.post("/send/:id", isAuthenticate, (req, res) => messageController.sendMessage(req, res));

export default router;