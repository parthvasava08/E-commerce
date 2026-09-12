import express from "express";
import { getAllPayments } from "../controllers/paymentController.js";
import verifyAdminMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyAdminMiddleware, getAllPayments);

export default router;
