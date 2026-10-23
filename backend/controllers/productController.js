import { Op, fn, col } from "sequelize";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Brand from "../models/Brand.js";
import { reject } from "../utils/uploads.js";
import {
  cleanText,
  toId,
  sameName,
  notId,
  isUniqueError,
} from "../utils/validate.js";
import Review from "../models/Review.js";
import sequelize from "../config/db.js";

const STATUSES = ["active", "not-active"];
const MAX_PRICE = 99999999.99;

const isBlank = (v) => v === undefined || v === null || v === "";

const bad = (message, status = 400) => ({ error: { status, message } });

const checkProduct = async (body, current = null) => {
  const values = {
    cat_id: current?.cat_id,
    subcat_id: current?.subcat_id ?? null,
    brand_id: current?.brand_id ?? null,
    product_name: current?.product_name,
    description: current?.description ?? null,
    price: current ? Number(current.price) : undefined,
    discount_price:
      current && current.discount_price !== null
        ? Number(current.discount_price)
        : null,
    stock_quantity: current?.stock_quantity ?? 0,
    status: current?.status ?? "active",
  };
  const sent = (key) => !current || body[key] !== undefined;

  if (sent("product_name")) {
    const name = cleanText(body.product_name, 200);
    if (!name) {
      return bad("Product name is required (max 200 characters)");
    }
    values.product_name = name;
  }

  if (sent("cat_id")) {
    const cat_id = toId(body.cat_id);
    if (!cat_id) return bad("Please select a category");
    values.cat_id = cat_id;
  }

  if (sent("price")) {
    const price = Number(body.price);
    if (isBlank(body.price) || !Number.isFinite(price) || price <= 0) {
      return bad("Enter a price greater than 0");
    }
    if (price > MAX_PRICE) return bad("The price is too large");
    values.price = Math.round(price * 100) / 100;
  }

  if (body.discount_price !== undefined) {
    if (isBlank(body.discount_price)) {
      values.discount_price = null;
    } else {
      const discount = Number(body.discount_price);
      if (!Number.isFinite(discount) || discount <= 0) {
        return bad("The discount price must be greater than 0 (or empty)");
      }
      values.discount_price = Math.round(discount * 100) / 100;
    }
  }
  if (values.discount_price !== null && values.discount_price >= values.price) {
    return bad("The discount price must be lower than the normal price");
  }

  if (body.stock_quantity !== undefined) {
    if (isBlank(body.stock_quantity)) {
      values.stock_quantity = 0;
    } else {
      const stock = Number(body.stock_quantity);
      if (!Number.isInteger(stock) || stock < 0 || stock > 1000000) {
        return bad("Stock must be a whole number, 0 or more");
      }
      values.stock_quantity = stock;
    }
  }

  if (body.description !== undefined) {
    if (isBlank(body.description)) {
      values.description = null;
    } else if (
      typeof body.description !== "string" ||
      body.description.length > 5000
    ) {
      return bad("The description can be at most 5000 characters");
    } else {
      values.description = body.description.trim() || null;
    }
  }

  if (body.status !== undefined && !isBlank(body.status)) {
    if (!STATUSES.includes(body.status)) {
      return bad('Status must be "active" or "not-active"');
    }
    values.status = body.status;
  }

  if (body.subcat_id !== undefined) {
    if (isBlank(body.subcat_id)) {
      values.subcat_id = null;
    } else {
      const subcat_id = toId(body.subcat_id);
      if (!subcat_id) return bad("The selected subcategory is not valid");
      values.subcat_id = subcat_id;
    }
  }
  if (body.brand_id !== undefined) {
    if (isBlank(body.brand_id)) {
      values.brand_id = null;
    } else {
      const brand_id = toId(body.brand_id);
      if (!brand_id) return bad("The selected brand is not valid");
      values.brand_id = brand_id;
    }
  }

  if (sent("cat_id") && !(await Category.findByPk(values.cat_id))) {
    return bad("The selected category does not exist");
  }
  if (values.subcat_id) {
    const sub = await SubCategory.findByPk(values.subcat_id);
    if (!sub) return bad("The selected subcategory does not exist");
    if (sub.cat_id !== values.cat_id) {
      return bad("The subcategory does not belong to the selected category");
    }
  }
  if (values.brand_id && !(await Brand.findByPk(values.brand_id))) {
    return bad("The selected brand does not exist");
  }

  return { values };
};

