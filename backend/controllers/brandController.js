import Brand from "../models/Brand.js";

export const createBrand = async (req, res) => {
  try {
    const { brand_name } = req.body;
    const image = req.file ? req.file.path : null;

    if (!brand_name) {
      return res.status(400).json({ message: "Brand name is required" });
    }

    const newBrand = await Brand.create({ brand_name, image });
    res.status(201).json({ message: "Brand created", brand: newBrand });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll();
    res.status(200).json(brands);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand_name } = req.body;
    const image = req.file ? req.file.path : undefined;

    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    brand.brand_name = brand_name ?? brand.brand_name;
    if (image !== undefined) brand.image = image;
    await brand.save();

    res.status(200).json({ message: "Brand updated", brand });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    await brand.destroy();
    res.status(200).json({ message: "Brand deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
