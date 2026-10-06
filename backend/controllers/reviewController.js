import { QueryTypes } from "sequelize";
import sequelize from "../config/db.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const PAGE_SIZE = 10;
const MAX_TEXT = 1000;

const toId = (value) => {
  const s = String(value ?? "");
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
};

const toRating = (raw) => {
  const v = typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : raw;
  return typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5
    ? v
    : null;
};

const toText = (raw) => {
  if (raw === undefined || raw === null) return { ok: true, value: null };
  if (typeof raw !== "string") return { ok: false };
  const t = raw.trim();
  if (t.length > MAX_TEXT) return { ok: false, tooLong: true };
  return { ok: true, value: t || null };
};

const maskName = (username) => {
  const parts = String(username || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "Customer";
  let first = parts[0].includes("@") ? parts[0].split("@")[0] : parts[0];
  first = first.slice(0, 20) || "Customer";
  return parts.length > 1 ? `${first} ${parts[1][0].toUpperCase()}.` : first;
};

const plain = (r) => ({
  review_id: r.review_id,
  rating: r.rating,
  review: r.review,
  created_at: r.created_at,
});

const fail = (res, status, message) => res.status(status).json({ message });

export const getProductReviews = async (req, res) => {
  try {
    const productId = toId(req.params.productId);
    if (!productId) return fail(res, 404, "Product not found");
    const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), 1000);

    const [statRows, rows] = await Promise.all([
      sequelize.query(
        `SELECT r.rating AS rating, COUNT(*) AS n
           FROM tbl_reviews r
           JOIN tbl_user u ON u.user_id = r.user_id
          WHERE r.product_id = :productId AND u.status = 'active'
          GROUP BY r.rating`,
        { replacements: { productId }, type: QueryTypes.SELECT },
      ),
      Review.findAll({
        where: { product_id: productId },
        attributes: [
          "review_id",
          "rating",
          "review",
          "created_at",

          [
            sequelize.literal(
              `EXISTS (SELECT 1 FROM tbl_orders o
                         JOIN tbl_order_items oi ON oi.order_id = o.order_id
                        WHERE o.user_id = Review.user_id
                          AND oi.product_id = Review.product_id
                          AND o.order_status <> 'cancelled')`,
            ),
            "verified",
          ],
        ],
        include: [
          {
            model: User,
            attributes: ["username"],
            where: { status: "active" },
            required: true,
          },
        ],
        order: [["review_id", "DESC"]],
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      }),
    ]);

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let count = 0;
    let sum = 0;
    for (const row of statRows) {
      const stars = Number(row.rating);
      const n = Number(row.n);
      if (breakdown[stars] !== undefined) {
        breakdown[stars] = n;
        count += n;
        sum += stars * n;
      }
    }

    res.status(200).json({
      average: count ? Math.round((sum / count) * 10) / 10 : null,
      count,
      breakdown,
      page,
      has_more: page * PAGE_SIZE < count,
      reviews: rows.map((r) => ({
        ...plain(r),
        name: maskName(r.User?.username),
        verified_purchase: Boolean(Number(r.get("verified"))),
      })),
    });
  } catch (error) {
    console.error("getProductReviews:", error.message);
    fail(res, 500, "Something went wrong");
  }
};

export const getMyReview = async (req, res) => {
  try {
    const productId = toId(req.params.productId);
    if (!productId) return fail(res, 404, "Product not found");

    const review = await Review.findOne({
      where: { product_id: productId, user_id: req.user.user_id },
    });
    res.status(200).json({ review: review ? plain(review) : null });
  } catch (error) {
    console.error("getMyReview:", error.message);
    fail(res, 500, "Something went wrong");
  }
};

export const createReview = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const product_id = toId(req.body.product_id);
    const rating = toRating(req.body.rating);
    const text = toText(req.body.review);

    if (!product_id) return fail(res, 400, "product_id is required");
    if (rating === null)
      return fail(res, 400, "Rating must be a whole number from 1 to 5");
    if (!text.ok) {
      return fail(
        res,
        400,
        text.tooLong
          ? `Review must be ${MAX_TEXT} characters or fewer`
          : "Invalid review text",
      );
    }

    const product = await Product.findOne({
      where: { product_id, status: "active" },
      attributes: ["product_id"],
    });
    if (!product) return fail(res, 404, "Product not found");

    const existing = await Review.findOne({ where: { product_id, user_id } });
    if (existing) {
      return fail(
        res,
        409,
        "You have already reviewed this product. You can edit your review instead.",
      );
    }

    let review;
    try {
      review = await Review.create({
        product_id,
        user_id,
        rating,
        review: text.value,
      });
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return fail(
          res,
          409,
          "You have already reviewed this product. You can edit your review instead.",
        );
      }
      throw err;
    }

    res
      .status(201)
      .json({ message: "Review submitted", review: plain(review) });
  } catch (error) {
    console.error("createReview:", error.message);
    fail(res, 500, "Something went wrong");
  }
};

export const updateReview = async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return fail(res, 404, "Review not found");

    const review = await Review.findOne({
      where: { review_id: id, user_id: req.user.user_id },
    });
    if (!review) return fail(res, 404, "Review not found");

    if (req.body.rating !== undefined) {
      const rating = toRating(req.body.rating);
      if (rating === null)
        return fail(res, 400, "Rating must be a whole number from 1 to 5");
      review.rating = rating;
    }
    if (req.body.review !== undefined) {
      const text = toText(req.body.review);
      if (!text.ok) {
        return fail(
          res,
          400,
          text.tooLong
            ? `Review must be ${MAX_TEXT} characters or fewer`
            : "Invalid review text",
        );
      }
      review.review = text.value;
    }

    await review.save();
    res.status(200).json({ message: "Review updated", review: plain(review) });
  } catch (error) {
    console.error("updateReview:", error.message);
    fail(res, 500, "Something went wrong");
  }
};

export const deleteMyReview = async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return fail(res, 404, "Review not found");

    const review = await Review.findOne({
      where: { review_id: id, user_id: req.user.user_id },
    });
    if (!review) return fail(res, 404, "Review not found");

    await review.destroy();
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.error("deleteMyReview:", error.message);
    fail(res, 500, "Something went wrong");
  }
};

export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, attributes: ["username"] },
        { model: Product, attributes: ["product_name"] },
      ],
      order: [["review_id", "DESC"]],
      limit: 500,
    });

    res.status(200).json(
      reviews.map((r) => ({
        ...plain(r),
        product_id: r.product_id,
        product_name: r.Product?.product_name || "Deleted product",
        username: r.User?.username || "Unknown",
      })),
    );
  } catch (error) {
    console.error("getAllReviewsAdmin:", error.message);
    fail(res, 500, "Something went wrong");
  }
};
export const adminDeleteReview = async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return fail(res, 404, "Review not found");

    const review = await Review.findByPk(id);
    if (!review) return fail(res, 404, "Review not found");

    await review.destroy();
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.error("adminDeleteReview:", error.message);
    fail(res, 500, "Something went wrong");
  }
};
