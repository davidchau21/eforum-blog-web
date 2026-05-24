import express from "express";
import { isAuthenticate, requireDynamicPermission } from "../../middleware/verifyToken.js";
import adminRoleController from "../../controller/admin/adminRole.controller.js";

const adminRoleRouter = express.Router();

// Apply auth and privilege check for all role management APIs
adminRoleRouter.use(isAuthenticate);
adminRoleRouter.use(requireDynamicPermission("ROLE_MANAGE"));

adminRoleRouter.get("/", (req, res) => adminRoleController.getAllRoles(req, res));
adminRoleRouter.get("/permissions", (req, res) => adminRoleController.getAllPermissions(req, res));
adminRoleRouter.post("/", (req, res) => adminRoleController.createRole(req, res));

// Permission CRUD
adminRoleRouter.post("/permissions", (req, res) => adminRoleController.createPermission(req, res));
adminRoleRouter.put("/permissions/:id", (req, res) => adminRoleController.updatePermission(req, res));
adminRoleRouter.delete("/permissions/:id", (req, res) => adminRoleController.deletePermission(req, res));

adminRoleRouter.put("/:id", (req, res) => adminRoleController.updateRolePermissions(req, res));
adminRoleRouter.delete("/:id", (req, res) => adminRoleController.deleteRole(req, res));

export default adminRoleRouter;
