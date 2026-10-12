import SubCategory from "../models/SubCategory.js";
import Category from "../models/Category.js";
import { Op } from "sequelize";
import { reject } from "../utils/uploads.js";
import {
  cleanText,
  toId,
  sameName,
  notId,
  isUniqueError,
} from "../utils/validate.js";

const findDuplicate = (cat_id, name, excludeId) =>
  SubCategory.findOne({
    where: {
      [Op.and]: [
        { cat_id },
        sameName("sub_cat_name", name),
        notId("sub_cat_id", excludeId),
      ],
    },
  });

export const createSubCategory = async (req, res) => {
  try {
    const cat_id = toId(req.body?.cat_id);
    const sub_cat_name = cleanText(req.body?.sub_cat_name, 100);
    const image = req.file ? req.file.path : null;

    if (!cat_id) {
      return reject(req, res, 400, "Please select a parent category");
    }
    if (!sub_cat_name) {
      return reject(
        req,
        res,
        400,
        "Subcategory name is required (max 100 characters)",
      );
    }

    const parent = await Category.findByPk(cat_id);
    if (!parent) {
      return reject(req, res, 400, "The selected category does not exist");
    }
    if (await findDuplicate(cat_id, sub_cat_name)) {
      return reject(
        req,
        res,
        409,
        `"${sub_cat_name}" already exists under ${parent.cat_name}`,
      );
    }

    const newSubCategory = await SubCategory.create({
      cat_id,
      sub_cat_name,
      image,
    });
    res
      .status(201)
      .json({ message: "Subcategory created", subCategory: newSubCategory });
  } catch (error) {
    if (isUniqueError(error)) {
      return reject(
        req,
        res,
        409,
        "This subcategory already exists in that category",
      );
    }
    console.error("createSubCategory:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll({
      include: [{ model: Category, attributes: ["cat_name"] }],
    });
    res.status(200).json(subCategories);
  } catch (error) {
    console.error("getAllSubCategories:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const image = req.file ? req.file.path : undefined;

    const subCategory = await SubCategory.findByPk(id);
    if (!subCategory) {
      return reject(req, res, 404, "Subcategory not found");
    }

    let cat_id = subCategory.cat_id;
    let sub_cat_name = subCategory.sub_cat_name;

    if (req.body?.cat_id !== undefined) {
      cat_id = toId(req.body.cat_id);
      if (!cat_id) {
        return reject(req, res, 400, "Please select a parent category");
      }
      if (!(await Category.findByPk(cat_id))) {
        return reject(req, res, 400, "The selected category does not exist");
      }
    }
    if (req.body?.sub_cat_name !== undefined) {
      sub_cat_name = cleanText(req.body.sub_cat_name, 100);
      if (!sub_cat_name) {
        return reject(
          req,
          res,
          400,
          "Subcategory name cannot be empty (max 100 characters)",
        );
      }
    }

    if (await findDuplicate(cat_id, sub_cat_name, subCategory.sub_cat_id)) {
      return reject(
        req,
        res,
        409,
        `"${sub_cat_name}" already exists in that category`,
      );
    }

    subCategory.cat_id = cat_id;
    subCategory.sub_cat_name = sub_cat_name;
    if (image !== undefined) subCategory.image = image;
    await subCategory.save();

    res.status(200).json({ message: "Subcategory updated", subCategory });
  } catch (error) {
    if (isUniqueError(error)) {
      return reject(
        req,
        res,
        409,
        "This subcategory already exists in that category",
      );
    }
    console.error("updateSubCategory:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findByPk(id);
    if (!subCategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    await subCategory.destroy();
    res.status(200).json({ message: "Subcategory deleted" });
  } catch (error) {
    if (error.original?.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        message:
          "Cannot delete this subcategory — remove all products under it first.",
      });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
};
