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

describe("POST /api/users/:userId/follow", () => {
  let userA, userB;

  beforeEach(async () => {
    userA = await registerAndLogin("UserAAA", "usera");
    userB = await registerAndLogin("UserBBB", "userb");
  });

  it("returns 200 when following another user", async () => {
    const res = await request(app)
      .post(`/api/users/${userB.userId}/follow`)
      .set("Authorization", `Bearer ${userA.token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeNull();
  });

  it("returns 401 when no auth token is provided", async () => {
    const res = await request(app).post(`/api/users/${userB.userId}/follow`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for self-follow", async () => {
    const res = await request(app)
      .post(`/api/users/${userA.userId}/follow`)
      .set("Authorization", `Bearer ${userA.token}`);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 409 for duplicate follow", async () => {
    await request(app)
      .post(`/api/users/${userB.userId}/follow`)
      .set("Authorization", `Bearer ${userA.token}`);
    const res = await request(app)
      .post(`/api/users/${userB.userId}/follow`)
      .set("Authorization", `Bearer ${userA.token}`);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe("DELETE /api/users/:userId/follow", () => {
  let userA, userB;

  beforeEach(async () => {
    userA = await registerAndLogin("UserAAA", "usera");
    userB = await registerAndLogin("UserBBB", "userb");
  });

  it("returns 200 when unfollowing a followed user", async () => {
    await request(app)
      .post(`/api/users/${userB.userId}/follow`)
      .set("Authorization", `Bearer ${userA.token}`);
    const res = await request(app)
      .delete(`/api/users/${userB.userId}/follow`)
      .set("Authorization", `Bearer ${userA.token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeNull();
  });

  it("returns 401 when no auth token is provided", async () => {
    const res = await request(app).delete(`/api/users/${userB.userId}/follow`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 when not following the user", async () => {
    const res = await request(app)
      .delete(`/api/users/${userB.userId}/follow`)
      .set("Authorization", `Bearer ${userA.token}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
