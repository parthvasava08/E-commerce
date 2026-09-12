import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Order,
          include: [{ model: User, attributes: ["username", "email"] }],
          attributes: ["order_number", "order_status"],
        },
      ],
      order: [["payment_id", "DESC"]],
    });

    const formatted = payments.map((p) => ({
      payment_id: p.payment_id,
      order_number: p.Order?.order_number || "—",
      customer_name: p.Order?.User?.username || "Unknown",
      payment_method: p.payment_method,
      transaction_id: p.transaction_id,
      amount: p.amount,
      payment_status: p.payment_status,
      payment_date: p.payment_date,
      order_status: p.Order?.order_status || "—",
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
