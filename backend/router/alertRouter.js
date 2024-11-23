import express from "express";
import { isAdmin, isAuthenticate } from "../middleware/verifyToken.js";
import {
  createAlert,
  deleteAlert,
  getAlertById,
  getAllAlert,
} from "../controller/alertController.js";

const alerRouter = express.Router();

alerRouter.get("/", isAuthenticate, getAllAlert);
alerRouter.get("/:id", isAuthenticate, getAlertById);
alerRouter.post("/", isAdmin, createAlert);
alerRouter.delete("/:id", isAdmin, deleteAlert);

export default alerRouter;
