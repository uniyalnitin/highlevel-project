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

describe("POST /api/users", () => {
  const validUser = { name: "TestUser", handle: "testhandle", password: "password123" };

  it("returns 201 with userId and token for valid registration", async () => {
    const res = await request(app).post("/api/users").send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("userId");
    expect(res.body.data).toHaveProperty("token");
  });

  it("returns 409 for duplicate handle", async () => {
    await request(app).post("/api/users").send(validUser);
    const res = await request(app).post("/api/users").send({ ...validUser, name: "Other" });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
  });

  it("returns 400 for name shorter than 3 characters", async () => {
    const res = await request(app).post("/api/users").send({ ...validUser, name: "Ab" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for missing required fields", async () => {
    const res = await request(app).post("/api/users").send({ name: "Test" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app)
      .post("/api/users")
      .send({ name: "LoginUser", handle: "loginuser", password: "password123" });
  });

  it("returns 200 with userId and token for valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ handle: "loginuser", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("userId");
    expect(res.body.data).toHaveProperty("token");
  });

  it("returns 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ handle: "loginuser", password: "wrongpass" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 for non-existent handle", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ handle: "noexist", password: "password123" });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
