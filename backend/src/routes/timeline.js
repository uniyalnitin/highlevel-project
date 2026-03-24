const express = require("express");
const router = express.Router();
const timelineService = require("../services/timelineService");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res, next) => {
  try {
    const cursor = req.query.cursor || null;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const data = await timelineService.getTimeline(req.userId, cursor, limit);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
