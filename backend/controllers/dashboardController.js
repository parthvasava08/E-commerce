import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { Op } from "sequelize";
import sequelize from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Basic counts
    const totalProducts = await Product.count();
    const totalCategories = await Category.count();
    const totalBrands = await Brand.count();
    const totalOrders = await Order.count();
    const totalCustomers = await User.count({ where: { status: "active" } });

    // Low stock
    const lowStockProducts = await Product.findAll({
      where: { stock_quantity: { [Op.lt]: 5 } },
      attributes: ["product_id", "product_name", "stock_quantity"],
      limit: 5,
    });

    // Revenue
    const revenueResult = await Payment.findOne({
      attributes: [[sequelize.fn("SUM", sequelize.col("amount")), "total"]],
      where: { payment_status: "complete" },
    });
    const totalRevenue = Number(revenueResult?.dataValues?.total || 0);

    // Orders by status
    const [pending, confirmed, shipped, delivered, cancelled] =
      await Promise.all([
        Order.count({ where: { order_status: "pending" } }),
        Order.count({ where: { order_status: "confirmed" } }),
        Order.count({ where: { order_status: "shipped" } }),
        Order.count({ where: { order_status: "delivered" } }),
        Order.count({ where: { order_status: "cancelled" } }),
      ]);

    // Recent orders
    const recentOrdersRaw = await Order.findAll({
      include: [
        { model: User, attributes: ["username"] },
        { model: Payment, attributes: ["payment_status", "payment_method"] },
      ],
      order: [["order_id", "DESC"]],
      limit: 5,
    });

    const recentOrders = recentOrdersRaw.map((o) => ({
      order_id: o.order_id,
      order_number: o.order_number,
      customer_name: o.User?.username || "Unknown",
      final_amount: o.final_amount,
      order_status: o.order_status,
      payment_status: o.Payment?.payment_status || "pending",
      created_at: o.created_at,
    }));

    // Revenue last 7 days
    const revenueChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);

      const result = await Payment.findOne({
        attributes: [[sequelize.fn("SUM", sequelize.col("amount")), "total"]],
        where: {
          payment_status: "complete",
          payment_date: { [Op.between]: [start, end] },
        },
      });

      revenueChart.push({
        date: start.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        revenue: Number(result?.dataValues?.total || 0),
      });
    }

    // Products by category
    const allCategories = await Category.findAll({
      attributes: ["cat_id", "cat_name"],
    });

    const productsByCategoryChart = (
      await Promise.all(
        allCategories.map(async (cat) => ({
          category: cat.cat_name,
          products: await Product.count({ where: { cat_id: cat.cat_id } }),
        })),
      )
    )
      .filter((c) => c.products > 0)
      .sort((a, b) => b.products - a.products)
      .slice(0, 8);

    res.status(200).json({
      totalProducts,
      totalCategories,
      totalBrands,
      totalOrders,
      totalRevenue,
      totalCustomers,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      ordersByStatus: { pending, confirmed, shipped, delivered, cancelled },
      recentOrders,
      revenueChart,
      productsByCategoryChart,
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error.message);
    console.error(error.stack);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
