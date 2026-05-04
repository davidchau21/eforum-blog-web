import express from "express";
import { isAdmin } from "../../middleware/verifyToken.js";
import adminAlertController from "../../controller/admin/adminAlert.controller.js";

const adminAlertRouter = express.Router();

adminAlertRouter.post("/", isAdmin, (req, res) => adminAlertController.createAlert(req, res));
adminAlertRouter.delete("/:id", isAdmin, (req, res) => adminAlertController.deleteAlert(req, res));

export default adminAlertRouter;
