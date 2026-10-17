import Razorpay from "razorpay";
import crypto from "crypto";
import { Op } from "sequelize";
import sequelize from "../config/db.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Payment from "../models/Payment.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const fail = (status, message) => ({ status, message });
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const generateOrderNumber = () =>
  "ORD-" + crypto.randomBytes(5).toString("hex").toUpperCase();

const ADDRESS_FIELDS = [
  "full_name",
  "mobile",
  "address",
  "city",
  "state",
  "country",
  "pincode",
];

const parseAddress = (body) => {
  const f = {};
  for (const k of ADDRESS_FIELDS) {
    f[k] = typeof body[k] === "string" ? body[k].trim() : "";
  }
  if (ADDRESS_FIELDS.some((k) => !f[k])) {
    throw fail(400, "All address fields are required");
  }
  if (
    f.full_name.length > 100 ||
    f.address.length > 255 ||
    f.city.length > 100 ||
    f.state.length > 100 ||
    f.country.length > 100
  ) {
    throw fail(400, "One or more address fields are too long");
  }
  f.mobile = f.mobile.replace(/[\s-]/g, "");
  if (!/^(\+91)?[6-9]\d{9}$/.test(f.mobile)) {
    throw fail(400, "Enter a valid 10-digit mobile number");
  }
  if (!/^\d{6}$/.test(f.pincode)) {
    throw fail(400, "Enter a valid 6-digit pincode");
  }
  return f;
};

const getOrCreateAddress = async (t, user_id, addr) => {
  const existing = await Address.findOne({
    where: { user_id, ...addr },
    order: [["address_id", "DESC"]],
    transaction: t,
  });
  if (existing) return existing;
  return Address.create({ user_id, ...addr }, { transaction: t });
};

const calculateCartTotals = async (user_id, coupon_code) => {
  const cartItems = await Cart.findAll({
    where: { user_id },
    include: [{ model: Product }],
  });

  if (cartItems.length === 0) {
    throw fail(400, "Cart is empty");
  }

  for (const item of cartItems) {
    const p = item.Product;
    if (!p || p.status !== "active") {
      throw fail(400, "An item in your cart is no longer available");
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw fail(400, "Invalid quantity in cart");
    }
    if (item.quantity > p.stock_quantity) {
      throw fail(400, `Not enough stock for ${p.product_name}`);
    }
  }

  const total_amount = round2(
    cartItems.reduce((sum, item) => {
      const price = Number(item.Product.discount_price || item.Product.price);
      return sum + price * item.quantity;
    }, 0),
  );

  let discount = 0;
  const code = typeof coupon_code === "string" ? coupon_code.trim() : "";

  if (code) {
    const coupon = await Coupon.findOne({
      where: { coupon_code: code.toUpperCase(), status: "active" },
    });

    if (!coupon) throw fail(400, "Invalid coupon code");

    if (
      coupon.expiry_date &&
      new Date(`${coupon.expiry_date}T23:59:59`) < new Date()
    ) {
      throw fail(400, "Coupon has expired");
    }

    if (total_amount < Number(coupon.minimum_amount)) {
      throw fail(
        400,
        `Minimum order of ₹${coupon.minimum_amount} required for this coupon`,
      );
    }

    discount =
      coupon.discount_type === "percentage"
        ? (total_amount * Number(coupon.discount_value)) / 100
        : Number(coupon.discount_value);

    discount = round2(Math.min(Math.max(discount, 0), total_amount));
  }

  const shipping_charge = total_amount - discount > 999 ? 0 : 99;
  const final_amount = round2(total_amount - discount + shipping_charge);

  return { cartItems, total_amount, discount, shipping_charge, final_amount };
};

export const getCheckoutTotals = async (req, res) => {
  try {
    const totals = await calculateCartTotals(
      req.user.user_id,
      req.query.coupon_code,
    );
    res.status(200).json({
      total_amount: totals.total_amount,
      discount: totals.discount,
      shipping_charge: totals.shipping_charge,
      final_amount: totals.final_amount,
      items: totals.cartItems.map((item) => ({
        cart_id: item.cart_id,
        product_id: item.product_id,
        quantity: item.quantity,
        product_name: item.Product.product_name,
        price: item.Product.discount_price || item.Product.price,
        cover_image: item.Product.cover_image,
      })),
    });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.status ? error.message : "Something went wrong" });
  }
};

