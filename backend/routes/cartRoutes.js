import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import verifyUserMiddleware from "../middleware/userAuthMiddleware.js";

const router = express.Router();

router.get("/", verifyUserMiddleware, getCart);
router.post("/", verifyUserMiddleware, addToCart);
router.put("/:id", verifyUserMiddleware, updateCartItem);
router.delete("/clear", verifyUserMiddleware, clearCart);
router.delete("/:id", verifyUserMiddleware, removeFromCart);

export default router;
