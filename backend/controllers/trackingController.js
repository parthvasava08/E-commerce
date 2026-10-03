import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Payment from "../models/Payment.js";
import Address from "../models/Address.js";
import Product from "../models/Product.js";

export const trackOrder = async (req, res) => {
  try {
    const orderNumber = String(req.params.orderNumber || "").trim();

    if (!orderNumber || orderNumber.length > 30) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = await Order.findOne({
      where: { order_number: orderNumber },
      include: [
        { model: Address, attributes: ["city", "state"] },
        { model: Payment, attributes: ["payment_method", "payment_status"] },
        {
          model: OrderItem,
          include: [
            { model: Product, attributes: ["product_name", "cover_image"] },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const timeline = [
      {
        status: "pending",
        label: "Order Placed",
        description:
          "Your order has been received and is awaiting confirmation.",
        completed: true,
      },
      {
        status: "confirmed",
        label: "Order Confirmed",
        description: "Your order has been confirmed and is being prepared.",
        completed: ["confirmed", "shipped", "delivered"].includes(
          order.order_status,
        ),
      },
      {
        status: "shipped",
        label: "Out for Delivery",
        description: "Your order is on its way to you.",
        completed: ["shipped", "delivered"].includes(order.order_status),
      },
      {
        status: "delivered",
        label: "Delivered",
        description: "Your order has been delivered successfully.",
        completed: order.order_status === "delivered",
      },
    ];

    res.status(200).json({
      order_number: order.order_number,
      order_status: order.order_status,
      created_at: order.created_at,
      final_amount: order.final_amount,
      payment_method: order.Payment?.payment_method,
      payment_status: order.Payment?.payment_status,
      address: order.Address
        ? `${order.Address.city}, ${order.Address.state}`
        : null,
      items: order.OrderItems?.map((item) => ({
        product_name: item.Product?.product_name,
        cover_image: item.Product?.cover_image,
        quantity: item.quantity,
        price: item.price,
      })),
      timeline,
      cancelled: order.order_status === "cancelled",
    });
  } catch (error) {
    console.error("trackOrder:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
