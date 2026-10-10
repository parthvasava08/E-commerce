import Category from "../models/Category.js";
import { Op } from "sequelize";
import { reject } from "../utils/uploads.js";
import {
  cleanText,
  sameName,
  notId,
  isUniqueError,
} from "../utils/validate.js";

const findDuplicate = (name, excludeId) =>
  Category.findOne({
    where: {
      [Op.and]: [sameName("cat_name", name), notId("cat_id", excludeId)],
    },
  });

export const createCategory = async (req, res) => {
  try {
    const cat_name = cleanText(req.body?.cat_name, 100);
    const image = req.file ? req.file.path : null;

    if (!cat_name) {
      return reject(
        req,
        res,
        400,
        "Category name is required (max 100 characters)",
      );
    }
    if (await findDuplicate(cat_name)) {
      return reject(req, res, 409, `Category "${cat_name}" already exists`);
    }

    const newCategory = await Category.create({ cat_name, image });
    res
      .status(201)
      .json({ message: "Category created", category: newCategory });
  } catch (error) {
    if (isUniqueError(error)) {
      return reject(req, res, 409, "This category already exists");
    }
    console.error("createCategory:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    console.error("getAllCategories:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const rawName = req.body?.cat_name;
    const image = req.file ? req.file.path : undefined;

    const category = await Category.findByPk(id);
    if (!category) {
      return reject(req, res, 404, "Category not found");
    }

    if (rawName !== undefined) {
      const cat_name = cleanText(rawName, 100);
      if (!cat_name) {
        return reject(
          req,
          res,
          400,
          "Category name cannot be empty (max 100 characters)",
        );
      }
      if (await findDuplicate(cat_name, category.cat_id)) {
        return reject(req, res, 409, `Category "${cat_name}" already exists`);
      }
      category.cat_name = cat_name;
    }
    if (image !== undefined) category.image = image;
    await category.save();

    res.status(200).json({ message: "Category updated", category });
  } catch (error) {
    if (isUniqueError(error)) {
      return reject(req, res, 409, "This category already exists");
    }
    console.error("updateCategory:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    await category.destroy();
    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    if (error.original?.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        message:
          "Cannot delete this category — remove all subcategories and products under it first.",
      });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
};
