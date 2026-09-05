import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Address from "../models/Address.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

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
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order_status === "cancelled" && order.order_status !== "cancelled") {
      const items = await OrderItem.findAll({ where: { order_id: id } });
      for (const item of items) {
        await Product.increment(
          { stock_quantity: item.quantity },
          { where: { product_id: item.product_id } },
        );
      }
    }

    order.order_status = order_status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
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
