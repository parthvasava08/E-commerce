import jwt from "jsonwebtoken";

const decodeAdminToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.admin_id) throw new Error("Not an admin token");
  return decoded;
};

const verifyAdminMiddleware = (req, res, next) => {
  const token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    req.admin = decodeAdminToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const optionalAdmin = (req, res, next) => {
  const token = req.cookies.admin_token;
  if (token) {
    try {
      req.admin = decodeAdminToken(token);
    } catch (err) {}
  }
  next();
};

export default verifyAdminMiddleware;
