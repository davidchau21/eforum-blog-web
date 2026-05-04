import express from "express";
import { isAdmin } from "../../middleware/verifyToken.js";
import adminTagController from "../../controller/admin/adminTag.controller.js";

const adminTagRouter = express.Router();

adminTagRouter.put("/:id", isAdmin, (req, res) => adminTagController.updateTag(req, res));
adminTagRouter.delete("/:id", isAdmin, (req, res) => adminTagController.deleteTag(req, res));

export default adminTagRouter;
