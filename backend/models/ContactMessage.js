import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ContactMessage = sequelize.define(
  "ContactMessage",
  {
    contact_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(200),
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "tbl_contact_messages",
    timestamps: false,
  },
);

export default ContactMessage;
