import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Coupon = sequelize.define(
  "Coupon",
  {
    coupon_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    coupon_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    discount_type: {
      type: DataTypes.ENUM("flat", "percentage"),
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    minimum_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    tableName: "tbl_coupons",
    timestamps: false,
  },
);

export default Coupon;
