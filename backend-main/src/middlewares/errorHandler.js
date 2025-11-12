const ApiError = require("../utils/ApiError");

module.exports = (err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: false,
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      status: false,
      message: `${field} already exists`,
      field,
    });
  }

  res.status(statusCode).json({
    status: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
