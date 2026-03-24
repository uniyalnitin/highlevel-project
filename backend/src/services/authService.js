const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} = require("../errors");

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function register(name, handle, password) {
  const existing = await User.findOne({ handle: handle.toLowerCase() });
  if (existing) {
    throw new ConflictError("Handle already taken");
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, handle, password: hashed });
  const token = generateToken(user._id.toString());

  return { userId: user._id.toString(), token };
}

async function login(handle, password) {
  const user = await User.findOne({ handle: handle.toLowerCase() });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const token = generateToken(user._id.toString());
  return { userId: user._id.toString(), token };
}

module.exports = { register, login };
