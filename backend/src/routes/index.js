const express = require("express");
const router = express.Router();

router.use("/health", require("./health"));
router.use("/users", require("./users"));
router.use("/auth", require("./auth"));
router.use("/posts", require("./posts"));
router.use("/users", require("./follow"));
router.use("/timeline", require("./timeline"));

module.exports = router;
