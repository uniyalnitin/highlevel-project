# Prompt Plan: Social Networking Platform Backend

> Sequenced prompts to feed Claude. Execute in order. Tests come BEFORE implementation.

## Feature: Social Networking Platform (Users, Posts, Follow, Timeline)

### Phase 1 — Service tests (RED)
```
Read the spec in .claude/workflows/current-spec.md.
Error classes already exist (AppError, NotFoundError, ValidationError, ConflictError, UnauthorizedError).

Write ALL service test files:
- backend/src/__tests__/authService.test.js
  - register: happy path returns userId + token
  - register: duplicate handle → ConflictError
  - register: name < 3 chars → ValidationError
  - login: happy path returns userId + token
  - login: wrong password → UnauthorizedError
  - login: non-existent handle → NotFoundError

- backend/src/__tests__/postService.test.js
  - create: happy path returns postId
  - create: title > 20 chars → ValidationError
  - create: body > 300 chars → ValidationError
  - create: invalid userId → NotFoundError
  - delete: happy path
  - delete: non-existent post → NotFoundError
  - delete: not the author → UnauthorizedError

- backend/src/__tests__/followService.test.js
  - follow: happy path
  - follow: self-follow → ValidationError
  - follow: duplicate follow → ConflictError
  - follow: target user doesn't exist → NotFoundError
  - unfollow: happy path
  - unfollow: not following → NotFoundError

- backend/src/__tests__/timelineService.test.js
  - happy path: returns posts from followed users, newest first
  - empty follows: returns empty array
  - cursor pagination: returns correct page, nextCursor
  - cursor pagination: last page has nextCursor = null
  - includes authorHandle in each post
  - does not include posts from unfollowed users

Do NOT write any services, models, or routes yet.
Run npm test — all new tests should FAIL.
```

### Phase 2 — Route/integration tests (RED)
```
Write integration tests for all API endpoints:
- backend/src/__tests__/auth.routes.test.js
  - POST /api/users: happy path 201
  - POST /api/users: duplicate handle 409
  - POST /api/users: name too short (< 3 chars) 400
  - POST /api/users: missing fields 400
  - POST /api/auth/login: happy path 200
  - POST /api/auth/login: wrong password 401
  - POST /api/auth/login: non-existent handle 404

- backend/src/__tests__/posts.routes.test.js
  - POST /api/posts: happy path 201
  - POST /api/posts: no auth 401
  - POST /api/posts: expired/invalid token 401
  - POST /api/posts: title too long 400
  - DELETE /api/posts/:postId: happy path 200
  - DELETE /api/posts/:postId: no auth 401
  - DELETE /api/posts/:postId: not author 401
  - DELETE /api/posts/:postId: not found 404

- backend/src/__tests__/follow.routes.test.js
  - POST /api/users/:userId/follow: happy path 200
  - POST /api/users/:userId/follow: no auth 401
  - POST /api/users/:userId/follow: self-follow 400
  - POST /api/users/:userId/follow: duplicate 409
  - DELETE /api/users/:userId/follow: happy path 200
  - DELETE /api/users/:userId/follow: no auth 401
  - DELETE /api/users/:userId/follow: not following 404

- backend/src/__tests__/timeline.routes.test.js
  - GET /api/timeline: happy path 200, correct shape
  - GET /api/timeline: no auth 401
  - GET /api/timeline: empty follows returns empty array
  - GET /api/timeline: cursor pagination works
  - GET /api/timeline: invalid cursor 400
  - GET /api/timeline: respects limit param

Test all response shapes: { success: true/false, data/error: ... }
Do NOT write any routes or services yet.
Run npm test — all new tests should FAIL.
Show tests for user review.
```

> **GATE: Nitin reviews and approves all tests before proceeding.**

### Phase 3 — Models (GREEN — partial)
```
Create Mongoose models:
- backend/src/models/User.js
  - Fields: name, handle, dob, password (per spec)
  - toJSON override: exclude password
  - Index: { handle: 1 } unique

- backend/src/models/Post.js
  - Fields: title, body, author (ref: User)
  - Index: { author: 1, createdAt: -1 }

- backend/src/models/Follow.js
  - Fields: follower (ref: User), following (ref: User)
  - Compound unique index: { follower: 1, following: 1 }
  - Index: { following: 1 }

Only schemas — no business logic in models.
timestamps: true on all.
```

### Phase 4 — Services (GREEN)
```
Create service files:
- backend/src/services/authService.js
  - register(name, handle, password) → { userId, token }
  - login(handle, password) → { userId, token }

- backend/src/services/postService.js
  - createPost(userId, title, body) → { postId }
  - deletePost(userId, postId) → void

- backend/src/services/followService.js
  - follow(followerId, followingId) → void
  - unfollow(followerId, followingId) → void

- backend/src/services/timelineService.js
  - getTimeline(userId, cursor, limit) → { posts, nextCursor }

Each function: receives plain data, returns data or throws typed errors.
No req/res references. Services import models internally.
Run npm test — service tests should now PASS.
```

### Phase 5 — Routes (GREEN)
```
Create route files:
- backend/src/routes/users.js — POST /api/users (register)
- backend/src/routes/auth.js — POST /api/auth/login
- backend/src/routes/posts.js — POST /api/posts, DELETE /api/posts/:postId
- backend/src/routes/follow.js — POST/DELETE /api/users/:userId/follow
- backend/src/routes/timeline.js — GET /api/timeline

Routes are THIN: parse req → call service → send res.json.
Apply auth middleware to protected routes.
Apply validation middleware where needed.
Register all in routes/index.js.
Run npm test — ALL tests should PASS.
```

### Phase 6 — Refactor + SOLID Review
```
Review all code against SOLID principles in CLAUDE.md:
- S: Is each file doing one thing?
- O: Can we extend without modifying existing files?
- L: Do all errors behave consistently?
- I: Are imports minimal?
- D: Do routes depend on services, not models?
Fix any violations. Run npm test — must still pass (GREEN).
```
