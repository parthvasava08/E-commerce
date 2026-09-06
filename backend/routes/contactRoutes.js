import express from "express";
import {
  submitContact,
  getAllMessages,
  deleteMessage,
} from "../controllers/contactController.js";
import verifyAdminMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", submitContact);

router.get("/", verifyAdminMiddleware, getAllMessages);
router.delete("/:id", verifyAdminMiddleware, deleteMessage);

export default router;
