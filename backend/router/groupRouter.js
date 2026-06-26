import express from "express";
import { isAuthenticate, isAuthenticateOptional } from "../middleware/verifyToken.js";
import groupController from "../controller/group.controller.js";

const groupRouter = express.Router();

// Public routes
groupRouter.get("/list", isAuthenticateOptional, (req, res) => groupController.getGroups(req, res));
groupRouter.get("/id/:id", isAuthenticateOptional, (req, res) => groupController.getGroupById(req, res));

// Authenticated group routes
groupRouter.post("/create", isAuthenticate, (req, res) => groupController.createGroup(req, res));
groupRouter.post("/id/:id/join", isAuthenticate, (req, res) => groupController.joinGroup(req, res));
groupRouter.post("/id/:id/leave", isAuthenticate, (req, res) => groupController.leaveGroup(req, res));
groupRouter.post("/id/:id/toggle-mute", isAuthenticate, (req, res) => groupController.toggleMuteNotifications(req, res));

// Membership administration
groupRouter.get("/id/:id/members", isAuthenticateOptional, (req, res) => groupController.getMembers(req, res));
groupRouter.post("/id/:id/members/:userId/approve", isAuthenticate, (req, res) => groupController.approveMember(req, res));
groupRouter.put("/id/:id/members/:userId/role", isAuthenticate, (req, res) => groupController.updateMemberRole(req, res));
groupRouter.delete("/id/:id/members/:userId", isAuthenticate, (req, res) => groupController.removeMember(req, res));
groupRouter.put("/id/:id/settings", isAuthenticate, (req, res) => groupController.updateGroupSettings(req, res));
groupRouter.delete("/id/:id", isAuthenticate, (req, res) => groupController.deleteGroup(req, res));
groupRouter.post("/id/:id/invite", isAuthenticate, (req, res) => groupController.inviteMember(req, res));
groupRouter.get("/id/:id/stats", isAuthenticate, (req, res) => groupController.getGroupStats(req, res));

// Scoped group contents
groupRouter.get("/id/:id/blogs", isAuthenticateOptional, (req, res) => groupController.getGroupBlogs(req, res));
groupRouter.get("/id/:id/my-blogs", isAuthenticate, (req, res) => groupController.getUserGroupBlogs(req, res));
groupRouter.get("/id/:id/blogs/pending", isAuthenticate, (req, res) => groupController.getPendingBlogs(req, res));
groupRouter.post("/id/:id/blogs/:blogId/approve", isAuthenticate, (req, res) => groupController.approveBlog(req, res));
groupRouter.delete("/id/:id/blogs/:blogId/reject", isAuthenticate, (req, res) => groupController.rejectBlog(req, res));
groupRouter.get("/id/:id/documents", isAuthenticateOptional, (req, res) => groupController.getGroupDocuments(req, res));

export default groupRouter;
