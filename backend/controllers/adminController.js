import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ where: { email } });
    console.log("Admin found:", admin ? admin.email : "NOT FOUND");

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set");
    }

    const token = jwt.sign(
      { admin_id: admin.admin_id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      admin: {
        admin_id: admin.admin_id,
        admin_name: admin.admin_name,
        email: admin.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const verifyAdmin = (req, res) => {
  return res.status(200).json({ admin: req.admin });
};

export const logoutAdmin = (req, res) => {
  res.clearCookie("admin_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};
