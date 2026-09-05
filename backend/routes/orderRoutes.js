import express from "express";
import {
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import verifyAdminMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyAdminMiddleware, getAllOrders);
router.put("/:id/status", verifyAdminMiddleware, updateOrderStatus);

export default router;
