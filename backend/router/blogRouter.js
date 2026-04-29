import express from "express";
import { isAuthenticate } from "../middleware/verifyToken.js";
import userBlogController from "../controller/userBlog.controller.js";
import adminBlogController from "../controller/admin/adminBlog.controller.js";

const blogRouter = express.Router();

// Public routes
blogRouter.post("/latest-blogs", (req, res) => userBlogController.getLatestBlogs(req, res));
blogRouter.post("/all-latest-blogs-count", (req, res) => userBlogController.getAllLatestBlogsCount(req, res));
blogRouter.get("/trending-blogs", (req, res) => userBlogController.getTrendingBlogs(req, res));
blogRouter.post("/search-blogs", (req, res) => userBlogController.searchBlogs(req, res));
blogRouter.post("/search-blogs-count", (req, res) => userBlogController.searchBlogsCount(req, res));
blogRouter.post("/get-blog", (req, res) => userBlogController.getBlog(req, res));
blogRouter.get("/admin-blogs", (req, res) => userBlogController.getAdminBlogs(req, res));

// Authenticated user routes
blogRouter.get("/list", isAuthenticate, (req, res) => adminBlogController.listBlogs(req, res));
blogRouter.get("/id/:id", isAuthenticate, (req, res) => userBlogController.getBlogById(req, res));
blogRouter.post("/report/:id", isAuthenticate, (req, res) => userBlogController.reportBlog(req, res));
blogRouter.post("/create-blog", isAuthenticate, (req, res) => userBlogController.createBlog(req, res));
blogRouter.post("/get-user-blogs", isAuthenticate, (req, res) => userBlogController.getFollowingBlogs(req, res));
blogRouter.post("/following-blogs-count", isAuthenticate, (req, res) => userBlogController.getFollowingBlogsCount(req, res));
blogRouter.post("/track-interest", isAuthenticate, (req, res) => userBlogController.trackInterest(req, res));
blogRouter.post("/share-blog", isAuthenticate, (req, res) => userBlogController.shareBlog(req, res));
blogRouter.post("/like-blog", isAuthenticate, (req, res) => userBlogController.likeBlog(req, res));
blogRouter.post("/isliked-by-user", isAuthenticate, (req, res) => userBlogController.isLikedByUser(req, res));

// --- Saved Blogs and Collections ---
blogRouter.post("/save-blog", isAuthenticate, (req, res) => userBlogController.saveBlog(req, res));
blogRouter.post("/is-saved-by-user", isAuthenticate, (req, res) => userBlogController.isSavedByUser(req, res));
blogRouter.get("/get-saved-blogs", isAuthenticate, (req, res) => userBlogController.getSavedBlogs(req, res));
blogRouter.put("/save-blog/move", isAuthenticate, (req, res) => userBlogController.moveSavedBlog(req, res));

blogRouter.get("/collections", isAuthenticate, (req, res) => userBlogController.getCollections(req, res));
blogRouter.post("/collections", isAuthenticate, (req, res) => userBlogController.createCollection(req, res));
blogRouter.put("/collections/:collection_id", isAuthenticate, (req, res) => userBlogController.updateCollection(req, res));
blogRouter.delete("/collections/:collection_id", isAuthenticate, (req, res) => userBlogController.deleteCollection(req, res));
// ------------------------------------

blogRouter.post("/user-written-blogs", isAuthenticate, (req, res) => userBlogController.getUserWrittenBlogs(req, res));
blogRouter.post("/user-written-blogs-count", isAuthenticate, (req, res) => userBlogController.getUserWrittenBlogsCount(req, res));
blogRouter.post("/delete-blog", isAuthenticate, (req, res) => userBlogController.deleteBlog(req, res));

// Admin specific blogs (if still needed here, but usually in adminRouter)
// blogRouter.get("/admin-blogs", (req, res) => ...); 

export default blogRouter;
