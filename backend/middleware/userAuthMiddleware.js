import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verifyUserMiddleware = async (req, res, next) => {
  const token = req.cookies.user_token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  if (!decoded.user_id) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const user = await User.findByPk(decoded.user_id, {
      attributes: ["user_id", "status"],
    });

    if (!user || user.status !== "active") {
      return res
        .status(401)
        .json({ message: "Account is not active. Please contact support." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export default verifyUserMiddleware;
