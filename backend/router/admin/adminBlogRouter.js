import express from "express";
import { isAdmin } from "../../middleware/verifyToken.js";
import adminBlogController from "../../controller/admin/adminBlog.controller.js";

const adminBlogRouter = express.Router();

adminBlogRouter.get("/", isAdmin, (req, res) => adminBlogController.listBlogs(req, res));
adminBlogRouter.delete("/:id", isAdmin, (req, res) => adminBlogController.deleteBlog(req, res));
adminBlogRouter.post("/activate/:id", isAdmin, (req, res) => adminBlogController.toggleActivation(req, res));
adminBlogRouter.post("/remove/report/:id", isAdmin, (req, res) => adminBlogController.removeReportBlog(req, res));

export default adminBlogRouter;
