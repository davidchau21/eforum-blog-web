import express from "express";
import authController from "../controller/auth.controller.js";
import { isAuthenticate } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", (req, res) => authController.signup(req, res));
router.post("/signin", (req, res) => authController.signin(req, res));
router.post("/google-auth", (req, res) => authController.googleAuth(req, res));
router.post("/verify", (req, res) => authController.verifyOtp(req, res));
router.post("/refresh-token", (req, res) => authController.refreshToken(req, res));
router.post("/logout", isAuthenticate, (req, res) => authController.logout(req, res));
router.post("/change-password", isAuthenticate, (req, res) => authController.changePassword(req, res));
router.post("/forgot-password", (req, res) => authController.forgotPassword(req, res));
router.post("/reset-password", (req, res) => authController.resetPassword(req, res));

export default router;
