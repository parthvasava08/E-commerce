import express from "express";
import upload from "../middleware/upload.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import verifyAdminMiddleware, {
  optionalAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

const productImages = upload.fields([
  { name: "cover_image", maxCount: 1 },
  { name: "image_1", maxCount: 1 },
  { name: "image_2", maxCount: 1 },
  { name: "image_3", maxCount: 1 },
  { name: "image_4", maxCount: 1 },
]);

router.get("/", optionalAdmin, getAllProducts);
router.get("/:id", getProductById);
router.post("/", verifyAdminMiddleware, productImages, createProduct);
router.put("/:id", verifyAdminMiddleware, productImages, updateProduct);
router.delete("/:id", verifyAdminMiddleware, deleteProduct);
export default router;
