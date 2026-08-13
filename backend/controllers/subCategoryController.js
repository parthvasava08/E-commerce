import SubCategory from "../models/SubCategory.js";
import Category from "../models/Category.js";

export const createSubCategory = async (req, res) => {
  try {
    const { cat_id, sub_cat_name } = req.body;
    const image = req.file ? req.file.path : null;

    if (!cat_id || !sub_cat_name) {
      return res
        .status(400)
        .json({ message: "cat_id and sub_cat_name are required" });
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
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll({
      include: [{ model: Category, attributes: ["cat_name"] }],
    });
    res.status(200).json(subCategories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { cat_id, sub_cat_name } = req.body;
    const image = req.file ? req.file.path : undefined;

    const subCategory = await SubCategory.findByPk(id);
    if (!subCategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    subCategory.cat_id = cat_id ?? subCategory.cat_id;
    subCategory.sub_cat_name = sub_cat_name ?? subCategory.sub_cat_name;
    if (image !== undefined) subCategory.image = image;
    await subCategory.save();

    res.status(200).json({ message: "Subcategory updated", subCategory });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
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
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
