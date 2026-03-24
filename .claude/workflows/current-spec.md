# Feature Spec — Social Platform

## Problem
Build a social platform where users can register, connect as friends, share text posts, like posts, and comment on posts. The feed shows posts only from accepted friends.

## Requirements
- [ ] JWT-based authentication (signup, login)
- [ ] User profiles with basic info
- [ ] Bidirectional friend system (send request, accept, reject, unfriend)
- [ ] Text-only posts (CRUD)
- [ ] Like/unlike posts
- [ ] Comments on posts (flat) with one-level replies to comments
- [ ] Friend-only feed endpoint with pagination

## Data Model

```
User {
  name:       String (required)
  email:      String (required, unique)
  password:   String (required, hashed via bcrypt)
  bio:        String (optional)
  timestamps: true
}

FriendRequest {
  from:       ObjectId -> User (required)
  to:         ObjectId -> User (required)
  status:     String enum ["pending", "accepted", "rejected"] (required, default: "pending")
  timestamps: true
  unique:     compound index on [from, to]
}

Post {
  author:     ObjectId -> User (required)
  content:    String (required, maxlength: 2000)
  timestamps: true
}

Like {
  user:       ObjectId -> User (required)
  post:       ObjectId -> Post (required)
  timestamps: true
  unique:     compound index on [user, post]
}

Comment {
  author:     ObjectId -> User (required)
  post:       ObjectId -> Post (required)
  parent:     ObjectId -> Comment (optional, null = top-level comment)
  content:    String (required, maxlength: 1000)
  timestamps: true
}
```

### Relationship Rules
- FriendRequest: A user cannot send a request to themselves. Only one active request between any two users (regardless of direction).
- Like: A user can like a post only once (enforced by compound unique index).
- Comment: `parent` must be a top-level comment (parent.parent === null) — no deeper nesting.

## API Endpoints

### Auth
| Method | Path              | Description             | Auth |
|--------|-------------------|-------------------------|------|
| POST   | /api/auth/signup  | Register new user       | No   |
| POST   | /api/auth/login   | Login, returns JWT      | No   |
| GET    | /api/auth/me      | Get current user profile| Yes  |

### Users
| Method | Path              | Description             | Auth |
|--------|-------------------|-------------------------|------|
| GET    | /api/users/:id    | Get user public profile | Yes  |
| PUT    | /api/users/:id    | Update own profile      | Yes  |

### Friends
| Method | Path                          | Description                    | Auth |
|--------|-------------------------------|--------------------------------|------|
| POST   | /api/friends/request          | Send friend request            | Yes  |
| PUT    | /api/friends/request/:id      | Accept or reject request       | Yes  |
| DELETE | /api/friends/:id              | Unfriend a user                | Yes  |
| GET    | /api/friends                  | List current user's friends    | Yes  |
| GET    | /api/friends/requests         | List pending requests (incoming)| Yes |

### Posts
| Method | Path              | Description              | Auth |
|--------|-------------------|--------------------------|------|
| POST   | /api/posts        | Create a post            | Yes  |
| GET    | /api/posts/:id    | Get single post (with like count, comments) | Yes |
| PUT    | /api/posts/:id    | Update own post          | Yes  |
| DELETE | /api/posts/:id    | Delete own post          | Yes  |

### Feed
| Method | Path              | Description                        | Auth |
|--------|-------------------|------------------------------------|------|
| GET    | /api/feed         | Posts from friends, paginated, newest first | Yes |

### Likes
| Method | Path                    | Description        | Auth |
|--------|-------------------------|--------------------|------|
| POST   | /api/posts/:id/like     | Like a post        | Yes  |
| DELETE | /api/posts/:id/like     | Unlike a post      | Yes  |

### Comments
| Method | Path                          | Description              | Auth |
|--------|-------------------------------|--------------------------|------|
| POST   | /api/posts/:postId/comments   | Add comment or reply     | Yes  |
| GET    | /api/posts/:postId/comments   | List comments with replies| Yes |
| DELETE | /api/comments/:id             | Delete own comment       | Yes  |

## Request/Response Shapes

### Auth
```
POST /api/auth/signup
Body: { name, email, password }
Res:  { success: true, data: { token, user: { _id, name, email, bio } } }

POST /api/auth/login
Body: { email, password }
Res:  { success: true, data: { token, user: { _id, name, email, bio } } }
```

### Friends
```
POST /api/friends/request
Body: { to: userId }
Res:  { success: true, data: friendRequest }

PUT /api/friends/request/:id
Body: { status: "accepted" | "rejected" }
Res:  { success: true, data: friendRequest }
```

### Feed
```
GET /api/feed?page=1&limit=20
Res: { success: true, data: { posts: [...], total, page, limit } }
Each post includes: author (populated name), content, likeCount, commentCount, createdAt
```

### Comments
```
POST /api/posts/:postId/comments
Body: { content, parent?: commentId }
Res:  { success: true, data: comment }

GET /api/posts/:postId/comments
Res:  { success: true, data: [{ ...comment, replies: [...] }] }
Top-level comments with nested replies array.
```

## Edge Cases
- Signup with duplicate email → 409 Conflict
- Login with wrong password → 401 Unauthorized
- Friend request to self → 400 Validation Error
- Duplicate friend request (either direction) → 409 Conflict
- Accept/reject request not addressed to current user → 403 Forbidden
- Update/delete post not owned by current user → 403 Forbidden
- Like a post already liked → 409 Conflict
- Unlike a post not liked → 404 Not Found
- Reply to a reply (nesting > 1 level) → 400 Validation Error
- Delete comment that has replies → cascade delete replies
- Invalid/expired JWT → 401 Unauthorized
- Malformed ObjectId in params → 400 Validation Error

## Success Criteria
- All endpoints return `{ success: true/false, data/error }` format
- JWT protects all endpoints except signup/login
- Friend-only feed returns correct posts with pagination
- Comments support exactly one level of nesting
- Like uniqueness enforced at DB level
- All happy paths and edge cases covered by tests
- No hardcoded values — all config from .env
