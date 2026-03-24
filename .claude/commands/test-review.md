Write test cases based on the approved spec. Do NOT write any implementation code.

## Step 1 — Read context

Read these files:
- `CLAUDE.md` for conventions, TDD rules, and SOLID structure
- `.claude/skills/testing.md` for test patterns
- `.claude/skills/api-design.md` for expected service/route shapes
- `.claude/workflows/current-spec.md` for the approved spec

## Step 2 — Create error classes (if they don't exist)

Before writing tests, ensure the error infrastructure exists:
- `backend/src/errors/AppError.js` — base class
- Any typed errors needed (NotFoundError, ValidationError, etc.)

These are tested implicitly — don't write separate tests for them.

## Step 3 — Write service tests

For each service defined in the spec, create test files in `backend/src/__tests__/`:

Test the BUSINESS LOGIC layer, not the HTTP layer. Services are where the real logic lives.

```
describe("[ServiceName]", () => {
  describe("create", () => {
    it("should create with valid data")
    it("should throw ValidationError with missing required fields")
    it("should throw ConflictError for duplicates (if applicable)")
  })
  describe("getById", () => {
    it("should return item when exists")
    it("should throw NotFoundError when not found")
  })
  // ... etc for each method in the spec
})
```

Cover:
- Happy path for every service method
- Validation errors (missing fields, wrong types)
- Not found cases
- Authorization/ownership checks (if applicable)
- Edge cases from the spec
- Relationship integrity (if applicable)

## Step 4 — Write route/integration tests

Test the HTTP layer: status codes, response shapes, middleware behavior.

```
describe("POST /api/resource", () => {
  it("should return 201 with created object")
  it("should return 400 for missing required fields")
  it("should return 401 without auth token (if protected)")
})
```

## Step 5 — Present for review

Show ALL test files to the user in full. For each test file, explain:
- What it tests (which service/route)
- How many tests (happy paths vs error cases)
- Any edge cases covered

Then ask:
"Here are the test cases. Review them and let me know:
- Any tests to add?
- Any tests to remove?
- Any edge cases I missed?
- Should I adjust any expected behavior?

Once you approve, I'll run them (they should all FAIL since there's no implementation yet), then write the code to make them pass."

## Step 6 — Wait for approval

Do NOT proceed until the user explicitly approves. If they suggest changes, update the tests and show again.

After approval:
1. Run `cd backend && npm test` — confirm all tests FAIL (Red phase)
2. Show the failure count: "X tests failing as expected. Ready to implement."
3. Say: "Tests approved and failing. I'll now implement the minimum code to make each test pass, following SOLID principles. Starting with [first service]."

Then begin implementation following the current-plan.md prompt sequence.
