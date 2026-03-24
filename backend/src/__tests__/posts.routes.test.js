const request = require("supertest");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const app = require("../index");

let token;
let userId;

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

async function registerAndLogin(name = "PostUser", handle = "postuser") {
  const res = await request(app)
    .post("/api/users")
    .send({ name, handle, password: "password123" });
  return { token: res.body.data.token, userId: res.body.data.userId };
}

describe("POST /api/posts", () => {
  beforeEach(async () => {
    const auth = await registerAndLogin();
    token = auth.token;
    userId = auth.userId;
  });

  it("returns 201 with postId for valid post", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My Title", body: "My post body" });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("postId");
  });

  it("returns 401 when no auth token is provided", async () => {
    const res = await request(app)
      .post("/api/posts")
      .send({ title: "My Title", body: "My post body" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for expired or invalid token", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", "Bearer invalidtoken123")
      .send({ title: "My Title", body: "My post body" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for title longer than 20 characters", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "A".repeat(21), body: "Valid body" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("DELETE /api/posts/:postId", () => {
  let postId;

  beforeEach(async () => {
    const auth = await registerAndLogin();
    token = auth.token;
    userId = auth.userId;

    const postRes = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "To Delete", body: "Body" });
    postId = postRes.body.data.postId;
  });

  it("returns 200 when author deletes own post", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeNull();
  });

  it("returns 401 when no auth token is provided", async () => {
    const res = await request(app).delete(`/api/posts/${postId}`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 when not the author", async () => {
    const other = await registerAndLogin("OtherUsr", "otheruser");
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${other.token}`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 for non-existent post", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/posts/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
