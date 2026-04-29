import express from "express";
import { isAuthenticate } from "../middleware/verifyToken.js";
import tagController from "../controller/tag.controller.js";

const tagRouter = express.Router();

tagRouter.get("/", (req, res) => tagController.getAllTags(req, res));
tagRouter.get("/:id", isAuthenticate, (req, res) => tagController.getTagById(req, res));
tagRouter.post("/", (req, res) => tagController.createTag(req, res));

export default tagRouter;
