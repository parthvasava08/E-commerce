import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import sequelize from "./config/db.js";

import "./models/Order.js";
import "./models/Payment.js";
import "./models/OrderItem.js";
import "./models/Address.js";
import "./models/Cart.js";
import "./models/Wishlist.js";
import "./models/ContactMessage.js";

import categoryRoutes from "./routes/categoryRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userOrderRoutes from "./routes/userOrderRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import verifyAdminMiddleware from "./middleware/authMiddleware.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_USER_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/my-orders", userOrderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/track", trackingRoutes);

app.use("/api/categories", verifyAdminMiddleware, categoryRoutes);
app.use("/api/subcategories", verifyAdminMiddleware, subCategoryRoutes);
app.use("/api/brands", verifyAdminMiddleware, brandRoutes);
app.use("/api/products", verifyAdminMiddleware, productRoutes);
app.use("/api/dashboard", verifyAdminMiddleware, dashboardRoutes);
app.use("/api/coupons", verifyAdminMiddleware, couponRoutes);
app.use("/api/orders", verifyAdminMiddleware, orderRoutes);
app.use("/api/payments", verifyAdminMiddleware, paymentRoutes);
app.use("/api/notifications", verifyAdminMiddleware, notificationRoutes);

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
