import express from "express";
import {
  createSubCategory,
  getAllSubCategories,
} from "../controllers/subCategoryController.js";

const router = express.Router();

router.post("/", createSubCategory);
router.get("/", getAllSubCategories);

export default router;
