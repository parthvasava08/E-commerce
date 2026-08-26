import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import sequelize from "./config/db.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import verifyAdminMiddleware from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/admin", adminRoutes);

app.use("/api/categories", verifyAdminMiddleware, categoryRoutes);
app.use("/api/subcategories", verifyAdminMiddleware, subCategoryRoutes);
app.use("/api/brands", verifyAdminMiddleware, brandRoutes);
app.use("/api/products", verifyAdminMiddleware, productRoutes);
app.use("/api/dashboard", verifyAdminMiddleware, dashboardRoutes);
app.use("/api/coupons", verifyAdminMiddleware, couponRoutes);
app.use("/api/users", verifyAdminMiddleware, userRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

sequelize
  .authenticate()
  .then(() => console.log("MySQL connected successfully"))
  .catch((err) => console.error("Connection failed:", err));

sequelize
  .sync()
  .then(() => console.log("Models synced"))
  .catch((err) => console.error("Sync failed:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
