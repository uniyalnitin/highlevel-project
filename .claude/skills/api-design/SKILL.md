---
name: api-design
description: Quick-reference patterns for building Express + Mongoose REST APIs in this project using MVC with a service layer. Use this skill whenever adding a new model, creating CRUD routes, writing a service, or adding domain errors — even if the user just says "add a resource", "create an endpoint", or "I need a new model". Don't wait to be asked explicitly; if the task involves Express routes, services, or Mongoose schemas in this codebase, consult this skill first.
---

# API Design Patterns

MVC pattern with a service layer. Business logic lives in services — routes are HTTP-only controllers. Services throw typed domain errors; routes translate them to HTTP responses via error middleware.

This means the same service can be called from a Kafka consumer, a cron job, or any other non-HTTP context without modification.

## Directory Structure
```
backend/src/
  errors/index.js          ← domain error classes (no HTTP knowledge)
  models/Name.js           ← Mongoose schema
  services/nameService.js  ← business logic, throws domain errors
  routes/resource.js       ← HTTP controller: parse req → call service → format res
```

---

## Domain Errors
```javascript
// backend/src/errors/index.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

class NotFoundError extends AppError {
  constructor(message = "Not found") { super(message, 404); }
}

class ValidationError extends AppError {
  constructor(message) { super(message, 400); }
}

class ConflictError extends AppError {
  constructor(message) { super(message, 409); }
}

module.exports = { AppError, NotFoundError, ValidationError, ConflictError };
```

---

## New Model
```javascript
// backend/src/models/Name.js
const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  field: { type: String, required: true },
}, { timestamps: true });
module.exports = mongoose.model("Name", schema);
```

---

## Service Layer
Business logic only — no `req`, no `res`, no HTTP status codes here. Throw domain errors for all failure cases so any caller (HTTP, Kafka, cron) can handle them appropriately.

```javascript
// backend/src/services/nameService.js
const Model = require("../models/Name");
const { NotFoundError, ValidationError } = require("../errors");

async function getAll(filters = {}) {
  return Model.find(filters).sort({ createdAt: -1 });
}

async function getById(id) {
  const item = await Model.findById(id);
  if (!item) throw new NotFoundError("Name not found");
  return item;
}

async function create(data) {
  // validate business rules here, throw ValidationError if needed
  return Model.create(data);
}

async function update(id, data) {
  const item = await Model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!item) throw new NotFoundError("Name not found");
  return item;
}

async function remove(id) {
  const item = await Model.findByIdAndDelete(id);
  if (!item) throw new NotFoundError("Name not found");
  return item;
}

module.exports = { getAll, getById, create, update, remove };
```

---

## Route Controller (HTTP layer only)
Routes parse the request, call the service, and format the response. No Mongoose, no business logic here.

```javascript
// backend/src/routes/resource.js
const express = require("express");
const router = express.Router();
const service = require("../services/nameService");

router.get("/", async (req, res, next) => {
  try {
    const items = await service.getAll();
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const item = await service.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await service.getById(req.params.id);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const item = await service.update(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true, data: null });
  } catch (err) { next(err); }
});

module.exports = router;
```

---

## Register Route
```javascript
// In backend/src/routes/index.js, add:
router.use("/resource", require("./resource"));
```

---

## Kafka Consumer Example
Services are plain async functions — consumers call them directly and handle domain errors without HTTP concerns.

```javascript
// Example: Kafka consumer calling the same service
const service = require("../services/nameService");
const { NotFoundError, ValidationError } = require("../errors");

async function handleMessage(message) {
  try {
    const data = JSON.parse(message.value);
    await service.create(data);
  } catch (err) {
    if (err instanceof ValidationError) {
      // bad data — send to DLQ, don't retry
    } else if (err instanceof NotFoundError) {
      // expected miss — log and skip
    } else {
      throw err; // unexpected — let the consumer retry
    }
  }
}
```

---

## Common Service Patterns
```javascript
// Pagination
async function getAll({ page = 1, limit = 10 } = {}) {
  const [items, total] = await Promise.all([
    Model.find().skip((page - 1) * limit).limit(limit),
    Model.countDocuments(),
  ]);
  return { items, total, page, limit };
}

// Populate references
const items = await Model.find().populate("userId");

// Filter + sort
const items = await Model.find({ status: "active" }).sort({ createdAt: -1 });
```
