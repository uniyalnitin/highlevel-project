const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// GET /api/health
router.get("/", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: states[mongoose.connection.readyState] ?? "unknown",
    },
  });
});

module.exports = router;
