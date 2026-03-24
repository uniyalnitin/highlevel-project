const express = require("express");
const router = express.Router();
const followService = require("../services/followService");
const auth = require("../middleware/auth");

router.post("/:userId/follow", auth, async (req, res, next) => {
  try {
    await followService.follow(req.userId, req.params.userId);
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

router.delete("/:userId/follow", auth, async (req, res, next) => {
  try {
    await followService.unfollow(req.userId, req.params.userId);
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
