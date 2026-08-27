import Coupon from "../models/Coupon.js";

export const createCoupon = async (req, res) => {
  try {
    const {
      coupon_code,
      discount_type,
      discount_value,
      minimum_amount,
      expiry_date,
      status,
    } = req.body;

    if (!coupon_code || !discount_type || !discount_value) {
      return res.status(400).json({
        message: "coupon_code, discount_type, and discount_value are required",
      });
    }

    const newCoupon = await Coupon.create({
      coupon_code: coupon_code.toUpperCase(),
      discount_type,
      discount_value,
      minimum_amount: minimum_amount || 0,
      expiry_date: expiry_date || null,
      status: status || "active",
    });

    res.status(201).json({ message: "Coupon created", coupon: newCoupon });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "This coupon code already exists" });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll();
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      coupon_code,
      discount_type,
      discount_value,
      minimum_amount,
      expiry_date,
      status,
    } = req.body;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.coupon_code = coupon_code
      ? coupon_code.toUpperCase()
      : coupon.coupon_code;
    coupon.discount_type = discount_type ?? coupon.discount_type;
    coupon.discount_value = discount_value ?? coupon.discount_value;
    coupon.minimum_amount = minimum_amount ?? coupon.minimum_amount;
    coupon.expiry_date = expiry_date ?? coupon.expiry_date;
    coupon.status = status ?? coupon.status;

    await coupon.save();
    res.status(200).json({ message: "Coupon updated", coupon });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "This coupon code already exists" });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    await coupon.destroy();
    res.status(200).json({ message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
