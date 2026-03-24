const mongoose = require("mongoose");
const connectDB = require("../config/db");

let timelineService;
let authService;
let postService;
let followService;

beforeAll(async () => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  await connectDB();
  timelineService = require("../services/timelineService");
  authService = require("../services/authService");
  postService = require("../services/postService");
  followService = require("../services/followService");
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

describe("timelineService.getTimeline", () => {
  let reader;
  let author;

  beforeEach(async () => {
    const r = await authService.register("Reader", "reader", "password123");
    const a = await authService.register("Author", "author", "password123");
    reader = r.userId;
    author = a.userId;
    await followService.follow(reader, author);
  });

  it("returns posts from followed users ordered newest first", async () => {
    await postService.createPost(author, "First", "First body");
    // small delay to ensure different createdAt
    await new Promise((resolve) => setTimeout(resolve, 50));
    await postService.createPost(author, "Second", "Second body");

    const result = await timelineService.getTimeline(reader, null, 10);
    expect(result).toHaveProperty("posts");
    expect(result).toHaveProperty("nextCursor");
    expect(result.posts).toHaveLength(2);
    expect(result.posts[0].title).toBe("Second");
    expect(result.posts[1].title).toBe("First");
  });

  it("includes authorHandle in each post", async () => {
    await postService.createPost(author, "HandleTest", "Body");

    const result = await timelineService.getTimeline(reader, null, 10);
    expect(result.posts[0]).toHaveProperty("authorHandle", "author");
  });

  it("returns empty posts array when user follows nobody", async () => {
    const { userId: loner } = await authService.register("Loner", "loner", "password123");
    const result = await timelineService.getTimeline(loner, null, 10);
    expect(result.posts).toEqual([]);
    expect(result.nextCursor).toBeNull();
  });

  it("returns correct page and nextCursor with cursor pagination", async () => {
    // Create 5 posts
    for (let i = 1; i <= 5; i++) {
      await postService.createPost(author, `Post ${i}`, `Body ${i}`);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // First page: limit 2
    const page1 = await timelineService.getTimeline(reader, null, 2);
    expect(page1.posts).toHaveLength(2);
    expect(page1.nextCursor).not.toBeNull();
    expect(page1.posts[0].title).toBe("Post 5");
    expect(page1.posts[1].title).toBe("Post 4");

    // Second page using cursor
    const page2 = await timelineService.getTimeline(reader, page1.nextCursor, 2);
    expect(page2.posts).toHaveLength(2);
    expect(page2.posts[0].title).toBe("Post 3");
    expect(page2.posts[1].title).toBe("Post 2");
  });

  it("returns nextCursor as null on the last page", async () => {
    await postService.createPost(author, "Only Post", "Body");

    const result = await timelineService.getTimeline(reader, null, 10);
    expect(result.posts).toHaveLength(1);
    expect(result.nextCursor).toBeNull();
  });

  it("does not include posts from unfollowed users", async () => {
    const { userId: stranger } = await authService.register("Stranger", "stranger", "password123");
    await postService.createPost(stranger, "Hidden", "Should not appear");
    await postService.createPost(author, "Visible", "Should appear");

    const result = await timelineService.getTimeline(reader, null, 10);
    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].title).toBe("Visible");
  });
});
