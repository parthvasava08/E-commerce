import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import ContactMessage from "../models/ContactMessage.js";
import { Op } from "sequelize";

const DAY_MS = 24 * 60 * 60 * 1000;
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export const getNotifications = async (req, res) => {
  try {
    const parsed = req.query.since ? new Date(req.query.since) : null;
    const since = parsed && !isNaN(parsed) ? parsed : null;
    const isNew = (t) => !since || new Date(t) > since;

    const dayAgo = new Date(Date.now() - DAY_MS);

    const [recentOrders, newUsers, unreadMessages, lowStock, pendingCod] =
      await Promise.all([
        Order.findAll({
          where: { created_at: { [Op.gte]: dayAgo } },
          order: [["order_id", "DESC"]],
          limit: 5,
        }),
        User.findAll({
          where: { created_at: { [Op.gte]: dayAgo } },
          attributes: ["user_id", "username", "created_at"],
          order: [["user_id", "DESC"]],
          limit: 3,
        }),
        ContactMessage.findAll({
          where: { is_read: false },
          order: [["contact_id", "DESC"]],
          limit: 3,
        }),
        Product.findAll({
          where: { stock_quantity: { [Op.lt]: 5 } },
          attributes: ["product_id", "product_name", "stock_quantity"],
          order: [["stock_quantity", "ASC"]], // most urgent first
          limit: 3,
        }),
        Payment.findAll({
          where: { payment_status: "pending", payment_method: "cash" },
          order: [["payment_id", "DESC"]],
          limit: 3,
        }),
      ]);

    const activity = [
      ...recentOrders.map((o) => ({
        id: `order-${o.order_id}`,
        type: "order",
        text: "New order received",
        sub: `${o.order_number} — ${inr(o.final_amount)}`,
        time: o.created_at,
        unread: isNew(o.created_at),
      })),
      ...newUsers.map((u) => ({
        id: `user-${u.user_id}`,
        type: "user",
        text: "New user registered",
        sub: `${u.username} joined`,
        time: u.created_at,
        unread: isNew(u.created_at),
      })),
      ...unreadMessages.map((m) => ({
        id: `message-${m.contact_id}`,
        type: "message",
        text: "New contact message",
        sub: `${m.name}${m.subject ? ` — ${m.subject}` : ""}`,
        time: m.created_at,
        unread: true,
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    const now = new Date();
    const alerts = [
      ...lowStock.map((p) => ({
        id: `stock-${p.product_id}`,
        type: "stock",
        text: p.stock_quantity === 0 ? "Out of stock" : "Low stock alert",
        sub: `${p.product_name} — ${p.stock_quantity} left`,
        time: now,
        unread: p.stock_quantity === 0,
      })),
      ...pendingCod.map((p) => ({
        id: `payment-${p.payment_id}`,
        type: "payment",
        text: "COD payment pending",
        sub: `${inr(p.amount)} awaiting collection`,
        time: now,
        unread: false,
      })),
    ];

    res.status(200).json([...alerts, ...activity]);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
