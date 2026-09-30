import express from "express";
import upload from "../middleware/upload.js";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import verifyAdminMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", verifyAdminMiddleware, upload.single("image"), createCategory);
router.get("/", getAllCategories);
router.put(
  "/:id",
  verifyAdminMiddleware,
  upload.single("image"),
  updateCategory,
);
router.delete("/:id", verifyAdminMiddleware, deleteCategory);

export default router;
