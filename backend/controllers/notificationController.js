import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { Op } from "sequelize";

export const getNotifications = async (req, res) => {
  try {
    const notifications = [];

    const recentOrders = await Order.findAll({
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      order: [["order_id", "DESC"]],
      limit: 5,
    });

    recentOrders.forEach((o) => {
      notifications.push({
        id: `order-${o.order_id}`,
        type: "order",
        text: "New order received",
        sub: `${o.order_number} — ₹${Number(o.final_amount).toLocaleString()}`,
        time: o.created_at,
        unread: true,
      });
    });

    const lowStock = await Product.findAll({
      where: { stock_quantity: { [Op.lt]: 5 } },
      attributes: ["product_id", "product_name", "stock_quantity"],
      limit: 3,
    });

    lowStock.forEach((p) => {
      notifications.push({
        id: `stock-${p.product_id}`,
        type: "stock",
        text: "Low stock alert",
        sub: `${p.product_name} — ${p.stock_quantity} left`,
        time: new Date(),
        unread: p.stock_quantity === 0,
      });
    });

    const newUsers = await User.findAll({
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      attributes: ["user_id", "username", "created_at"],
      limit: 3,
    });

    newUsers.forEach((u) => {
      notifications.push({
        id: `user-${u.user_id}`,
        type: "user",
        text: "New user registered",
        sub: `${u.username} joined`,
        time: u.created_at,
        unread: true,
      });
    });

    const pendingPayments = await Payment.findAll({
      where: { payment_status: "pending", payment_method: "cash" },
      limit: 3,
    });

    pendingPayments.forEach((p) => {
      notifications.push({
        id: `payment-${p.payment_id}`,
        type: "payment",
        text: "COD payment pending",
        sub: `₹${Number(p.amount).toLocaleString()} awaiting collection`,
        time: new Date(),
        unread: false,
      });
    });

    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.status(200).json(notifications.slice(0, 10));
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
