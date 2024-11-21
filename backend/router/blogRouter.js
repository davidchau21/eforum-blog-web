import express from "express";
import { isAdmin, isAuthenticate } from "../middleware/verifyToken.js";
import {
  activateBlog,
  createOrUpdateBlog,
  deleteBlog,
  getBlogById,
  getBlogs,
  removeReportBlog,
  reportBlog,
} from "../controller/blogController.js";

const blogRouter = express.Router();

blogRouter.get("/", isAuthenticate, getBlogs);
blogRouter.get("/:id", isAuthenticate, getBlogById);
blogRouter.post("/", isAdmin, createOrUpdateBlog);
blogRouter.delete("/:id", isAdmin, deleteBlog);
blogRouter.post("/activate/:id", isAdmin, activateBlog);
blogRouter.post("/report/:id", isAuthenticate, reportBlog);
blogRouter.post("/remove/report/:id", isAdmin, removeReportBlog);
export default blogRouter;
