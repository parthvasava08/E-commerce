import express from "express";
import upload from "../middleware/upload.js";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

const productImages = upload.fields([
  { name: "cover_image", maxCount: 1 },
  { name: "image_1", maxCount: 1 },
  { name: "image_2", maxCount: 1 },
  { name: "image_3", maxCount: 1 },
  { name: "image_4", maxCount: 1 },
]);

router.get("/", getAllProducts);
router.post("/", productImages, createProduct);
router.put("/:id", productImages, updateProduct);
router.delete("/:id", deleteProduct);

export default router;
