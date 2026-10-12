import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { Op, QueryTypes } from "sequelize";
import sequelize from "../config/db.js";

const IST_OFFSET_MS = 330 * 60 * 1000;
const istDate = (ms) => new Date(ms + IST_OFFSET_MS).toISOString().slice(0, 10);

const labelFor = (isoDate) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

const RANGES = {
  "7d": { unit: "day", count: 7 },
  "30d": { unit: "day", count: 30 },
  "12m": { unit: "month", count: 12 },
};

const buildBuckets = (rangeKey) => {
  const { unit, count } = RANGES[rangeKey];

  if (unit === "day") {
    const keys = [];
    for (let i = count - 1; i >= 0; i--) {
      keys.push(istDate(Date.now() - i * 86400000));
    }
    return {
      format: "%Y-%m-%d",
      buckets: keys.map((key) => ({ key, label: labelFor(key) })),
      sinceUtc: new Date(Date.parse(`${keys[0]}T00:00:00Z`) - IST_OFFSET_MS),
    };
  }

  const nowIst = new Date(Date.now() + IST_OFFSET_MS);
  const year = nowIst.getUTCFullYear();
  const month = nowIst.getUTCMonth();
  const buckets = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(year, month - i, 1));
    buckets.push({
      key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }),
    });
  }
  const first = new Date(Date.UTC(year, month - (count - 1), 1));
  return {
    format: "%Y-%m",
    buckets,
    sinceUtc: new Date(first.getTime() - IST_OFFSET_MS),
  };
};

export const getDashboardStats = async (req, res) => {
  try {
    const range = RANGES[req.query.range] ? req.query.range : "7d";
    const { format, buckets, sinceUtc } = buildBuckets(range);

    const [
      totalProducts,
      totalCategories,
      totalBrands,
      totalOrders,
      totalCustomers,
      lowStockCount,
      lowStockProducts,
      statusRows,
      totalRevenueRows,
      revenueRows,
      recentOrdersRaw,
      allCategories,
    ] = await Promise.all([
      Product.count(),
      Category.count(),
      Brand.count(),
      Order.count(),
      User.count({ where: { status: "active" } }),
      Product.count({ where: { stock_quantity: { [Op.lt]: 5 } } }),
      Product.findAll({
        where: { stock_quantity: { [Op.lt]: 5 } },
        attributes: ["product_id", "product_name", "stock_quantity"],
        order: [["stock_quantity", "ASC"]],
        limit: 5,
      }),
      Order.findAll({
        attributes: [
          "order_status",
          [sequelize.fn("COUNT", sequelize.col("order_id")), "count"],
        ],
        group: ["order_status"],
        raw: true,
      }),

      sequelize.query(
        `SELECT COALESCE(SUM(p.amount), 0) AS total
           FROM tbl_payment p
           JOIN tbl_orders o ON o.order_id = p.order_id
          WHERE p.payment_status = 'complete'
            AND o.order_status <> 'cancelled'`,
        { type: QueryTypes.SELECT },
      ),
      sequelize.query(
        `SELECT DATE_FORMAT(CONVERT_TZ(p.payment_date, '+00:00', '+05:30'), :format) AS day,
                SUM(p.amount) AS total
           FROM tbl_payment p
           JOIN tbl_orders o ON o.order_id = p.order_id
          WHERE p.payment_status = 'complete'
            AND o.order_status <> 'cancelled'
            AND p.payment_date >= :since
          GROUP BY day`,
        {
          replacements: { since: sinceUtc, format },
          type: QueryTypes.SELECT,
        },
      ),
      Order.findAll({
        include: [
          { model: User, attributes: ["username"] },
          { model: Payment, attributes: ["payment_status", "payment_method"] },
        ],
        order: [["order_id", "DESC"]],
        limit: 5,
      }),
      Category.findAll({ attributes: ["cat_id", "cat_name"] }),
    ]);

    const counts = Object.fromEntries(
      statusRows.map((r) => [r.order_status, Number(r.count)]),
    );
    const ordersByStatus = {
      pending: counts.pending || 0,
      confirmed: counts.confirmed || 0,
      shipped: counts.shipped || 0,
      delivered: counts.delivered || 0,
      cancelled: counts.cancelled || 0,
    };

    const byDay = Object.fromEntries(
      revenueRows.map((r) => [r.day, Number(r.total)]),
    );
    const revenueChart = buckets.map((b) => ({
      date: b.label,
      revenue: byDay[b.key] || 0,
    }));

    const recentOrders = recentOrdersRaw.map((o) => ({
      order_id: o.order_id,
      order_number: o.order_number,
      customer_name: o.User?.username || "Unknown",
      final_amount: o.final_amount,
      order_status: o.order_status,
      payment_status: o.Payment?.payment_status || "pending",
      created_at: o.created_at,
    }));

    const productsByCategoryChart = (
      await Promise.all(
        allCategories.map(async (cat) => ({
          category: cat.cat_name,
          products: await Product.count({ where: { cat_id: cat.cat_id } }),
        })),
      )
    )
      .filter((c) => c.products > 0)
      .sort((a, b) => b.products - a.products)
      .slice(0, 8);

    res.status(200).json({
      totalProducts,
      totalCategories,
      totalBrands,
      totalOrders,
      totalRevenue: Number(totalRevenueRows[0]?.total || 0),
      totalCustomers,
      lowStockCount,
      lowStockProducts,
      ordersByStatus,
      recentOrders,
      revenueChart,
      revenueRange: range,
      productsByCategoryChart,
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
