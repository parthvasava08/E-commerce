import SubCategory from "../models/SubCategory.js";
import Category from "../models/Category.js";

export const createSubCategory = async (req, res) => {
  try {
    const { cat_id, sub_cat_name, image } = req.body;

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
