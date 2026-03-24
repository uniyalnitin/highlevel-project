# Prompt Plan — Social Platform

> Sequenced prompts to feed Claude. Execute these in order, one at a time.
> Each prompt builds on the previous — don't skip steps.

## Prompt 1 — Domain Errors + Auth Middleware
```
Read the spec in .claude/workflows/current-spec.md.
Create backend/src/errors/index.js with AppError, NotFoundError, ValidationError, ConflictError, ForbiddenError, UnauthorizedError.
Create backend/src/middleware/auth.js — JWT verification middleware that extracts user from token and attaches to req.user.
Add JWT_SECRET and JWT_EXPIRES_IN to .env.example.
Do NOT create models or routes yet.
```

## Prompt 2 — User Model + Auth Routes
```
Create backend/src/models/User.js (name, email, password, bio, timestamps).
Create backend/src/services/authService.js (signup, login, getMe). Hash passwords with bcrypt. Generate JWT on signup/login.
Create backend/src/routes/auth.js (POST /signup, POST /login, GET /me).
Register in routes/index.js at /auth.
Test all three with curl.
```

## Prompt 3 — User Routes
```
Create backend/src/services/userService.js (getById, update).
Create backend/src/routes/users.js (GET /:id, PUT /:id — only own profile).
Register in routes/index.js at /users.
Test with curl.
```

## Prompt 4 — FriendRequest Model + Routes
```
Create backend/src/models/FriendRequest.js (from, to, status, compound unique index, timestamps).
Create backend/src/services/friendService.js (sendRequest, respondToRequest, unfriend, listFriends, listPendingRequests, getFriendIds helper).
Create backend/src/routes/friends.js (POST /request, PUT /request/:id, DELETE /:id, GET /, GET /requests).
Register in routes/index.js at /friends.
Test all with curl using two different JWT tokens.
```

## Prompt 5 — Post Model + Routes
```
Create backend/src/models/Post.js (author, content, timestamps).
Create backend/src/services/postService.js (create, getById, update, remove — ownership checks).
Create backend/src/routes/posts.js (POST /, GET /:id, PUT /:id, DELETE /:id).
Register in routes/index.js at /posts.
Test with curl.
```

## Prompt 6 — Feed
```
Create backend/src/services/feedService.js (getFeed — query posts where author is in friend list, paginated, newest first, populate author name).
Create backend/src/routes/feed.js (GET / with ?page&limit query params).
Register in routes/index.js at /feed.
Test with curl — create two users, make them friends, create posts, verify feed.
```

## Prompt 7 — Like Model + Routes
```
Create backend/src/models/Like.js (user, post, compound unique index, timestamps).
Create backend/src/services/likeService.js (like, unlike — with conflict/not-found handling).
Add like/unlike routes to backend/src/routes/posts.js (POST /:id/like, DELETE /:id/like).
Test with curl — like, duplicate like (409), unlike, unlike again (404).
```

## Prompt 8 — Comment Model + Routes
```
Create backend/src/models/Comment.js (author, post, parent, content, timestamps).
Create backend/src/services/commentService.js (addComment, getComments — grouped with replies, removeComment — cascade delete replies).
Validate: parent must be null or a top-level comment (parent.parent === null). Reject deeper nesting.
Create backend/src/routes/comments.js (POST /posts/:postId/comments, GET /posts/:postId/comments, DELETE /comments/:id).
Register in routes/index.js.
Test with curl.
```

## Prompt 9 — Frontend: Auth Pages
```
Create frontend/app/auth/login/page.js and frontend/app/auth/signup/page.js.
"use client" forms that call the API and store JWT in localStorage.
Create a shared AuthContext provider for managing logged-in state.
Redirect to feed after login/signup.
```

## Prompt 10 — Frontend: Feed + Posts
```
Create frontend/app/feed/page.js — shows posts from friends.
Create a PostCard component (shows author, content, like count, comment count, like button).
Create a CreatePost component ("use client" form at top of feed).
Wire up like/unlike toggle.
```

## Prompt 11 — Frontend: Comments + Friends
```
Add comment section to post detail page frontend/app/posts/[id]/page.js.
Show comments with replies. Add comment form. Add reply form.
Create frontend/app/friends/page.js — list friends, pending requests, accept/reject UI.
Create a user search or profile page with "Add Friend" button.
```

## Prompt 12 — Tests
```
Write Jest + Supertest tests for ALL endpoints:
- Auth: signup, login, duplicate email, wrong password, protected route without token
- Friends: send request, duplicate, self-request, accept, reject, unfriend, list
- Posts: CRUD + ownership checks
- Feed: returns only friend posts, pagination
- Likes: like, duplicate, unlike, unlike non-existent
- Comments: create, reply, nested reply rejection, delete cascade
Run npm test and fix all failures.
```

## Prompt 13 — Polish
```
Review all code against CLAUDE.md conventions.
Ensure all responses use { success, data/error } format.
Ensure all catch blocks call next(err).
Ensure no hardcoded values.
Run full test suite. Confirm everything passes.
```
