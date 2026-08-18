import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Category from "./Category.js";
import SubCategory from "./SubCategory.js";
import Brand from "./Brand.js";

const Product = sequelize.define(
  "Product",
  {
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subcat_id: {
      type: DataTypes.INTEGER,
    },
    brand_id: {
      type: DataTypes.INTEGER,
    },
    product_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount_price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("active", "not-active"),
      defaultValue: "active",
    },
    cover_image: {
      type: DataTypes.STRING(255),
    },
    image_1: {
      type: DataTypes.STRING(255),
    },
    image_2: {
      type: DataTypes.STRING(255),
    },
    image_3: {
      type: DataTypes.STRING(255),
    },
    image_4: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "tbl_products",
    timestamps: false,
  },
);

Product.belongsTo(Category, { foreignKey: "cat_id" });
Product.belongsTo(SubCategory, { foreignKey: "subcat_id" });
Product.belongsTo(Brand, { foreignKey: "brand_id" });

export default Product;
