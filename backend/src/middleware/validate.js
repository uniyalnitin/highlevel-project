const { ValidationError } = require("../errors");

/**
 * Middleware factory — validates that required fields are present and non-empty.
 *
 * Usage: router.post("/", validate(["name", "email"]), handler)
 */
const validate = (fields) => (req, res, next) => {
  const missing = fields.filter((f) => {
    const val = req.body[f];
    return val === undefined || val === null || String(val).trim() === "";
  });
  if (missing.length > 0) {
    return next(new ValidationError(`Missing required fields: ${missing.join(", ")}`));
  }
  next();
};

module.exports = validate;
