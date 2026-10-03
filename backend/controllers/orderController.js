import sequelize from "../config/db.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Address from "../models/Address.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendOrderStatusEmail } from "../services/emailService.js";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const ALLOWED = {
  pending: ["confirmed", "shipped", "delivered", "cancelled"],
  confirmed: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["username", "email"] },
        { model: Address },
        { model: Payment },
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ["product_name"] }],
        },
      ],
      order: [["order_id", "DESC"]],
    });

    const formatted = orders.map((o) => ({
      order_id: o.order_id,
      order_number: o.order_number,
      customer_name: o.User?.username || "Unknown",
      created_at: o.created_at,
      total_amount: o.total_amount,
      discount: o.discount,
      shipping_charge: o.shipping_charge,
      final_amount: o.final_amount,
      order_status: o.order_status,
      payment_status: o.Payment?.payment_status || "pending",
      payment_method: o.Payment?.payment_method || "cash",
      address: o.Address
        ? `${o.Address.address}, ${o.Address.city}, ${o.Address.state} - ${o.Address.pincode}`
        : "",
      items: o.OrderItems.map((item) => ({
        product_name: item.Product?.product_name || "Unknown",
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("getAllOrders:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateOrderStatus = async (req, res) => {
  let t;
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    if (!STATUSES.includes(order_status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    t = await sequelize.transaction();

    const order = await Order.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.order_status === order_status) {
      await t.rollback();
      return res.status(200).json({ message: "No change", order });
    }

    if (!ALLOWED[order.order_status].includes(order_status)) {
      await t.rollback();
      return res.status(400).json({
        message: `Cannot change an order from "${order.order_status}" to "${order_status}"`,
      });
    }

    const payment = await Payment.findOne({
      where: { order_id: order.order_id },
      transaction: t,
    });

    if (order_status === "cancelled") {
      const items = await OrderItem.findAll({
        where: { order_id: order.order_id },
        transaction: t,
      });
      for (const item of items) {
        await Product.increment(
          { stock_quantity: item.quantity },
          { where: { product_id: item.product_id }, transaction: t },
        );
      }

      if (payment && payment.payment_status === "pending") {
        payment.payment_status = "failed";
        await payment.save({ transaction: t });
      }
    }

    if (
      order_status === "delivered" &&
      payment &&
      payment.payment_method === "cash" &&
      payment.payment_status === "pending"
    ) {
      payment.payment_status = "complete";
      payment.payment_date = new Date();
      await payment.save({ transaction: t });
    }

    order.order_status = order_status;
    await order.save({ transaction: t });

    await t.commit();

    User.findByPk(order.user_id, { attributes: ["email", "username"] })
      .then((user) => {
        if (!user) return;
        return sendOrderStatusEmail({
          email: user.email,
          username: user.username,
          orderNumber: order.order_number,
          status: order_status,
          finalAmount: order.final_amount,
        });
      })
      .catch((e) => console.error("Status email error:", e.message));

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    if (t && !t.finished) await t.rollback();
    console.error("updateOrderStatus:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.user_id },
      include: [
        { model: Address },
        { model: Payment },
        {
          model: OrderItem,
          include: [
            { model: Product, attributes: ["product_name", "cover_image"] },
          ],
        },
      ],
      order: [["order_id", "DESC"]],
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
