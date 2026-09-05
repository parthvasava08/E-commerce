import express from "express";
import { getUserOrders } from "../controllers/orderController.js";
import verifyUserMiddleware from "../middleware/userAuthMiddleware.js";

const router = express.Router();

router.get("/", verifyUserMiddleware, getUserOrders);

export default router;
