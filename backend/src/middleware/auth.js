const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../errors");

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Invalid or expired token"));
    }
    next(err);
  }
};

module.exports = auth;
