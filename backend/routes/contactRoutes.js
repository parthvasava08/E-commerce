import express from "express";
import {
  submitContact,
  getAllMessages,
  getUnreadCount,
  markMessageRead,
  deleteMessage,
} from "../controllers/contactController.js";
import verifyAdminMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", submitContact);

router.get("/", verifyAdminMiddleware, getAllMessages);
router.get("/unread-count", verifyAdminMiddleware, getUnreadCount);
router.put("/:id/read", verifyAdminMiddleware, markMessageRead);
router.delete("/:id", verifyAdminMiddleware, deleteMessage);

export default router;
