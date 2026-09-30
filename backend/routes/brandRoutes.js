import express from "express";
import upload from "../middleware/upload.js";
import {
  createBrand,
  getAllBrands,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import verifyAdminMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllBrands);
router.post("/", verifyAdminMiddleware, upload.single("image"), createBrand);
router.put("/:id", verifyAdminMiddleware, upload.single("image"), updateBrand);
router.delete("/:id", verifyAdminMiddleware, deleteBrand);

export default router;
