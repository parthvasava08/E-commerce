import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
} from "../controllers/userController.js";
import verifyUserMiddleware from "../middleware/userAuthMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyUserMiddleware, logoutUser);
router.get("/verify", verifyUserMiddleware, verifyUser);

export default router;
