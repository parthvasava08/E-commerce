import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
});

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    if (!email.trim() || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ where: { email: email.trim() } });

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

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
      ...cookieOptions(),
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
    console.error("loginAdmin:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyAdmin = (req, res) => {
  return res.status(200).json({ admin: req.admin });
};

export const logoutAdmin = (req, res) => {
  res.clearCookie("admin_token", cookieOptions());
  return res.status(200).json({ message: "Logged out successfully" });
};

const profileOf = (admin) => ({
  admin_id: admin.admin_id,
  admin_name: admin.admin_name,
  email: admin.email,
  contact: admin.contact,
});

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.admin_id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.status(200).json({ admin: profileOf(admin) });
  } catch (error) {
    console.error("getAdminProfile:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const body = req.body ?? {};

    const name =
      typeof body.admin_name === "string"
        ? body.admin_name.trim().replace(/\s+/g, " ")
        : "";
    if (!name || name.length > 20) {
      return res
        .status(400)
        .json({ message: "Name is required (max 20 characters)" });
    }

    let contact = null;
    if (
      body.contact !== undefined &&
      body.contact !== null &&
      body.contact !== ""
    ) {
      if (typeof body.contact !== "string") {
        return res
          .status(400)
          .json({ message: "Enter a valid contact number" });
      }
      const digits = body.contact.replace(/[\s-]/g, "");
      if (!/^[6-9]\d{9}$/.test(digits)) {
        return res
          .status(400)
          .json({ message: "Enter a valid 10-digit mobile number" });
      }
      contact = digits;
    }

    const admin = await Admin.findByPk(req.admin.admin_id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.admin_name = name;
    admin.contact = contact;
    await admin.save();

    res.status(200).json({
      message: "Profile updated",
      admin: profileOf(admin),
    });
  } catch (error) {
    console.error("updateAdminProfile:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const changeAdminPassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body ?? {};

    if (
      typeof current_password !== "string" ||
      typeof new_password !== "string" ||
      !current_password ||
      !new_password
    ) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }
    if (new_password.length < 8 || new_password.length > 72) {
      return res
        .status(400)
        .json({ message: "New password must be 8 to 72 characters" });
    }
    if (!/[A-Za-z]/.test(new_password) || !/\d/.test(new_password)) {
      return res.status(400).json({
        message: "New password must contain at least one letter and one number",
      });
    }
    if (new_password === current_password) {
      return res.status(400).json({
        message: "New password must be different from the current one",
      });
    }

    const admin = await Admin.findByPk(req.admin.admin_id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const matches = await bcrypt.compare(current_password, admin.password);
    if (!matches) {
      // 400, not 401: the admin app treats a 401 as an expired session
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    admin.password = await bcrypt.hash(new_password, 10);
    await admin.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("changeAdminPassword:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
