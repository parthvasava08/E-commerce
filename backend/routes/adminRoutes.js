import express from "express";
import rateLimit from "express-rate-limit";
import {
  loginAdmin,
  verifyAdmin,
  logoutAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} from "../controllers/adminController.js";
import verifyAdminMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

router.post("/login", loginAdmin);
router.get("/verify", verifyAdminMiddleware, verifyAdmin);
router.post("/logout", verifyAdminMiddleware, logoutAdmin);

router.get("/profile", verifyAdminMiddleware, getAdminProfile);
router.put("/profile", verifyAdminMiddleware, updateAdminProfile);
router.put(
  "/change-password",
  verifyAdminMiddleware,
  passwordLimiter,
  changeAdminPassword,
);

export default router;
