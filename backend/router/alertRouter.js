import express from "express";
import { isAuthenticate } from "../middleware/verifyToken.js";
import alertController from "../controller/alert.controller.js";

const alerRouter = express.Router();

alerRouter.get("/", isAuthenticate, (req, res) => alertController.getAllAlerts(req, res));
alerRouter.get("/:id", isAuthenticate, (req, res) => alertController.getAlertById(req, res));

export default alerRouter;
