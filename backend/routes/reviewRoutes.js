import express from "express";
import {
  getProductReviews,
  getMyReview,
  createReview,
  updateReview,
  deleteMyReview,
  getAllReviewsAdmin,
  adminDeleteReview,
} from "../controllers/Reviewcontroller.js";
import verifyUserMiddleware from "../middleware/userAuthMiddleware.js";
import verifyAdminMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/product/:productId", getProductReviews);

router.get("/mine/:productId", verifyUserMiddleware, getMyReview);
router.post("/", verifyUserMiddleware, createReview);

router.get("/admin/all", verifyAdminMiddleware, getAllReviewsAdmin);
router.delete("/admin/:id", verifyAdminMiddleware, adminDeleteReview);

router.put("/:id", verifyUserMiddleware, updateReview);
router.delete("/:id", verifyUserMiddleware, deleteMyReview);

export default router;
