import express from "express";
import { requireDynamicPermission } from "../../middleware/verifyToken.js";
import adminCommentController from "../../controller/admin/adminComment.controller.js";

const adminCommentRouter = express.Router();

adminCommentRouter.get("/", requireDynamicPermission("COMMENT_VIEW"), (req, res) => adminCommentController.getAllComments(req, res));
adminCommentRouter.delete("/:id", requireDynamicPermission("COMMENT_DELETE"), (req, res) => adminCommentController.deleteComment(req, res));
adminCommentRouter.post("/remove/report/:id", requireDynamicPermission("COMMENT_REPORT_RESOLVE"), (req, res) => adminCommentController.removeReportComment(req, res));

export default adminCommentRouter;
