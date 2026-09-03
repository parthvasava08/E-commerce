import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";

export const getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.findAll({
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
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
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

    const existing = await Wishlist.findOne({ where: { user_id, product_id } });
    if (existing) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    const item = await Wishlist.create({ user_id, product_id });
    res.status(201).json({ message: "Added to wishlist", item });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const item = await Wishlist.findOne({
      where: { wishlist_id: id, user_id },
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.destroy();
    res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const clearWishlist = async (req, res) => {
  try {
    await Wishlist.destroy({ where: { user_id: req.user.user_id } });
    res.status(200).json({ message: "Wishlist cleared" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
