import express from "express";
import { isAdmin, isAuthenticate } from "../middleware/verifyToken.js";
import {
  blockComment,
  createUser,
  findUserById,
  getAllUser,
  getUserForSidebar,
  updateUserById,
  userOnline,
} from "../controller/userController.js";

const router = express.Router();

router.get("/", isAuthenticate, getUserForSidebar);
router.post("/online", isAuthenticate, userOnline);
router.get("/admin/users", isAdmin, getAllUser);
router.get("/admin/users/:id", isAdmin, findUserById);
router.post("/admin/users", isAdmin, createUser);
router.post("/admin/users/:id", isAdmin, updateUserById);
router.post("/admin/block-comment/:id", isAdmin, blockComment);

export default router;
