# Task Tracker — Social Platform

## Setup
- [ ] Spec written and reviewed
- [ ] Prompt plan ready

## Backend — Errors + Auth Middleware
- [ ] Domain error classes (AppError, NotFound, Validation, Conflict, Forbidden, Unauthorized)
- [ ] JWT auth middleware
- [ ] .env.example updated with JWT_SECRET, JWT_EXPIRES_IN

## Backend — User Model + Auth
- [ ] User schema (name, email, password, bio, timestamps)
- [ ] authService (signup, login, getMe) with bcrypt + JWT
- [ ] Auth routes (POST /signup, POST /login, GET /me) — tested
- [ ] Registered in routes/index.js

## Backend — User Routes
- [ ] userService (getById, update)
- [ ] User routes (GET /:id, PUT /:id) — tested
- [ ] Registered in routes/index.js

## Backend — Friends
- [ ] FriendRequest schema (from, to, status, compound index)
- [ ] friendService (sendRequest, respond, unfriend, listFriends, listPending, getFriendIds)
- [ ] Friend routes (POST /request, PUT /request/:id, DELETE /:id, GET /, GET /requests) — tested
- [ ] Registered in routes/index.js

## Backend — Posts
- [ ] Post schema (author, content, timestamps)
- [ ] postService (create, getById, update, remove with ownership)
- [ ] Post routes (POST /, GET /:id, PUT /:id, DELETE /:id) — tested
- [ ] Registered in routes/index.js

## Backend — Feed
- [ ] feedService (getFeed — friend posts, paginated, newest first)
- [ ] Feed route (GET /feed) — tested
- [ ] Registered in routes/index.js

## Backend — Likes
- [ ] Like schema (user, post, compound unique index)
- [ ] likeService (like, unlike)
- [ ] Like routes on posts (POST /:id/like, DELETE /:id/like) — tested

## Backend — Comments
- [ ] Comment schema (author, post, parent, content)
- [ ] commentService (add, getComments with replies, remove with cascade)
- [ ] Nesting validation (reject reply-to-reply)
- [ ] Comment routes (POST, GET, DELETE) — tested
- [ ] Registered in routes/index.js

## Frontend — Auth
- [ ] Login page
- [ ] Signup page
- [ ] AuthContext provider (JWT in localStorage)
- [ ] Redirect to feed after auth

## Frontend — Feed + Posts
- [ ] Feed page (friend posts)
- [ ] PostCard component (author, content, likes, comments)
- [ ] CreatePost component
- [ ] Like/unlike toggle

## Frontend — Comments + Friends
- [ ] Post detail page with comments + replies
- [ ] Comment and reply forms
- [ ] Friends page (list, pending requests, accept/reject)
- [ ] Add Friend UI

## Tests
- [ ] Auth tests (signup, login, duplicate, wrong password, no token)
- [ ] Friend tests (send, duplicate, self, accept, reject, unfriend, list)
- [ ] Post tests (CRUD + ownership)
- [ ] Feed tests (friend-only, pagination)
- [ ] Like tests (like, duplicate, unlike, unlike non-existent)
- [ ] Comment tests (create, reply, deep nesting reject, delete cascade)
- [ ] Full suite green

## Ship
- [ ] Code reviewed against CLAUDE.md
- [ ] All tests pass
- [ ] Committed with descriptive message
- [ ] Mistakes (if any) added to CLAUDE.md
