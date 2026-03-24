const Follow = require("../models/Follow");
const User = require("../models/User");
const {
  ValidationError,
  ConflictError,
  NotFoundError,
} = require("../errors");

async function follow(followerId, followingId) {
  if (followerId === followingId) {
    throw new ValidationError("Cannot follow yourself");
  }

  const targetUser = await User.findById(followingId);
  if (!targetUser) {
    throw new NotFoundError("User not found");
  }

  const existing = await Follow.findOne({ follower: followerId, following: followingId });
  if (existing) {
    throw new ConflictError("Already following this user");
  }

  await Follow.create({ follower: followerId, following: followingId });
}

async function unfollow(followerId, followingId) {
  const result = await Follow.findOneAndDelete({
    follower: followerId,
    following: followingId,
  });

  if (!result) {
    throw new NotFoundError("Not following this user");
  }
}

module.exports = { follow, unfollow };
