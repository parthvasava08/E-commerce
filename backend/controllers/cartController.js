import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";

export const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { user_id: req.user.user_id },
      include: [
        {
          model: Product,
          attributes: [
            "product_id",
            "product_name",
            "price",
            "discount_price",
            "cover_image",
            "stock_quantity",
            "status",
          ],
          include: [
            { model: Category, attributes: ["cat_name"] },
            { model: Brand, attributes: ["brand_name"] },
          ],
        },
      ],
    });
    res.status(200).json(cartItems);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const user_id = req.user.user_id;

    if (!product_id) {
      return res.status(400).json({ message: "product_id is required" });
    }

    const product = await Product.findOne({
      where: { product_id, status: "active" },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const existing = await Cart.findOne({ where: { user_id, product_id } });

    if (existing) {
      const newQuantity = existing.quantity + Number(quantity);
      if (newQuantity > product.stock_quantity) {
        return res.status(400).json({ message: "Not enough stock available" });
      }
      existing.quantity = newQuantity;
      await existing.save();
      return res.status(200).json({ message: "Cart updated", cart: existing });
    }

    const cartItem = await Cart.create({ user_id, product_id, quantity });
    res.status(201).json({ message: "Added to cart", cart: cartItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const user_id = req.user.user_id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cartItem = await Cart.findOne({ where: { cart_id: id, user_id } });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const product = await Product.findByPk(cartItem.product_id);
    if (!product) {
      return res.status(404).json({ message: "Product no longer exists" });
    }
    if (quantity > product.stock_quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    res.status(200).json({ message: "Cart updated", cart: cartItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const cartItem = await Cart.findOne({ where: { cart_id: id, user_id } });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cartItem.destroy();
    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.destroy({ where: { user_id: req.user.user_id } });
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
