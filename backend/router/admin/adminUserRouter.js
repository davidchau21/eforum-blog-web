import express from "express";
import { isAdmin } from "../../middleware/verifyToken.js";
import adminUserController from "../../controller/admin/adminUser.controller.js";

const adminUserRouter = express.Router();

// Giữ nguyên đường dẫn cũ: /users/admin/users...
adminUserRouter.get("/admin/users", isAdmin, (req, res) => adminUserController.getAllUsers(req, res));
adminUserRouter.get("/admin/users/:id", isAdmin, (req, res) => adminUserController.findUserById(req, res));
adminUserRouter.post("/admin/users", isAdmin, (req, res) => adminUserController.createUser(req, res));
adminUserRouter.post("/admin/users/:id", isAdmin, (req, res) => adminUserController.updateUser(req, res));
adminUserRouter.post("/admin/block-comment/:id", isAdmin, (req, res) => adminUserController.toggleBlockComment(req, res));

export default adminUserRouter;
