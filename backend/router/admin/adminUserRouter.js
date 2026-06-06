import express from "express";
import { requireDynamicPermission, isAuthenticate } from "../../middleware/verifyToken.js";
import adminUserController from "../../controller/admin/adminUser.controller.js";
import validateDateRange from "../../middleware/validateDateRange.js";

const adminUserRouter = express.Router();

adminUserRouter.get("/admin/users", requireDynamicPermission("USER_VIEW"), validateDateRange, (req, res) => adminUserController.getAllUsers(req, res));
adminUserRouter.get("/admin/users/:id", requireDynamicPermission("USER_VIEW"), (req, res) => adminUserController.findUserById(req, res));
adminUserRouter.post("/admin/users", requireDynamicPermission("USER_CREATE"), (req, res) => adminUserController.createUser(req, res));
adminUserRouter.post("/admin/users/:id", requireDynamicPermission("USER_UPDATE"), (req, res) => adminUserController.updateUser(req, res));
adminUserRouter.post("/admin/block-comment/:id", requireDynamicPermission("USER_BLOCK"), (req, res) => adminUserController.toggleBlockComment(req, res));
adminUserRouter.post("/admin/disable-user/:id", requireDynamicPermission("USER_BLOCK"), (req, res) => adminUserController.toggleDisableUser(req, res));
adminUserRouter.delete("/admin/users/:id", requireDynamicPermission("USER_DELETE"), (req, res) => adminUserController.deleteUser(req, res));
adminUserRouter.get("/admin/me", isAuthenticate, (req, res) => adminUserController.getMyProfile(req, res));

export default adminUserRouter;
