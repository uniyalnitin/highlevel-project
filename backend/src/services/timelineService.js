const mongoose = require("mongoose");
const Post = require("../models/Post");
const Follow = require("../models/Follow");
const { ValidationError } = require("../errors");

async function getTimeline(userId, cursor, limit = 10) {
  // Validate cursor if provided
  if (cursor && !mongoose.Types.ObjectId.isValid(cursor)) {
    throw new ValidationError("Invalid cursor");
  }

  // Step 1: Get list of followed user IDs
  const follows = await Follow.find({ follower: userId }).select("following");
  const followedIds = follows.map((f) => f.following);

  if (followedIds.length === 0) {
    return { posts: [], nextCursor: null };
  }

  // Step 2: Build query
  const query = { author: { $in: followedIds } };

  // Step 3: Cursor-based pagination
  if (cursor) {
    const cursorPost = await Post.findById(cursor);
    if (!cursorPost) {
      throw new ValidationError("Invalid cursor");
    }
    query.$or = [
      { createdAt: { $lt: cursorPost.createdAt } },
      { createdAt: cursorPost.createdAt, _id: { $lt: cursorPost._id } },
    ];
  }

  // Step 4: Fetch limit + 1 to detect next page
  const posts = await Post.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate("author", "handle");

  // Step 5: Determine nextCursor
  let nextCursor = null;
  if (posts.length > limit) {
    posts.pop();
    nextCursor = posts[posts.length - 1]._id.toString();
  }

  // Step 6: Format response
  const formatted = posts.map((p) => ({
    postId: p._id.toString(),
    title: p.title,
    body: p.body,
    authorId: p.author._id.toString(),
    authorHandle: p.author.handle,
    createdAt: p.createdAt.toISOString(),
  }));

  return { posts: formatted, nextCursor };
}

module.exports = { getTimeline };
