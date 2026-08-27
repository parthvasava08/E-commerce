import Category from "../models/Category.js";
import upload from "../middleware/upload.js";
export const createCategory = async (req, res) => {
  try {
    const { cat_name } = req.body;
    const image = req.file ? req.file.path : null;

    if (!cat_name) {
      return res.status(400).json({ message: "Category name is required" });
    }
    const newCategory = await Category.create({ cat_name, image });
    res
      .status(201)
      .json({ message: "Category created", category: newCategory });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { cat_name } = req.body;
    const image = req.file ? req.file.path : undefined;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.cat_name = cat_name ?? category.cat_name;
    if (image !== undefined) category.image = image;
    await category.save();

    res.status(200).json({ message: "Category updated", category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
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
