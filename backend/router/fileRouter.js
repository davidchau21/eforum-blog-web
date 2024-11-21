import multer from "multer";
import express from "express";

import { isAuthenticate } from "../middleware/verifyToken.js";
import {createFile} from "../controller/fileController.js";
const router = express.Router();
const multerStorage = multer.memoryStorage();
const upload = multer({
    storage: multerStorage,
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
            if (errorArray.includes(err.code)) {
                return res.json({
                    status: false,
                    ...err,
                });
            }
            return res.json({
                status: false,
                ...err,
            });
        }

        return next();
    });
};
router.post("/", isAuthenticate, uploads, createFile);

export default router;