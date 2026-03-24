Run a full-stack verification of the project. Execute these steps in order, stop on failure.

Set `SKILL_DIR=.claude/skills/playwright-skill`

## 1. Docker + MongoDB
```bash
docker-compose up -d
```
Wait for healthy: `docker-compose ps`. Retry once if unhealthy.

## 2. Install Dependencies
```bash
cd backend && npm install && cd ../frontend && npm install && cd ..
```

## 3. Start Backend
```bash
cd backend && npm run dev &
```
Wait 5s, then verify: `curl -s http://localhost:5000/api/health` returns `"success": true`.

## 4. Unit Tests
```bash
cd backend && npm test
```

## 5. API Endpoints (curl)
Test every registered route. Save JWT from login for authenticated endpoints.
```bash
# Health
curl -s http://localhost:5000/api/health

# Register + Login
curl -s -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Verify","email":"verify@test.com","password":"test123"}'
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"verify@test.com","password":"test123"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")

# Authenticated: me, users, posts, feed, friends
curl -s http://localhost:5000/api/auth/me -H "Authorization: Bearer $TOKEN"
curl -s "http://localhost:5000/api/users?search=Verify" -H "Authorization: Bearer $TOKEN"
curl -s -X POST http://localhost:5000/api/posts -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"content":"verify post"}'
curl -s http://localhost:5000/api/posts/feed -H "Authorization: Bearer $TOKEN"

# 404
curl -s http://localhost:5000/api/nonexistent
```

## 6. Start Frontend
```bash
cd frontend && npm run dev &
```
Wait 10s. Verify: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` returns 200.

## 7. Playwright Visual Check
```bash
cd $SKILL_DIR && npm run setup 2>/dev/null
```

Write `/tmp/playwright-verify.js` that opens `http://localhost:3000`, navigates landing → register → feed → friends → profile, takes a screenshot at each step to `/tmp/verify-*.png`, reports pass/fail per page.

```bash
cd $SKILL_DIR && node run.js /tmp/playwright-verify.js
```

Read the screenshots to confirm UI renders correctly.

## 8. Cleanup
```bash
kill %1 %2 2>/dev/null
```

## 9. Report
Print a table with pass/fail for each step and an overall result.
