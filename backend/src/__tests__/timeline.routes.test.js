const request = require("supertest");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const app = require("../index");

beforeAll(async () => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  await connectDB();
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

async function registerAndLogin(name, handle) {
  const res = await request(app)
    .post("/api/users")
    .send({ name, handle, password: "password123" });
  return { token: res.body.data.token, userId: res.body.data.userId };
}

async function createPost(token, title, body) {
  const res = await request(app)
    .post("/api/posts")
    .set("Authorization", `Bearer ${token}`)
    .send({ title, body });
  return res.body.data.postId;
}

describe("GET /api/timeline", () => {
  let reader, author;

  beforeEach(async () => {
    reader = await registerAndLogin("Reader", "reader");
    author = await registerAndLogin("Author", "author");
    // reader follows author
    await request(app)
      .post(`/api/users/${author.userId}/follow`)
      .set("Authorization", `Bearer ${reader.token}`);
  });

  it("returns 200 with correct response shape", async () => {
    await createPost(author.token, "Hello", "World");

    const res = await request(app)
      .get("/api/timeline")
      .set("Authorization", `Bearer ${reader.token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("posts");
    expect(res.body.data).toHaveProperty("nextCursor");
    expect(res.body.data.posts[0]).toHaveProperty("postId");
    expect(res.body.data.posts[0]).toHaveProperty("title");
    expect(res.body.data.posts[0]).toHaveProperty("body");
    expect(res.body.data.posts[0]).toHaveProperty("authorId");
    expect(res.body.data.posts[0]).toHaveProperty("authorHandle");
    expect(res.body.data.posts[0]).toHaveProperty("createdAt");
  });

  it("returns 401 when no auth token is provided", async () => {
    const res = await request(app).get("/api/timeline");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns empty posts array when user follows nobody", async () => {
    const { token: lonerToken } = await registerAndLogin("Loner", "loner");
    const res = await request(app)
      .get("/api/timeline")
      .set("Authorization", `Bearer ${lonerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.posts).toEqual([]);
    expect(res.body.data.nextCursor).toBeNull();
  });

  it("returns correct pages with cursor pagination", async () => {
    // Create 5 posts with small delays for ordering
    for (let i = 1; i <= 5; i++) {
      await createPost(author.token, `Post ${i}`, `Body ${i}`);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // First page: limit 2
    const page1 = await request(app)
      .get("/api/timeline?limit=2")
      .set("Authorization", `Bearer ${reader.token}`);
    expect(page1.body.data.posts).toHaveLength(2);
    expect(page1.body.data.nextCursor).not.toBeNull();
    expect(page1.body.data.posts[0].title).toBe("Post 5");

    // Second page
    const page2 = await request(app)
      .get(`/api/timeline?limit=2&cursor=${page1.body.data.nextCursor}`)
      .set("Authorization", `Bearer ${reader.token}`);
    expect(page2.body.data.posts).toHaveLength(2);
    expect(page2.body.data.posts[0].title).toBe("Post 3");
  });

  it("returns 400 for invalid cursor", async () => {
    const res = await request(app)
      .get("/api/timeline?cursor=notavalidid")
      .set("Authorization", `Bearer ${reader.token}`);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("respects limit parameter", async () => {
    for (let i = 1; i <= 5; i++) {
      await createPost(author.token, `Post ${i}`, `Body ${i}`);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    const res = await request(app)
      .get("/api/timeline?limit=3")
      .set("Authorization", `Bearer ${reader.token}`);
    expect(res.body.data.posts).toHaveLength(3);
  });
});
