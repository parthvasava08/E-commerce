import express from "express";
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";

const router = express.Router();

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export default router;
