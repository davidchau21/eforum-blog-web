import express from "express";
import { isAuthenticate } from "../middleware/verifyToken.js";
import messageController from "../controller/message.controller.js";

const router = express.Router();

router.get("/new-messages", isAuthenticate, (req, res) => messageController.getNewMessagesCount(req, res));
router.post("/group/create", isAuthenticate, (req, res) => messageController.createGroupConversation(req, res));
router.get("/group/info/:conversationId", isAuthenticate, (req, res) => messageController.getGroupInfo(req, res));
router.post("/group/leave/:conversationId", isAuthenticate, (req, res) => messageController.leaveGroup(req, res));
router.post("/group/remove-member/:conversationId", isAuthenticate, (req, res) => messageController.removeGroupMember(req, res));
router.post("/group/change-creator/:conversationId", isAuthenticate, (req, res) => messageController.changeGroupCreator(req, res));
router.post("/group/add-members/:conversationId", isAuthenticate, (req, res) => messageController.addGroupMembers(req, res));
router.post("/group/toggle-invite/:conversationId", isAuthenticate, (req, res) => messageController.toggleInvitePermission(req, res));
router.post("/group/update/:conversationId", isAuthenticate, (req, res) => messageController.updateGroupInfo(req, res));
router.post("/group/disband/:conversationId", isAuthenticate, (req, res) => messageController.disbandGroup(req, res));
router.get("/group/:conversationId", isAuthenticate, (req, res) => messageController.getGroupMessages(req, res));
router.post("/group/send/:conversationId", isAuthenticate, (req, res) => messageController.sendGroupMessage(req, res));
router.get("/:id", isAuthenticate, (req, res) => messageController.getMessages(req, res));
router.get("/media/:id", isAuthenticate, (req, res) => messageController.getConversationMedia(req, res));
router.post("/send/:id", isAuthenticate, (req, res) => messageController.sendMessage(req, res));
router.delete("/conversation/:id", isAuthenticate, (req, res) => messageController.deleteConversation(req, res));

export default router;