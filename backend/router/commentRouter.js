import express from "express";
import { isAdmin, isAuthenticate } from "../middleware/verifyToken.js";
import {
  deleteComment,
  getComments,
  removeReportComment,
  reportComment,
} from "../controller/commentController.js";

const commnentRouter = express.Router();

commnentRouter.delete("/:id", isAdmin, deleteComment);
commnentRouter.get("/", isAdmin, getComments);
commnentRouter.post("/report/:id", isAuthenticate, reportComment);
commnentRouter.post("/remove/report/:id", isAdmin, removeReportComment);
export default commnentRouter;
