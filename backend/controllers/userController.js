import { Op } from "sequelize";
import User from "../models/User.js";
import Order from "../models/Order.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../services/emailService.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Compared against when the email is unknown, so a login for a missing
// account takes as long as one for a real account.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

const passwordProblem = (pw) => {
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (Buffer.byteLength(pw, "utf8") > 72) {
    return "Password is too long (72 bytes maximum)";
  }
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) {
    return "Password must contain at least one letter and one number";
  }
  return null;
};

const cookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    path: "/",
  };
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, contact, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "username, email, and password are required" });
    }

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      (contact != null && typeof contact !== "string")
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const cleanName = username.trim();
    const cleanEmail = email.trim();
    const phone = (contact || "").trim();

    if (!cleanName) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (
      cleanName.length > 100 ||
      cleanEmail.length > 150 ||
      phone.length > 20
    ) {
      return res
        .status(400)
        .json({ message: "One or more fields are too long" });
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const pwProblem = passwordProblem(password);
    if (pwProblem) {
      return res.status(400).json({ message: pwProblem });
    }

    const existing = await User.findOne({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username: cleanName,
      email: cleanEmail,
      contact: phone || null,
      password: hashedPassword,
    });

    sendWelcomeEmail({
      email: newUser.email,
      username: newUser.username,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Email already registered" });
    }
    console.error("registerUser:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid input" });
    }

    const user = await User.findOne({ where: { email: email.trim() } });

    const isMatch = await bcrypt.compare(
      password,
      user ? user.password : DUMMY_HASH,
    );
    if (!user || !isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "deactivated") {
      return res.status(403).json({
        message: "Your account has been deactivated",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set");
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("user_token", token, {
      ...cookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("loginUser:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("user_token", cookieOptions());
  return res.status(200).json({ message: "Logged out successfully" });
};

export const verifyUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: ["user_id", "username", "email", "status"],
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: ["user_id", "username", "email", "contact", "status"],
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, email, contact } = req.body;
    const user = await User.findByPk(req.user.user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email !== undefined && email !== null) {
      if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    user.username = username ?? user.username;
    user.email = email ?? user.email;
    user.contact = contact ?? user.contact;
    await user.save();

    res.status(200).json({
      message: "Profile updated",
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        contact: user.contact,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: "Both passwords are required" });
    }

    if (
      typeof current_password !== "string" ||
      typeof new_password !== "string"
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const pwProblem = passwordProblem(new_password);
    if (pwProblem) {
      return res.status(400).json({ message: pwProblem });
    }

    const user = await User.findByPk(req.user.user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deactivateAccount = async (req, res) => {
  try {
    const password = req.body?.password;
    if (typeof password !== "string" || !password) {
      return res
        .status(400)
        .json({ message: "Enter your password to confirm" });
    }

    const user = await User.findByPk(req.user.user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const openOrders = await Order.count({
      where: {
        user_id: user.user_id,
        order_status: { [Op.in]: ["pending", "confirmed", "shipped"] },
      },
    });
    if (openOrders > 0) {
      return res.status(409).json({
        message: `You have ${openOrders} order${openOrders > 1 ? "s" : ""} in progress. Wait until ${openOrders > 1 ? "they are" : "it is"} delivered or cancelled, then try again.`,
      });
    }

    user.status = "deactivated";
    await user.save();

    res.clearCookie("user_token", cookieOptions());

    res.status(200).json({ message: "Account deactivated" });
  } catch (error) {
    console.error("deactivateAccount:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "user_id",
        "username",
        "email",
        "contact",
        "status",
        "created_at",
      ],
      order: [["user_id", "DESC"]],
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "deactivated"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = status;
    await user.save();

    res.status(200).json({
      message: "User status updated",
      user: { user_id: user.user_id, status: user.status },
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
