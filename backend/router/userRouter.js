import express from "express";
import { isAuthenticate } from "../middleware/verifyToken.js";
import userController from "../controller/user.controller.js";

const router = express.Router();

// Sidebar & Social routes
router.get("/", isAuthenticate, (req, res) => userController.getUserForSidebar(req, res));
router.post("/follow-user", isAuthenticate, (req, res) => userController.toggleFollow(req, res));
router.post("/search-users", (req, res) => userController.searchUsers(req, res));
router.post("/get-profile", (req, res) => userController.getProfile(req, res));
router.post("/update-profile-img", isAuthenticate, (req, res) => userController.updateProfileImg(req, res));
router.patch("/update-profile", isAuthenticate, (req, res) => userController.updateProfile(req, res));
router.post("/get-following-status", isAuthenticate, (req, res) => userController.getFollowingStatus(req, res));
router.get("/get-followers", (req, res) => userController.getFollowers(req, res));
router.get("/get-following", (req, res) => userController.getFollowing(req, res));

// Remaining routes to be migrated later (if any)
router.post("/online", isAuthenticate, (req, res) => userController.userOnline(req, res));

export default router;
