import express from "express";
import { isAuthenticate, requireDynamicPermission } from "../../middleware/verifyToken.js";
import adminActivityLogController from "../../controller/admin/adminActivityLog.controller.js";
import validateDateRange from "../../middleware/validateDateRange.js";

const adminActivityLogRouter = express.Router();

// Apply auth and privilege check for logs retrieval
adminActivityLogRouter.use(isAuthenticate);
adminActivityLogRouter.use(requireDynamicPermission("ROLE_MANAGE"));

adminActivityLogRouter.get("/", validateDateRange, (req, res) => adminActivityLogController.getActivityLogs(req, res));

export default adminActivityLogRouter;
