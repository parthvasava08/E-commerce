import { Op } from "sequelize";
import Razorpay from "razorpay";
import crypto from "crypto";
import sequelize from "../config/db.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Payment from "../models/Payment.js";
import Coupon from "../models/Coupon.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const generateOrderNumber = () => {
  return "ORD-" + Date.now().toString().slice(-8);
};

const calculateCartTotals = async (user_id, coupon_code) => {
  const cartItems = await Cart.findAll({
    where: { user_id },
    include: [{ model: Product }],
  });

  if (cartItems.length === 0) {
    throw { status: 400, message: "Cart is empty" };
  }

  for (const item of cartItems) {
    if (item.quantity > item.Product.stock_quantity) {
      throw {
        status: 400,
        message: `Not enough stock for ${item.Product.product_name}`,
      };
    }
  }

  const total_amount = cartItems.reduce((sum, item) => {
    const price = Number(item.Product.discount_price || item.Product.price);
    return sum + price * item.quantity;
  }, 0);

  let discount = 0;

  if (coupon_code) {
    const coupon = await Coupon.findOne({
      where: { coupon_code, status: "active" },
    });

    if (!coupon) {
      throw { status: 400, message: "Invalid coupon code" };
    }

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      throw { status: 400, message: "Coupon has expired" };
    }

    if (total_amount < Number(coupon.minimum_amount)) {
      throw {
        status: 400,
        message: `Minimum order of ₹${coupon.minimum_amount} required for this coupon`,
      };
    }

    discount =
      coupon.discount_type === "percentage"
        ? (total_amount * Number(coupon.discount_value)) / 100
        : Number(coupon.discount_value);

    discount = Math.min(discount, total_amount);
  }

  const shipping_charge = total_amount - discount > 999 ? 0 : 99;
  const final_amount = total_amount - discount + shipping_charge;

  return { cartItems, total_amount, discount, shipping_charge, final_amount };
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { coupon_code } = req.body;
    const { final_amount } = await calculateCartTotals(
      req.user.user_id,
      coupon_code,
    );

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(final_amount * 100),
      currency: "INR",
      receipt: generateOrderNumber(),
    });

    res.status(200).json({
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      final_amount,
    });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Something went wrong" });
  }
};

const createOrderRecord = async (
  t,
  user_id,
  address_id,
  cartItems,
  totals,
  payment_method,
  transaction_id,
  payment_status,
) => {
  const order = await Order.create(
    {
      order_number: generateOrderNumber(),
      user_id,
      address_id,
      total_amount: totals.total_amount,
      discount: totals.discount,
      shipping_charge: totals.shipping_charge,
      final_amount: totals.final_amount,
      order_status: "confirmed",
    },
    { transaction: t },
  );

  for (const item of cartItems) {
    await OrderItem.create(
      {
        order_id: order.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.Product.discount_price || item.Product.price,
      },
      { transaction: t },
    );

    await Product.decrement(
      { stock_quantity: item.quantity },
      { where: { product_id: item.product_id }, transaction: t },
    );
  }

  await Payment.create(
    {
      order_id: order.order_id,
      payment_method,
      transaction_id,
      amount: totals.final_amount,
      payment_status,
      payment_date: payment_status === "complete" ? new Date() : null,
    },
    { transaction: t },
  );

  await Cart.destroy({ where: { user_id }, transaction: t });

  return order;
};

export const placeCodOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user_id = req.user.user_id;
    const {
      full_name,
      mobile,
      address,
      city,
      state,
      country,
      pincode,
      coupon_code,
    } = req.body;

    if (
      !full_name ||
      !mobile ||
      !address ||
      !city ||
      !state ||
      !country ||
      !pincode
    ) {
      throw { status: 400, message: "All address fields are required" };
    }

    const totals = await calculateCartTotals(user_id, coupon_code);

    const addressRecord = await Address.create(
      { user_id, full_name, mobile, address, city, state, country, pincode },
      { transaction: t },
    );

    const order = await createOrderRecord(
      t,
      user_id,
      addressRecord.address_id,
      totals.cartItems,
      totals,
      "cash",
      null,
      "pending",
    );

    await t.commit();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    await t.rollback();
    res
      .status(error.status || 500)
      .json({ message: error.message || "Something went wrong" });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user_id = req.user.user_id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      full_name,
      mobile,
      address,
      city,
      state,
      country,
      pincode,
      coupon_code,
    } = req.body;

    if (
      !full_name ||
      !mobile ||
      !address ||
      !city ||
      !state ||
      !country ||
      !pincode
    ) {
      throw { status: 400, message: "All address fields are required" };
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      throw { status: 400, message: "Payment verification failed" };
    }

    const totals = await calculateCartTotals(user_id, coupon_code);

    const addressRecord = await Address.create(
      { user_id, full_name, mobile, address, city, state, country, pincode },
      { transaction: t },
    );

    const order = await createOrderRecord(
      t,
      user_id,
      addressRecord.address_id,
      totals.cartItems,
      totals,
      "online",
      razorpay_payment_id,
      "complete",
    );

    await t.commit();
    res.status(201).json({ message: "Payment verified, order placed", order });
  } catch (error) {
    await t.rollback();
    res
      .status(error.status || 500)
      .json({ message: error.message || "Something went wrong" });
  }
};
