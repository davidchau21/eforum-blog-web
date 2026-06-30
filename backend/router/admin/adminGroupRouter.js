import express from "express";
import { requireDynamicPermission } from "../../middleware/verifyToken.js";
import adminGroupController from "../../controller/admin/adminGroup.controller.js";

const adminGroupRouter = express.Router();

adminGroupRouter.get("/", requireDynamicPermission("GROUP_VIEW"), (req, res) => adminGroupController.listGroups(req, res));
adminGroupRouter.post("/activate/:id", requireDynamicPermission("GROUP_DISABLE"), (req, res) => adminGroupController.toggleGroupStatus(req, res));
adminGroupRouter.delete("/:id", requireDynamicPermission("GROUP_DELETE"), (req, res) => adminGroupController.deleteGroup(req, res));

export default adminGroupRouter;
