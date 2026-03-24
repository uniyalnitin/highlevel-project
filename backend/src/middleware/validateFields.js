const { ValidationError } = require("../errors");

/**
 * Middleware factory — validates field constraints (min/max length).
 *
 * Usage: router.post("/", validateFields({ name: { min: 3 }, title: { max: 20 } }), handler)
 */
const validateFields = (rules) => (req, res, next) => {
  for (const [field, constraints] of Object.entries(rules)) {
    const val = req.body[field];
    if (val === undefined || val === null) continue;

    const str = String(val);
    if (constraints.min && str.length < constraints.min) {
      return next(
        new ValidationError(`${field} must be at least ${constraints.min} characters`)
      );
    }
    if (constraints.max && str.length > constraints.max) {
      return next(
        new ValidationError(`${field} must be at most ${constraints.max} characters`)
      );
    }
  }
  next();
};

module.exports = validateFields;
