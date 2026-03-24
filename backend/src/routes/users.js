const express = require("express");
const router = express.Router();
const authService = require("../services/authService");
const validate = require("../middleware/validate");
const validateFields = require("../middleware/validateFields");

router.post("/", validate(["name", "handle", "password"]), validateFields({ name: { min: 3 } }), async (req, res, next) => {
  try {
    const { name, handle, password } = req.body;
    const data = await authService.register(name, handle, password);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
