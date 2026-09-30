import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import verifyAdminMiddleware from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);

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

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

app.use("/api/admin/login", loginLimiter);
app.use("/api/users/login", loginLimiter);
app.use("/api/users/register", loginLimiter);

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

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "KOREX API is running" });
});

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error" });
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
