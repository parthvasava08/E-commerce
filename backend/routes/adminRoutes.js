import express from "express";
import {
  loginAdmin,
  verifyAdmin,
  logoutAdmin,
} from "../controllers/adminController.js";
import verifyAdminMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/verify", verifyAdminMiddleware, verifyAdmin);
router.post("/logout", verifyAdminMiddleware, logoutAdmin);

export default router;
