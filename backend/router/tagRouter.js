import express from "express";
import { isAdmin, isAuthenticate } from "../middleware/verifyToken.js";
import {
  createTag,
  deleteTag,
  getAllTags,
  getTagById,
  updateTag,
} from "../controller/tagController.js";

const tagRouter = express.Router();

tagRouter.get("/", isAuthenticate, getAllTags);
tagRouter.get("/:id", isAuthenticate, getTagById);
tagRouter.post("/", isAdmin, createTag);
tagRouter.put("/:id", isAdmin, updateTag);
tagRouter.delete("/:id", isAdmin, deleteTag);

export default tagRouter;