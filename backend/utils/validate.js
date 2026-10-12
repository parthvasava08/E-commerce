import { Op, fn, col, where as sqlWhere } from "sequelize";

export const cleanText = (value, max) => {
  if (typeof value !== "string") return null;
  const text = value.trim().replace(/\s+/g, " ");
  return text && text.length <= max ? text : null;
};

export const toId = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : null;
};

export const sameName = (column, name) =>
  sqlWhere(fn("LOWER", col(column)), name.toLowerCase());

export const notId = (idColumn, id) =>
  id ? { [idColumn]: { [Op.ne]: id } } : {};

export const isUniqueError = (error) =>
  error?.name === "SequelizeUniqueConstraintError";
