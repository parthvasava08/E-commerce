import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
  getAllUsers,
  toggleUserStatus,
} from "../controllers/userController.js";
import verifyUserMiddleware from "../middleware/userAuthMiddleware.js";
import verifyAdminMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/logout", verifyUserMiddleware, logoutUser);
router.get("/verify", verifyUserMiddleware, verifyUser);
router.get("/profile", verifyUserMiddleware, getProfile);
router.put("/profile", verifyUserMiddleware, updateProfile);
router.put("/change-password", verifyUserMiddleware, changePassword);
router.put("/deactivate", verifyUserMiddleware, deactivateAccount);

router.get("/all", verifyAdminMiddleware, getAllUsers);
router.put("/:id/status", verifyAdminMiddleware, toggleUserStatus);

export default router;
