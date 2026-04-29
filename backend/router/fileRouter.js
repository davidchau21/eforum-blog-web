import multer from "multer";
import express from "express";

import { isAuthenticate } from "../middleware/verifyToken.js";
import fileController from "../controller/file.controller.js";

const router = express.Router();
const multerStorage = multer.memoryStorage();
const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});
const uploadFiles = upload.array("files", 10);
const errorArray = [
    "LIMIT_PART_COUNT",
    "LIMIT_FILE_SIZE",
    "LIMIT_FILE_COUNT",
    "LIMIT_FIELD_KEY",
    "LIMIT_FIELD_VALUE",
    "LIMIT_FIELD_COUNT",
    "LIMIT_UNEXPECTED_FILE",
];
const uploads = (req, res, next) => {
    uploadFiles(req, res, (err) => {
        if (err) {
            return res.json({
                status: false,
                ...err,
            });
        }
        return next();
    });
};
router.post("/", isAuthenticate, uploads, (req, res) => fileController.uploadFiles(req, res));
router.get("/get-upload-url", (req, res) => fileController.getUploadUrl(req, res));

export default router;