export const getSavedAddresses = async (req, res) => {
  try {
    const rows = await Address.findAll({
      where: { user_id: req.user.user_id },
      order: [["address_id", "DESC"]],
      limit: 30,
    });

    const seen = new Set();
    const addresses = [];
    for (const a of rows) {
      const key = [
        a.full_name,
        a.mobile,
        a.address,
        a.city,
        a.state,
        a.country,
        a.pincode,
      ]
        .map((v) =>
          String(v ?? "")
            .trim()
            .toLowerCase(),
        )
        .join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      addresses.push({
        address_id: a.address_id,
        full_name: a.full_name,
        mobile: a.mobile,
        address: a.address,
        city: a.city,
        state: a.state,
        country: a.country,
        pincode: a.pincode,
      });
      if (addresses.length === 5) break;
    }

    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    parseAddress(req.body);

    const { final_amount } = await calculateCartTotals(
      req.user.user_id,
      req.body.coupon_code,
    );

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(final_amount * 100),
      currency: "INR",
      receipt: generateOrderNumber(),

      notes: { user_id: String(req.user.user_id) },
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
      .json({ message: error.status ? error.message : "Something went wrong" });
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
    const qty = item.quantity; // validated integer >= 1

    const [affected] = await Product.update(
      { stock_quantity: sequelize.literal(`stock_quantity - ${qty}`) },
      {
        where: {
          product_id: item.product_id,
          stock_quantity: { [Op.gte]: qty },
        },
        transaction: t,
      },
    );
    if (!affected) {
      throw fail(400, `Not enough stock for ${item.Product.product_name}`);
    }

    await OrderItem.create(
      {
        order_id: order.order_id,
        product_id: item.product_id,
        quantity: qty,
        price: item.Product.discount_price || item.Product.price,
      },
      { transaction: t },
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

const notifyOrder = async (user_id, order, cartItems, payment_method) => {
  try {
    const user = await User.findByPk(user_id, {
      attributes: ["email", "username"],
    });
    if (!user) return;
    await sendOrderConfirmationEmail({
      email: user.email,
      username: user.username,
      order: {
        order_number: order.order_number,
        final_amount: order.final_amount,
        payment_method,
        items: cartItems.map((item) => ({
          product_name: item.Product.product_name,
          quantity: item.quantity,
          price: item.Product.discount_price || item.Product.price,
        })),
      },
    });
  } catch (e) {
    console.error("Order email error:", e.message);
  }
};

export const placeCodOrder = async (req, res) => {
  let t;
  try {
    const user_id = req.user.user_id;
    const addr = parseAddress(req.body);
    const totals = await calculateCartTotals(user_id, req.body.coupon_code);

    t = await sequelize.transaction();

    const addressRecord = await getOrCreateAddress(t, user_id, addr);

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
    notifyOrder(user_id, order, totals.cartItems, "cash");

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    if (t && !t.finished) await t.rollback();
    res
      .status(error.status || 500)
      .json({ message: error.status ? error.message : "Something went wrong" });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  let t;
  let paymentVerified = false;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  try {
    const user_id = req.user.user_id;

    if (
      [razorpay_order_id, razorpay_payment_id, razorpay_signature].some(
        (v) => typeof v !== "string" || !v,
      )
    ) {
      throw fail(400, "Missing payment details");
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(razorpay_signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw fail(400, "Payment verification failed");
    }

    const used = await Payment.findOne({
      where: { transaction_id: razorpay_payment_id },
    });
    if (used) throw fail(409, "This payment has already been used");

    const [rzpOrder, rzpPayment] = await Promise.all([
      razorpay.orders.fetch(razorpay_order_id),
      razorpay.payments.fetch(razorpay_payment_id),
    ]);

    if (rzpOrder.notes?.user_id !== String(user_id)) {
      throw fail(403, "This payment does not belong to your account");
    }
    if (
      rzpPayment.order_id !== razorpay_order_id ||
      rzpPayment.status !== "captured"
    ) {
      throw fail(400, "Payment has not been completed");
    }

    paymentVerified = true;

    const addr = parseAddress(req.body);

    const totals = await calculateCartTotals(user_id, req.body.coupon_code);
    const expectedPaise = Math.round(totals.final_amount * 100);
    if (
      rzpOrder.amount !== expectedPaise ||
      rzpPayment.amount !== expectedPaise
    ) {
      throw fail(400, "Your cart total changed after payment started");
    }

    t = await sequelize.transaction();

    const addressRecord = await getOrCreateAddress(t, user_id, addr);

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
    notifyOrder(user_id, order, totals.cartItems, "online");

    res.status(201).json({ message: "Payment verified, order placed", order });
  } catch (error) {
    if (t && !t.finished) await t.rollback();

    const msg = error.status ? error.message : "Something went wrong";
    const code = error.status || 500;

    if (paymentVerified) {
      const nowUsed = await Payment.findOne({
        where: { transaction_id: razorpay_payment_id },
      }).catch(() => null);

      if (!nowUsed) {
        try {
          await razorpay.payments.refund(razorpay_payment_id, {
            speed: "normal",
          });
          return res.status(code).json({
            message: `${msg}. Your payment has been refunded automatically.`,
          });
        } catch (refundErr) {
          console.error("REFUND FAILED for", razorpay_payment_id, refundErr);
          return res.status(code).json({
            message: `${msg}. If money was deducted, contact support with payment ID ${razorpay_payment_id}.`,
          });
        }
      }
    }

    res.status(code).json({ message: msg });
  }
};
