import express from "express";
import {
  createRazorpayOrder,
  placeCodOrder,
  verifyRazorpayPayment,
} from "../controllers/checkoutController.js";
import verifyUserMiddleware from "../middleware/userAuthMiddleware.js";

const router = express.Router();

router.post(
  "/razorpay/create-order",
  verifyUserMiddleware,
  createRazorpayOrder,
);
router.post("/razorpay/verify", verifyUserMiddleware, verifyRazorpayPayment);
router.post("/cod", verifyUserMiddleware, placeCodOrder);

export default router;
