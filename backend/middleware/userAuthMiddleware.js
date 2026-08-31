import jwt from "jsonwebtoken";

const verifyUserMiddleware = (req, res, next) => {
  const token = req.cookies.user_token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default verifyUserMiddleware;
