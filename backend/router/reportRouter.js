import express from "express";
import { isAdmin } from "../middleware/verifyToken.js";
import {
  totalBlog,
  totalComment,
  totalUser,
} from "../controller/reportController.js";

const reportRouter = express.Router();

reportRouter.get("/total-user", isAdmin, totalUser);
reportRouter.get("/total-blog", isAdmin, totalBlog);
reportRouter.get("/total-comment", isAdmin, totalComment);

export default reportRouter;
