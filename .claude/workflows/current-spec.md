# Feature Spec: Social Networking Platform Backend

## Problem
Build a backend service for a social networking platform where users can register, create/delete posts, follow/unfollow other users, and view a chronological timeline of posts from followed users. The solution must demonstrate scalability thinking (fan-out on read with cursor-based pagination).

## Requirements
- [x] User registration with validation (name, handle, password)
- [x] JWT authentication for all protected endpoints
- [x] Create and delete posts (only by post author)
- [x] Follow/unfollow users (no self-follow, no duplicate follows)
- [x] Timeline: pull model (fan-out on read), cursor-based pagination
- [x] All responses follow `{ success: true/false, data/error: ... }` format

## Data Model

### User
```
User {
  _id: ObjectId (auto — mapped to userId in responses)
  name: String (required, min 3 chars)
  handle: String (required, unique, trimmed, lowercase)
  password: String (required, bcrypt hashed, excluded from toJSON)
  timestamps: true
}
Indexes: { handle: 1 } (unique)
```

### Post
```
Post {
  _id: ObjectId (auto — mapped to postId in responses)
  title: String (required, max 20 chars)
  body: String (required, max 300 chars)
  author: ObjectId -> User (required, ref: "User")
  timestamps: true
}
Indexes: { author: 1, createdAt: -1 }  (timeline queries per user)
```

### Follow
```
Follow {
  _id: ObjectId (auto)
  follower: ObjectId -> User (required, ref: "User")
  following: ObjectId -> User (required, ref: "User")
  timestamps: true
}
Indexes:
  { follower: 1, following: 1 } (unique compound — prevents duplicates)
  { following: 1 }              (lookup "who follows user X")
```

## API Endpoints

### Auth (no JWT required)

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| POST | `/api/users` | Register a new user | `{ name, handle, password }` | `{ success: true, data: { userId, token } }` |
| POST | `/api/auth/login` | Login | `{ handle, password }` | `{ success: true, data: { userId, token } }` |

### Posts (JWT required)

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| POST | `/api/posts` | Create a post | `{ title, body }` — userId from JWT | `{ success: true, data: { postId } }` |
| DELETE | `/api/posts/:postId` | Delete own post | — userId from JWT | `{ success: true, data: null }` |

### Follow (JWT required)

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| POST | `/api/users/:userId/follow` | Follow a user | — followerId from JWT | `{ success: true, data: null }` |
| DELETE | `/api/users/:userId/follow` | Unfollow a user | — followerId from JWT | `{ success: true, data: null }` |

### Timeline (JWT required)

| Method | Path | Description | Query Params | Response |
|--------|------|-------------|--------------|----------|
| GET | `/api/timeline` | Posts from followed users, newest first | `cursor` (optional, postId), `limit` (default 10, max 50) | `{ success: true, data: { posts: [...], nextCursor } }` |

#### Timeline response shape:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "postId": "ObjectId",
        "title": "string",
        "body": "string",
        "authorId": "ObjectId",
        "authorHandle": "string",
        "createdAt": "ISO datetime"
      }
    ],
    "nextCursor": "ObjectId or null"
  }
}
```

### Timeline — Pull Model Implementation

1. Fetch the list of user IDs that the requesting user follows from the `Follow` collection.
2. Query `Post` where `author` is `$in` that list, sorted by `createdAt: -1`.
3. For cursor-based pagination: if `cursor` is provided, find the cursor post's `createdAt`, then query posts with `createdAt < cursorPost.createdAt` (or same `createdAt` and `_id < cursor`).
4. Limit to `limit + 1` to detect if there's a next page. If `limit + 1` results come back, pop the last one and set `nextCursor` to the last returned post's `_id`.
5. Populate `authorHandle` from the User collection via `populate` or `$lookup`.

#### Scaling Notes (HLD)
- **Current approach (fan-out on read):** Simple, write-cheap. Works well up to ~1000 followings per user with proper compound indexes.
- **Indexes are critical:** `Post { author: 1, createdAt: -1 }` enables efficient per-author scans. `Follow { follower: 1 }` enables fast following-list lookups.
- **Next scaling step:** If read latency grows, introduce a Redis-backed timeline cache (fan-out on write for normal users, fan-out on read for celebrity users with 100k+ followers — hybrid model).
- **Beyond MongoDB:** At true social-network scale, the follow graph moves to a graph database or adjacency-list service, and the timeline becomes a dedicated feed service with its own storage.

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Register with duplicate handle | 409 Conflict |
| Register with name < 3 chars | 400 Validation Error |
| Create post without auth | 401 Unauthorized |
| Delete post without auth | 401 Unauthorized |
| Post title > 20 chars | 400 Validation Error |
| Post body > 300 chars | 400 Validation Error |
| Follow without auth | 401 Unauthorized |
| Unfollow without auth | 401 Unauthorized |
| Follow yourself | 400 Validation Error |
| Follow same user twice | 409 Conflict |
| Unfollow user not followed | 404 Not Found |
| Delete someone else's post | 401 Unauthorized |
| Delete non-existent post | 404 Not Found |
| Timeline without auth | 401 Unauthorized |
| Timeline with no follows | 200 with empty posts array |
| Timeline cursor with invalid ID | 400 Validation Error |
| Any protected endpoint with expired token | 401 Unauthorized |

## Success Criteria
1. All tests pass (`docker-compose exec backend npm test`)
2. Every endpoint returns the correct status code and response shape
3. JWT auth enforced on all protected endpoints
4. Cursor-based pagination works correctly on timeline
5. No business logic in route handlers — all in services
6. Proper compound indexes on Follow and Post for scalability
7. Passwords never appear in any response or log

## SOLID Mapping

### Single Responsibility — Service Files
- `authService.js` — registration, login, password hashing, token generation
- `postService.js` — create post, delete post
- `followService.js` — follow, unfollow
- `timelineService.js` — fetch timeline with pagination

### Open/Closed — Middleware Composition
- `auth.js` — JWT verification (already exists)
- `validate.js` — required field validation (already exists, will be extended with field-specific validators)
- `errorHandler.js` — catches all AppError subclasses (already exists)

### Liskov — Error Types
- All error classes already exist: `AppError`, `NotFoundError`, `ValidationError`, `ConflictError`, `UnauthorizedError`
- All extend `AppError`, all caught uniformly by `errorHandler.js`

### Interface Segregation
- Routes import only the service functions they need
- Services receive plain data (not req/res objects)

### Dependency Inversion
- Routes depend on services (abstraction), never on Mongoose models directly
- Services import models internally
