---
name: testing
description: Quick-reference patterns for writing Jest + Supertest integration tests in this project. Use this skill whenever writing, running, or debugging tests — including when the user asks to "add tests", "write a test for X", "make sure this works", or references Jest, Supertest, or test coverage. Also apply when scaffolding a new route, since every new route needs a corresponding test file following these patterns.
---

# Testing Patterns

Quick-reference patterns for writing Jest + Supertest tests in this project.

## Test File Template
```javascript
// backend/src/__tests__/resource.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const Model = require("../models/Name");

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(async () => {
  await mongoose.connection.close();
  console.log.mockRestore();
});

beforeEach(async () => {
  await Model.deleteMany({});
});

describe("POST /api/resource", () => {
  it("should create with valid data", async () => {
    const res = await request(app)
      .post("/api/resource")
      .send({ name: "Test" });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Test");
    expect(res.body.data._id).toBeDefined();
  });

  it("should fail with missing required fields", async () => {
    const res = await request(app)
      .post("/api/resource")
      .send({});
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/resource", () => {
  it("should return empty array initially", async () => {
    const res = await request(app).get("/api/resource");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("should return all items", async () => {
    await Model.create({ name: "A" });
    await Model.create({ name: "B" });
    const res = await request(app).get("/api/resource");
    expect(res.body.data).toHaveLength(2);
  });
});

describe("GET /api/resource/:id", () => {
  it("should return one item by ID", async () => {
    const item = await Model.create({ name: "Test" });
    const res = await request(app).get(`/api/resource/${item._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Test");
  });

  it("should return 404 for non-existent ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/resource/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/resource/:id", () => {
  it("should update an item", async () => {
    const item = await Model.create({ name: "Old" });
    const res = await request(app)
      .put(`/api/resource/${item._id}`)
      .send({ name: "New" });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("New");
  });
});

describe("DELETE /api/resource/:id", () => {
  it("should delete an item", async () => {
    const item = await Model.create({ name: "Test" });
    const res = await request(app).delete(`/api/resource/${item._id}`);
    expect(res.status).toBe(200);
    const check = await Model.findById(item._id);
    expect(check).toBeNull();
  });
});
```

## Running Tests
```bash
cd backend && npm test              # Run all
cd backend && npm test -- --watch   # Watch mode
cd backend && npm test -- resource  # Run specific file
```

## Curl Testing Cheat Sheet
```bash
# GET all
curl -s http://localhost:5000/api/resource | jq

# POST create
curl -s -X POST http://localhost:5000/api/resource \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}' | jq

# GET by ID
curl -s http://localhost:5000/api/resource/ID_HERE | jq

# PUT update
curl -s -X PUT http://localhost:5000/api/resource/ID_HERE \
  -H "Content-Type: application/json" \
  -d '{"name":"updated"}' | jq

# DELETE
curl -s -X DELETE http://localhost:5000/api/resource/ID_HERE | jq
```
