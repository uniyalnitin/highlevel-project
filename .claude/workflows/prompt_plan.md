# Prompt Plan Template (TDD)

> Sequenced prompts to feed Claude. Execute in order. Tests come BEFORE implementation.

## Feature: [name]

### Prompt 1 — Error classes + Service tests (RED)
```
Read the spec in .claude/workflows/current-spec.md.
Create error classes in backend/src/errors/ if they don't exist (AppError, NotFoundError, ValidationError).
Then write ALL service test files in backend/src/__tests__/.
Test business logic: happy paths, validation errors, not-found, edge cases.
Do NOT write any services or routes yet.
Run npm test — all tests should FAIL.
```

### Prompt 2 — Route/integration tests (RED)
```
Write integration tests for all API endpoints defined in the spec.
Test: status codes, response shapes { success, data/error }, auth middleware, 404s.
Do NOT write any routes or services yet.
Run npm test — all tests should FAIL.
Show me the test files for review.
```

> **GATE: User reviews and approves all tests before proceeding.**

### Prompt 3 — Model (GREEN — partial)
```
Create the Mongoose model in backend/src/models/[Name].js.
Only the schema — no business logic in the model.
Use timestamps: true. Add proper types and required fields.
Do NOT create routes or services yet.
```

### Prompt 4 — Service (GREEN)
```
Create backend/src/services/[name]Service.js with all business logic.
The service imports the model and exports pure functions.
Routes will call these — the service never touches req/res.
Each function: receives plain data, returns data or throws typed errors.
Run npm test — service tests should now PASS.
```

### Prompt 5 — Routes (GREEN)
```
Create backend/src/routes/[resource].js.
Routes are THIN: parse req → call service → send res.json.
Add validation middleware where needed.
Register in routes/index.js.
Run npm test — all tests should PASS.
Test each endpoint with curl.
```

### Prompt 6 — Frontend
```
Create Next.js pages at frontend/app/[resource]/.
Server component for listing (SSR), client components for forms (CSR).
Loading and error states.
Wire up to the backend API via the proxy.
```

### Prompt 7 — Refactor + SOLID review
```
Review all code against SOLID principles in CLAUDE.md:
- S: Is each file doing one thing?
- O: Can we extend without modifying?
- L: Do all errors behave consistently?
- I: Are imports minimal?
- D: Do routes depend on services, not models?
Fix any violations. Run npm test — must still pass (GREEN).
```
