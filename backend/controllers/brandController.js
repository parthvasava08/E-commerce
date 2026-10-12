import Brand from "../models/Brand.js";
import { Op } from "sequelize";
import { reject } from "../utils/uploads.js";
import {
  cleanText,
  sameName,
  notId,
  isUniqueError,
} from "../utils/validate.js";

const findDuplicate = (name, excludeId) =>
  Brand.findOne({
    where: {
      [Op.and]: [sameName("brand_name", name), notId("brand_id", excludeId)],
    },
  });

export const createBrand = async (req, res) => {
  try {
    const brand_name = cleanText(req.body?.brand_name, 100);
    const logo_image = req.file ? req.file.path : null;

    if (!brand_name) {
      return reject(
        req,
        res,
        400,
        "Brand name is required (max 100 characters)",
      );
    }
    if (await findDuplicate(brand_name)) {
      return reject(req, res, 409, `Brand "${brand_name}" already exists`);
    }

    const newBrand = await Brand.create({ brand_name, logo_image });
    res.status(201).json({ message: "Brand created", brand: newBrand });
  } catch (error) {
    if (isUniqueError(error)) {
      return reject(req, res, 409, "This brand already exists");
    }
    console.error("createBrand:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll();
    res.status(200).json(brands);
  } catch (error) {
    console.error("getAllBrands:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const rawName = req.body?.brand_name;
    const logo_image = req.file ? req.file.path : undefined;

    const brand = await Brand.findByPk(id);
    if (!brand) {
      return reject(req, res, 404, "Brand not found");
    }

    if (rawName !== undefined) {
      const brand_name = cleanText(rawName, 100);
      if (!brand_name) {
        return reject(
          req,
          res,
          400,
          "Brand name cannot be empty (max 100 characters)",
        );
      }
      if (await findDuplicate(brand_name, brand.brand_id)) {
        return reject(req, res, 409, `Brand "${brand_name}" already exists`);
      }
      brand.brand_name = brand_name;
    }
    if (logo_image !== undefined) brand.logo_image = logo_image;
    await brand.save();

    res.status(200).json({ message: "Brand updated", brand });
  } catch (error) {
    if (isUniqueError(error)) {
      return reject(req, res, 409, "This brand already exists");
    }
    console.error("updateBrand:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    await brand.destroy();
    res.status(200).json({ message: "Brand deleted" });
  } catch (error) {
    if (error.original?.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        message:
          "Cannot delete this brand — remove all products under it first.",
      });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
};
