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
} from "../controllers/userController.js";
import verifyUserMiddleware from "../middleware/userAuthMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/logout", verifyUserMiddleware, logoutUser);
router.get("/verify", verifyUserMiddleware, verifyUser);
router.get("/profile", verifyUserMiddleware, getProfile);
router.put("/profile", verifyUserMiddleware, updateProfile);
router.put("/change-password", verifyUserMiddleware, changePassword);
router.put("/deactivate", verifyUserMiddleware, deactivateAccount);

export default router;
