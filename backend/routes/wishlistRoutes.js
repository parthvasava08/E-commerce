import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";
import verifyUserMiddleware from "../middleware/userAuthMiddleware.js";

const router = express.Router();

router.get("/", verifyUserMiddleware, getWishlist);
router.post("/", verifyUserMiddleware, addToWishlist);
router.delete("/clear", verifyUserMiddleware, clearWishlist);
router.delete("/:id", verifyUserMiddleware, removeFromWishlist);

export default router;
