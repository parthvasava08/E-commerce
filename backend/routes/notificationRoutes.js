import express from "express";
import { getNotifications } from "../controllers/notificationController.js";
import verifyAdminMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyAdminMiddleware, getNotifications);

export default router;
