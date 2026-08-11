import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Category from "./Category.js";

const SubCategory = sequelize.define(
  "SubCategory",
  {
    sub_cat_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sub_cat_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "tbl_subcategories",
    timestamps: false,
  },
);

SubCategory.belongsTo(Category, { foreignKey: "cat_id" });
Category.hasMany(SubCategory, { foreignKey: "cat_id" });

export default SubCategory;
