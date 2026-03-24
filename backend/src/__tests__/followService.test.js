const mongoose = require("mongoose");
const connectDB = require("../config/db");

let followService;
let authService;

beforeAll(async () => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  await connectDB();
  followService = require("../services/followService");
  authService = require("../services/authService");
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
  console.log.mockRestore();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("followService.follow", () => {
  let userA;
  let userB;

  beforeEach(async () => {
    const a = await authService.register("UserAAA", "usera", "password123");
    const b = await authService.register("UserBBB", "userb", "password123");
    userA = a.userId;
    userB = b.userId;
  });

  it("follows another user successfully", async () => {
    await expect(followService.follow(userA, userB)).resolves.not.toThrow();
  });

  it("throws ValidationError for self-follow", async () => {
    await expect(
      followService.follow(userA, userA)
    ).rejects.toThrow(expect.objectContaining({ name: "ValidationError", statusCode: 400 }));
  });

  it("throws ConflictError for duplicate follow", async () => {
    await followService.follow(userA, userB);
    await expect(
      followService.follow(userA, userB)
    ).rejects.toThrow(expect.objectContaining({ name: "ConflictError", statusCode: 409 }));
  });

  it("throws NotFoundError when target user does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(
      followService.follow(userA, fakeId)
    ).rejects.toThrow(expect.objectContaining({ name: "NotFoundError", statusCode: 404 }));
  });
});

describe("followService.unfollow", () => {
  let userA;
  let userB;

  beforeEach(async () => {
    const a = await authService.register("UserAAA", "usera", "password123");
    const b = await authService.register("UserBBB", "userb", "password123");
    userA = a.userId;
    userB = b.userId;
  });

  it("unfollows a followed user successfully", async () => {
    await followService.follow(userA, userB);
    await expect(followService.unfollow(userA, userB)).resolves.not.toThrow();
  });

  it("throws NotFoundError when not following the user", async () => {
    await expect(
      followService.unfollow(userA, userB)
    ).rejects.toThrow(expect.objectContaining({ name: "NotFoundError", statusCode: 404 }));
  });
});
