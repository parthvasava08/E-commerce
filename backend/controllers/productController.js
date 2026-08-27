import Product from "../models/Product.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Brand from "../models/Brand.js";

export const createProduct = async (req, res) => {
  try {
    const {
      cat_id,
      subcat_id,
      brand_id,
      product_name,
      description,
      price,
      discount_price,
      stock_quantity,
      status,
    } = req.body;

    const cover_image = req.files?.cover_image?.[0]?.path || null;
    const image_1 = req.files?.image_1?.[0]?.path || null;
    const image_2 = req.files?.image_2?.[0]?.path || null;
    const image_3 = req.files?.image_3?.[0]?.path || null;
    const image_4 = req.files?.image_4?.[0]?.path || null;

    if (!product_name || !cat_id || !price) {
      return res
        .status(400)
        .json({ message: "product_name, cat_id, and price are required" });
    }

    const newProduct = await Product.create({
      cat_id,
      subcat_id: subcat_id || null,
      brand_id: brand_id || null,
      product_name,
      description,
      price,
      discount_price: discount_price || null,
      stock_quantity: stock_quantity || 0,
      status: status || "active",
      cover_image,
      image_1,
      image_2,
      image_3,
      image_4,
    });

    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, attributes: ["cat_name"] },
        { model: SubCategory, attributes: ["sub_cat_name"] },
        { model: Brand, attributes: ["brand_name"] },
      ],
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cat_id,
      subcat_id,
      brand_id,
      product_name,
      description,
      price,
      discount_price,
      stock_quantity,
      status,
    } = req.body;

    const cover_image = req.files?.cover_image?.[0]?.path;
    const image_1 = req.files?.image_1?.[0]?.path;
    const image_2 = req.files?.image_2?.[0]?.path;
    const image_3 = req.files?.image_3?.[0]?.path;
    const image_4 = req.files?.image_4?.[0]?.path;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.cat_id = cat_id ?? product.cat_id;
    product.subcat_id = subcat_id ?? product.subcat_id;
    product.brand_id = brand_id ?? product.brand_id;
    product.product_name = product_name ?? product.product_name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.discount_price = discount_price ?? product.discount_price;
    product.stock_quantity = stock_quantity ?? product.stock_quantity;
    product.status = status ?? product.status;

    if (cover_image !== undefined) product.cover_image = cover_image;
    if (image_1 !== undefined) product.image_1 = image_1;
    if (image_2 !== undefined) product.image_2 = image_2;
    if (image_3 !== undefined) product.image_3 = image_3;
    if (image_4 !== undefined) product.image_4 = image_4;

    await product.save();
    res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
