import multer from "multer";
import express from "express";

import { isAuthenticate } from "../middleware/verifyToken.js";
import documentController from "../controller/document.controller.js";

const router = express.Router();
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 15 * 1024 * 1024 } // Limit 15MB
});

const uploadSingleFile = upload.single("file");

const handleUploadMiddleware = (req, res, next) => {
  uploadSingleFile(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          status: false,
          error: "Dung lượng file vượt quá giới hạn 15MB."
        });
      }
      return res.status(400).json({
        status: false,
        error: err.message
      });
    }
    return next();
  });
};

router.post("/", isAuthenticate, handleUploadMiddleware, (req, res) =>
  documentController.uploadDocument(req, res)
);
router.get("/", (req, res) => documentController.getDocuments(req, res));
router.get("/user-documents", isAuthenticate, (req, res) =>
  documentController.getUserDocuments(req, res)
);
router.get("/:id", (req, res) => documentController.getDocumentById(req, res));
router.post("/:id/download", (req, res) =>
  documentController.incrementDownload(req, res)
);
router.delete("/:id", isAuthenticate, (req, res) =>
  documentController.deleteDocument(req, res)
);

export default router;