const findDuplicate = (v, excludeId) =>
  Product.findOne({
    where: {
      [Op.and]: [
        sameName("product_name", v.product_name),
        { cat_id: v.cat_id },
        { brand_id: v.brand_id },
        notId("product_id", excludeId),
      ],
    },
  });

const duplicateMessage = (name) =>
  `"${name}" already exists in this category and brand`;

export const createProduct = async (req, res) => {
  try {
    const body = req.body ?? {};
    const checked = await checkProduct(body);
    if (checked.error) {
      return reject(req, res, checked.error.status, checked.error.message);
    }
    const v = checked.values;

    if (await findDuplicate(v)) {
      return reject(req, res, 409, duplicateMessage(v.product_name));
    }

    const newProduct = await Product.create({
      ...v,
      cover_image: req.files?.cover_image?.[0]?.path || null,
      image_1: req.files?.image_1?.[0]?.path || null,
      image_2: req.files?.image_2?.[0]?.path || null,
      image_3: req.files?.image_3?.[0]?.path || null,
      image_4: req.files?.image_4?.[0]?.path || null,
    });

    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (error) {
    if (isUniqueError(error)) {
      return res.status(409).json({ message: "This product already exists" });
    }
    console.error("createProduct:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: req.admin ? {} : { status: "active" },
      include: [
        { model: Category, attributes: ["cat_name"] },
        { model: SubCategory, attributes: ["sub_cat_name"] },
        { model: Brand, attributes: ["brand_name"] },
      ],
    });

    const stats = await Review.findAll({
      attributes: [
        "product_id",
        [fn("AVG", col("rating")), "avg_rating"],
        [fn("COUNT", col("review_id")), "review_count"],
      ],
      group: ["product_id"],
      raw: true,
    });
    const byProduct = new Map(stats.map((s) => [s.product_id, s]));

    const result = products.map((p) => {
      const s = byProduct.get(p.product_id);
      return {
        ...p.toJSON(),
        avg_rating: s ? Math.round(Number(s.avg_rating) * 10) / 10 : 0,
        review_count: s ? Number(s.review_count) : 0,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("getAllProducts:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { product_id: req.params.id, status: "active" },
      include: [
        { model: Category, attributes: ["cat_name"] },
        { model: SubCategory, attributes: ["sub_cat_name"] },
        { model: Brand, attributes: ["brand_name"] },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body ?? {};

    const product = await Product.findByPk(id);
    if (!product) {
      return reject(req, res, 404, "Product not found");
    }

    const checked = await checkProduct(body, product);
    if (checked.error) {
      return reject(req, res, checked.error.status, checked.error.message);
    }
    const v = checked.values;

    if (await findDuplicate(v, product.product_id)) {
      return reject(req, res, 409, duplicateMessage(v.product_name));
    }

    Object.assign(product, v);

    const cover_image = req.files?.cover_image?.[0]?.path;
    const image_1 = req.files?.image_1?.[0]?.path;
    const image_2 = req.files?.image_2?.[0]?.path;
    const image_3 = req.files?.image_3?.[0]?.path;
    const image_4 = req.files?.image_4?.[0]?.path;
    if (cover_image !== undefined) product.cover_image = cover_image;
    if (image_1 !== undefined) product.image_1 = image_1;
    if (image_2 !== undefined) product.image_2 = image_2;
    if (image_3 !== undefined) product.image_3 = image_3;
    if (image_4 !== undefined) product.image_4 = image_4;

    await product.save();
    res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    if (isUniqueError(error)) {
      return res.status(409).json({ message: "This product already exists" });
    }
    console.error("updateProduct:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteProduct = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const product = await Product.findByPk(req.params.id, { transaction: t });
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    await Review.destroy({
      where: { product_id: product.product_id },
      transaction: t,
    });
    await product.destroy({ transaction: t });
    await t.commit();

    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    if (!t.finished) await t.rollback();

    if (
      error.original?.code === "ER_ROW_IS_REFERENCED_2" ||
      error.name === "SequelizeForeignKeyConstraintError"
    ) {
      return res.status(400).json({
        message:
          "Cannot delete this product — it is part of existing orders. Set it to not-active instead.",
      });
    }
    console.error("deleteProduct:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
