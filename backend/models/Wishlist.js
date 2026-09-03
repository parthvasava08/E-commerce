import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";
import Product from "./Product.js";

const Wishlist = sequelize.define(
  "Wishlist",
  {
    wishlist_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "tbl_wishlist",
    timestamps: false,
  },
);

Wishlist.belongsTo(User, { foreignKey: "user_id" });
Wishlist.belongsTo(Product, { foreignKey: "product_id" });

export default Wishlist;
