const Post = require("../models/Post");
const User = require("../models/User");
const {
  NotFoundError,
  UnauthorizedError,
} = require("../errors");

async function createPost(userId, title, body) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const post = await Post.create({ title, body, author: userId });
  return { postId: post._id.toString() };
}

async function deletePost(userId, postId) {
  const post = await Post.findById(postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  if (post.author.toString() !== userId) {
    throw new UnauthorizedError("Not authorized to delete this post");
  }

  await Post.findByIdAndDelete(postId);
}

module.exports = { createPost, deletePost };
