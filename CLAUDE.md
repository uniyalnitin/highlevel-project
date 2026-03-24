# Project Brain — HighLevel Interview App

## Stack
- Backend: Node.js + Express 4 + Mongoose 8
- Frontend: Next.js 14 (App Router) + React 18
- Database: MongoDB 7 (Docker)
- Tests: Jest + Supertest

## Commands
```
docker-compose up -d              # Start everything (MongoDB + backend + frontend)
docker-compose up -d mongodb      # MongoDB only
docker-compose logs -f backend    # Stream backend logs
docker-compose logs -f frontend   # Stream frontend logs
docker-compose exec backend npm test  # Run Jest tests inside container
curl localhost:5000/api/health    # Health check
```

> All services run in Docker. Never run backend or frontend locally with npm run dev.
> Hot reload works via volume mounts — edit files locally, containers pick up changes.

## TDD Workflow (MANDATORY)

**The iron rule: tests are written BEFORE implementation. No exceptions.**

The development cycle for every feature is:

```
/spec  →  discuss & refine  →  /test-review  →  approve  →  implement to pass  →  /done
```

1. **Spec + Discuss**: Use `/spec` to define what to build. Claude asks clarifying questions — including what's in scope, what must not change (constraints), and what done looks like. You go back and forth until the spec, plan, and todo are solid. NO code or tests yet.
2. **Write Tests**: Claude writes all test cases based on the approved spec. Tests are shown to you for review via `/test-review`.
3. **Approve Tests**: You review the tests. Suggest changes, add edge cases, remove unnecessary ones. Claude updates. Only after your explicit approval does implementation begin.
4. **Red Phase**: Run the tests. They MUST all fail (red). If any test passes before implementation, the test is wrong — it's not testing new behavior.
5. **Green Phase**: Write the minimum code to make each test pass. No more, no less.
6. **Refactor Phase**: Clean up the code while keeping tests green. Apply SOLID principles.
7. **Ship**: Use `/done` only when all tests pass.

**NEVER write implementation code before tests exist and are approved.**
**NEVER write tests and implementation in the same step.**
**NEVER skip the user's test approval.**

## SOLID Principles (MANDATORY)

Every piece of code must follow SOLID. Claude must self-check before marking complete.

### S — Single Responsibility
- One model file = one entity
- One route file = one resource
- One service file = one domain's business logic
- Middleware does ONE thing (auth, validation, error handling — not mixed)
- Structure: `routes/` (HTTP layer) → `services/` (business logic) → `models/` (data)
- Routes NEVER contain business logic — they call services

### O — Open/Closed
- Use middleware chains for cross-cutting concerns (auth, validation, logging)
- New features = new files, not editing existing working code
- Extend via composition, not modification

### L — Liskov Substitution
- Error classes extend a base `AppError` — all behave consistently
- All services return the same shape or throw typed errors
- Middleware is interchangeable (swap auth strategies without changing routes)

### I — Interface Segregation
- Route files only import what they use
- Don't pass entire `req` to services — extract and pass only needed fields
- Keep model methods focused: don't add query helpers that only one route uses

### D — Dependency Inversion
- Routes depend on services (abstraction), not on Mongoose directly
- Services receive dependencies via parameters when needed for testability
- Config comes from `process.env`, never hardcoded

### Required Directory Structure (SOLID-enforced)
```
backend/src/
  index.js              # Entry point
  config/db.js          # DB connection
  models/               # Data layer — schemas only
  services/             # Business logic layer — one per domain
  routes/               # HTTP layer — thin, calls services
  middleware/
    errorHandler.js     # Base error handling
    auth.js             # JWT verification
    validate.js         # Request validation
  errors/
    index.js            # All typed error classes (AppError, NotFoundError, etc.)
```

## Conventions
- Models: PascalCase file = model name (`User.js` exports `User`)
- Services: camelCase file = domain (`userService.js` exports functions)
- Routes: kebab-case files, mount at `/api/<resource>` in `routes/index.js`
- Routes are THIN: parse request → call service → send response. That's it.
- Responses: always `{ success: true/false, data/error: ... }`
- Errors: throw typed error classes (AppError subclasses) — middleware catches
- Validation: in middleware or route handlers, NEVER in models or services
- Config: `.env` only — zero hardcoded values
- Schemas: always `{ timestamps: true }`

## Design Patterns (Reference)
When suggesting architecture, name the pattern and explain the fit:
- **Repository**: DB access abstracted behind a service interface — what `services/` implements. Routes never touch Mongoose directly.
- **Strategy**: Swappable behavior behind a common interface (e.g., multiple auth providers, pluggable sort/filter strategies). Use when behavior varies by type, not by if-else.
- **Factory**: Object creation logic extracted to one place (e.g., typed error constructors, test fixture builders). Eliminates scattered `new X()` calls with repeated args.
- **Adapter**: Wrap an external integration so the core app depends on the wrapper, not the third-party API. Swap the adapter when the vendor changes.
- **Dependency Injection**: Pass dependencies as parameters instead of importing them directly inside functions. Makes unit testing trivial — inject a mock instead of the real DB.

## Security Rules (MANDATORY)
- No secrets in code, logs, or API responses — ever
- `JWT_SECRET`, DB credentials, API keys → `.env` only; verify they are present at startup, crash fast if missing
- Passwords and tokens never appear in logs — no `req.body` dump, no `Authorization` header logging
- All user-supplied input is untrusted until explicitly validated at the API boundary
- Any model with a sensitive field (password hash, token, secret) **must** override `toJSON()` to exclude it
- CORS must be scoped to `CORS_ORIGIN` from `.env`; never `*` on authenticated routes

## Gotchas & Banned Patterns
- NEVER write implementation before tests are approved
- NEVER put business logic in route handlers — use services
- NEVER use `res.send()` — always `res.json()` with the response format
- NEVER forget `next(err)` in catch blocks
- NEVER hardcode `localhost:27017` — use `process.env.MONGODB_URI`
- NEVER skip error handling middleware registration (must be last)
- NEVER import models directly in routes — go through services
- NEVER mix concerns in a single function
- NEVER run backend or frontend outside Docker — use docker-compose
- NEVER log `req.body` wholesale, `Authorization` headers, passwords, or tokens
- NEVER leave `console.log` / debug statements in committed code
- NEVER leave unused imports or dead code in committed files
- NEVER use open CORS (`*`) — always scope to `process.env.CORS_ORIGIN`
- NEVER define a model with a sensitive field without excluding it in `toJSON()`
- NEVER do a big-bang refactor — one concern per change, keep diffs reviewable
- If using git: prefer separate commits for refactors vs features

## Verification Gates (before /done)
- Backend: `docker-compose exec backend npm test` — all tests green
- Frontend: `docker-compose exec frontend npm run build` — zero errors
- If a check cannot be run: state which check, why it was skipped, the risk, and the exact command for Nitin to run

## Mistakes Log
<!-- When Claude makes a mistake, add it here. This self-corrects over time. -->
<!-- Format: - [date] mistake description → rule to prevent it -->
