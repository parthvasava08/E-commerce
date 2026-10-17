import Coupon from "../models/Coupon.js";
import { cleanText, toId, isUniqueError } from "../utils/validate.js";

const TYPES = ["flat", "percentage"];
const STATUSES = ["active", "inactive"];
const MAX_AMOUNT = 10000000; // the column is DECIMAL(10,2)

const toNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && /^\d+(\.\d{1,2})?$/.test(value.trim())) {
    return Number(value.trim());
  }
  return null;
};

const toDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const d = new Date(`${value}T00:00:00Z`);
  return !isNaN(d) && d.toISOString().slice(0, 10) === value ? value : null;
};

const toCode = (value) => {
  const text = cleanText(value, 50);
  if (!text) return null;
  const code = text.toUpperCase();
  return /^[A-Z0-9_-]+$/.test(code) ? code : null;
};

const checkValueFits = (type, value) =>
  type !== "percentage" || value <= 100
    ? null
    : "A percentage discount cannot be more than 100";

export const createCoupon = async (req, res) => {
  try {
    const body = req.body || {};

    const coupon_code = toCode(body.coupon_code);
    if (!coupon_code) {
      return res.status(400).json({
        message:
          "Coupon code must be 1 to 50 letters, numbers, - or _ (no spaces)",
      });
    }

    if (!TYPES.includes(body.discount_type)) {
      return res
        .status(400)
        .json({ message: "Discount type must be flat or percentage" });
    }

    const discount_value = toNumber(body.discount_value);
    if (
      discount_value === null ||
      discount_value <= 0 ||
      discount_value > MAX_AMOUNT
    ) {
      return res
        .status(400)
        .json({ message: "Discount value must be a number greater than 0" });
    }
    const tooBig = checkValueFits(body.discount_type, discount_value);
    if (tooBig) return res.status(400).json({ message: tooBig });

    let minimum_amount = 0;
    if (
      body.minimum_amount !== undefined &&
      body.minimum_amount !== null &&
      body.minimum_amount !== ""
    ) {
      minimum_amount = toNumber(body.minimum_amount);
      if (
        minimum_amount === null ||
        minimum_amount < 0 ||
        minimum_amount > MAX_AMOUNT
      ) {
        return res
          .status(400)
          .json({ message: "Minimum amount must be 0 or more" });
      }
    }

    let expiry_date = null;
    if (
      body.expiry_date !== undefined &&
      body.expiry_date !== null &&
      body.expiry_date !== ""
    ) {
      expiry_date = toDate(body.expiry_date);
      if (!expiry_date) {
        return res
          .status(400)
          .json({ message: "Expiry date must be a valid date (YYYY-MM-DD)" });
      }
    }

    const status = body.status === undefined ? "active" : body.status;
    if (!STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be active or inactive" });
    }

    const coupon = await Coupon.create({
      coupon_code,
      discount_type: body.discount_type,
      discount_value,
      minimum_amount,
      expiry_date,
      status,
    });

    res.status(201).json({ message: "Coupon created", coupon });
  } catch (error) {
    if (isUniqueError(error)) {
      return res
        .status(409)
        .json({ message: "This coupon code already exists" });
    }
    console.error("createCoupon:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [["coupon_id", "DESC"]] });
    res.status(200).json(coupons);
  } catch (error) {
    console.error("getAllCoupons:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(404).json({ message: "Coupon not found" });

    const coupon = await Coupon.findByPk(id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    const body = req.body || {};

    if (body.coupon_code !== undefined) {
      const code = toCode(body.coupon_code);
      if (!code) {
        return res.status(400).json({
          message:
            "Coupon code must be 1 to 50 letters, numbers, - or _ (no spaces)",
        });
      }
      coupon.coupon_code = code;
    }

    if (body.discount_type !== undefined) {
      if (!TYPES.includes(body.discount_type)) {
        return res
          .status(400)
          .json({ message: "Discount type must be flat or percentage" });
      }
      coupon.discount_type = body.discount_type;
    }

    if (body.discount_value !== undefined) {
      const value = toNumber(body.discount_value);
      if (value === null || value <= 0 || value > MAX_AMOUNT) {
        return res
          .status(400)
          .json({ message: "Discount value must be a number greater than 0" });
      }
      coupon.discount_value = value;
    }

    const tooBig = checkValueFits(
      coupon.discount_type,
      Number(coupon.discount_value),
    );
    if (tooBig) return res.status(400).json({ message: tooBig });

    if (body.minimum_amount !== undefined) {
      const min =
        body.minimum_amount === "" || body.minimum_amount === null
          ? 0
          : toNumber(body.minimum_amount);
      if (min === null || min < 0 || min > MAX_AMOUNT) {
        return res
          .status(400)
          .json({ message: "Minimum amount must be 0 or more" });
      }
      coupon.minimum_amount = min;
    }

    if (body.expiry_date !== undefined) {
      if (body.expiry_date === "" || body.expiry_date === null) {
        coupon.expiry_date = null;
      } else {
        const date = toDate(body.expiry_date);
        if (!date) {
          return res
            .status(400)
            .json({ message: "Expiry date must be a valid date (YYYY-MM-DD)" });
        }
        coupon.expiry_date = date;
      }
    }

    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return res
          .status(400)
          .json({ message: "Status must be active or inactive" });
      }
      coupon.status = body.status;
    }

    await coupon.save();
    res.status(200).json({ message: "Coupon updated", coupon });
  } catch (error) {
    if (isUniqueError(error)) {
      return res
        .status(409)
        .json({ message: "This coupon code already exists" });
    }
    console.error("updateCoupon:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(404).json({ message: "Coupon not found" });

    const coupon = await Coupon.findByPk(id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    await coupon.destroy();
    res.status(200).json({ message: "Coupon deleted" });
  } catch (error) {
    console.error("deleteCoupon:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
