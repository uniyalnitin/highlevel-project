const mongoose = require("mongoose");
const connectDB = require("../config/db");

let authService;

beforeAll(async () => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  await connectDB();
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

describe("authService.register", () => {
  it("returns userId and token for valid input", async () => {
    const result = await authService.register("TestUser", "testhandle", "password123");
    expect(result).toHaveProperty("userId");
    expect(result).toHaveProperty("token");
    expect(typeof result.userId).toBe("string");
    expect(typeof result.token).toBe("string");
  });

  it("throws ConflictError for duplicate handle", async () => {
    await authService.register("UserOne", "duphandle", "password123");
    await expect(
      authService.register("UserTwo", "duphandle", "password456")
    ).rejects.toThrow(expect.objectContaining({ name: "ConflictError", statusCode: 409 }));
  });

});

describe("authService.login", () => {
  beforeEach(async () => {
    await authService.register("LoginUser", "loginhandle", "password123");
  });

  it("returns userId and token for valid credentials", async () => {
    const result = await authService.login("loginhandle", "password123");
    expect(result).toHaveProperty("userId");
    expect(result).toHaveProperty("token");
  });

  it("throws UnauthorizedError for wrong password", async () => {
    await expect(
      authService.login("loginhandle", "wrongpass")
    ).rejects.toThrow(expect.objectContaining({ name: "UnauthorizedError", statusCode: 401 }));
  });

  it("throws NotFoundError for non-existent handle", async () => {
    await expect(
      authService.login("noexist", "password123")
    ).rejects.toThrow(expect.objectContaining({ name: "NotFoundError", statusCode: 404 }));
  });
});
