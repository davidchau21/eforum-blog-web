import express from "express";
import { requireDynamicPermission } from "../../middleware/verifyToken.js";
import adminBlogController from "../../controller/admin/adminBlog.controller.js";
import validateDateRange from "../../middleware/validateDateRange.js";

const adminBlogRouter = express.Router();

adminBlogRouter.get("/", requireDynamicPermission("BLOG_VIEW"), validateDateRange, (req, res) => adminBlogController.listBlogs(req, res));
adminBlogRouter.delete("/:id", requireDynamicPermission("BLOG_DELETE"), (req, res) => adminBlogController.deleteBlog(req, res));
adminBlogRouter.post("/activate/:id", requireDynamicPermission("BLOG_DISABLE"), (req, res) => adminBlogController.toggleActivation(req, res));
adminBlogRouter.post("/remove/report/:id", requireDynamicPermission("BLOG_DISABLE"), (req, res) => adminBlogController.removeReportBlog(req, res));

export default adminBlogRouter;
