import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import { Op } from "sequelize";

export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const totalCategories = await Category.count();
    const totalBrands = await Brand.count();

    const lowStockProducts = await Product.findAll({
      where: { stock_quantity: { [Op.lt]: 5 } },
      attributes: ["product_id", "product_name", "stock_quantity"],
      limit: 5,
    });

    res.status(200).json({
      totalProducts,
      totalCategories,
      totalBrands,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
