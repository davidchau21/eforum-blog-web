import express from "express";
import { isAdmin } from "../../middleware/verifyToken.js";
import adminCommentController from "../../controller/admin/adminComment.controller.js";

const adminCommentRouter = express.Router();

adminCommentRouter.get("/", isAdmin, (req, res) => adminCommentController.getAllComments(req, res));
adminCommentRouter.delete("/:id", isAdmin, (req, res) => adminCommentController.deleteComment(req, res));
adminCommentRouter.post("/remove/report/:id", isAdmin, (req, res) => adminCommentController.removeReportComment(req, res));

export default adminCommentRouter;
