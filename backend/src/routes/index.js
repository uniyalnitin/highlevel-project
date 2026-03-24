const express = require("express");
const router = express.Router();

router.use("/health", require("./health"));

// Add new resource routes here:
// router.use("/users", require("./users"));

module.exports = router;
