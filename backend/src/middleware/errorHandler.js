const { AppError, NotFoundError } = require("../errors");

const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  next(new NotFoundError(`Not Found - ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };
