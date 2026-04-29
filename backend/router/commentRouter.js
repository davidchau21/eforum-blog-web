import express from "express";
import { isAuthenticate } from "../middleware/verifyToken.js";
import commentController from "../controller/comment.controller.js";

const commnentRouter = express.Router();

// Report route
commnentRouter.post("/report/:id", isAuthenticate, (req, res) => commentController.reportComment(req, res));

// Comment routes
commnentRouter.post("/add", isAuthenticate, (req, res) => commentController.addComment(req, res));
commnentRouter.post("/get-blog-comments", (req, res) => commentController.getBlogComments(req, res));
commnentRouter.post("/get-replies", (req, res) => commentController.getReplies(req, res));
commnentRouter.post("/delete", isAuthenticate, (req, res) => commentController.deleteComment(req, res));
commnentRouter.post("/hide", isAuthenticate, (req, res) => commentController.hideComment(req, res));

export default commnentRouter;
