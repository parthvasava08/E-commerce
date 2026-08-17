import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Brand = sequelize.define(
  "Brand",
  {
    brand_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    brand_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    logo_image: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "tbl_brands",
    timestamps: false,
  },
);

export default Brand;
