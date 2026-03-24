# Task Tracker: Social Networking Platform Backend

## Setup
- [x] Spec discussed and approved
- [x] Prompt plan ready
- [x] Error classes exist (AppError, NotFoundError, ValidationError, ConflictError, UnauthorizedError)

## Tests (RED phase — write before implementation)
- [x] Auth service tests written (register + login)
- [x] Post service tests written (create + delete)
- [x] Follow service tests written (follow + unfollow)
- [x] Timeline service tests written (feed + pagination)
- [x] Auth route integration tests written
- [x] Post route integration tests written
- [x] Follow route integration tests written
- [x] Timeline route integration tests written
- [x] All edge case tests written
- [x] **Nitin has reviewed and approved all tests**
- [x] All tests run and FAIL (confirmed red)

## Models (partial GREEN)
- [x] User model (name, handle, password, toJSON excludes password)
- [x] Post model (title, body, author ref, compound index)
- [x] Follow model (follower, following, unique compound index)

## Services (GREEN phase)
- [x] authService.js (register, login)
- [x] postService.js (createPost, deletePost)
- [x] followService.js (follow, unfollow)
- [x] timelineService.js (getTimeline with cursor pagination)
- [x] Service tests PASS

## Routes (GREEN phase)
- [x] users.js route (POST /api/users)
- [x] auth.js route (POST /api/auth/login)
- [x] posts.js route (POST, DELETE)
- [x] follow.js route (POST, DELETE /api/users/:userId/follow)
- [x] timeline.js route (GET /api/timeline)
- [x] All routes registered in routes/index.js
- [x] All integration tests PASS
- [x] All tests green

## Refactor + SOLID Review
- [x] S: Every file has single responsibility
- [x] O: New features don't modify existing working code
- [x] L: All errors extend AppError consistently
- [x] I: No unnecessary imports
- [x] D: Routes -> services -> models (no shortcuts)
- [x] All tests still pass after refactor

## Ship
- [x] Code reviewed against CLAUDE.md
- [x] All tests pass
- [ ] Committed with descriptive message
