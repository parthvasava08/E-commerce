import express from "express";
import upload from "../middleware/upload.js";
import {
  createBrand,
  getAllBrands,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";

const router = express.Router();

router.get("/", getAllBrands);
router.post("/", upload.single("image"), createBrand);
router.put("/:id", upload.single("image"), updateBrand);
router.delete("/:id", deleteBrand);

export default router;
