const express = require("express");
const router = express.Router();
const postService = require("../services/postService");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const validateFields = require("../middleware/validateFields");

router.post("/", auth, validate(["title", "body"]), validateFields({ title: { max: 20 }, body: { max: 300 } }), async (req, res, next) => {
  try {
    const { title, body } = req.body;
    const data = await postService.createPost(req.userId, title, body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.delete("/:postId", auth, async (req, res, next) => {
  try {
    await postService.deletePost(req.userId, req.params.postId);
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
