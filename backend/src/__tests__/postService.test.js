const mongoose = require("mongoose");
const connectDB = require("../config/db");

let postService;
let authService;

beforeAll(async () => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  await connectDB();
  postService = require("../services/postService");
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

describe("postService.createPost", () => {
  let userId;

  beforeEach(async () => {
    const { userId: id } = await authService.register("PostUser", "postuser", "password123");
    userId = id;
  });

  it("returns postId for valid input", async () => {
    const result = await postService.createPost(userId, "My Title", "My post body");
    expect(result).toHaveProperty("postId");
    expect(typeof result.postId).toBe("string");
  });

  it("throws NotFoundError for invalid userId", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(
      postService.createPost(fakeId, "Title", "Body")
    ).rejects.toThrow(expect.objectContaining({ name: "NotFoundError", statusCode: 404 }));
  });
});

describe("postService.deletePost", () => {
  let userId;
  let postId;

  beforeEach(async () => {
    const { userId: id } = await authService.register("DelUser", "deluser", "password123");
    userId = id;
    const { postId: pid } = await postService.createPost(userId, "To Delete", "Body");
    postId = pid;
  });

  it("deletes own post successfully", async () => {
    await expect(postService.deletePost(userId, postId)).resolves.not.toThrow();
  });

  it("throws NotFoundError for non-existent post", async () => {
    const fakePostId = new mongoose.Types.ObjectId().toString();
    await expect(
      postService.deletePost(userId, fakePostId)
    ).rejects.toThrow(expect.objectContaining({ name: "NotFoundError", statusCode: 404 }));
  });

  it("throws UnauthorizedError when not the author", async () => {
    const { userId: otherId } = await authService.register("Other", "otheruser", "password123");
    await expect(
      postService.deletePost(otherId, postId)
    ).rejects.toThrow(expect.objectContaining({ name: "UnauthorizedError", statusCode: 401 }));
  });
});
