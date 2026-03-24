const express = require("express");
const router = express.Router();
const authService = require("../services/authService");
const validate = require("../middleware/validate");

router.post("/login", validate(["handle", "password"]), async (req, res, next) => {
  try {
    const { handle, password } = req.body;
    const data = await authService.login(handle, password);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
