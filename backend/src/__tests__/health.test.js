const request = require("supertest");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const app = require("../index");

beforeAll(async () => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
  console.log.mockRestore();
});

describe("GET /api/health", () => {
  it("returns 200 with success:true and status:ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
  });

  it("includes database connection status under data", async () => {
    const res = await request(app).get("/api/health");
    expect(["connected", "connecting"]).toContain(res.body.data.database);
  });

  it("includes uptime as a positive number under data", async () => {
    const res = await request(app).get("/api/health");
    expect(typeof res.body.data.uptime).toBe("number");
    expect(res.body.data.uptime).toBeGreaterThan(0);
  });

  it("includes a valid ISO 8601 timestamp under data", async () => {
    const res = await request(app).get("/api/health");
    const ts = res.body.data.timestamp;
    expect(new Date(ts).toISOString()).toBe(ts);
  });
});

describe("404 handler", () => {
  it("returns 404 with success:false for unknown routes", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
  });
});
