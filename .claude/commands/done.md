Wrap up the current feature completely.

## 1. Backend Tests
Run `cd backend && npm test` — fix any failures before proceeding.

## 2. Convention Review
Review all changed files against CLAUDE.md:
- Response format: { success, data/error }
- Error handling: try/catch + next(err)
- No hardcoded values
- timestamps: true on all schemas
- SOLID: routes → services → models (no shortcuts)

## 3. Visual Verification with Playwright
Run the Playwright skill to visually verify the frontend works end-to-end.

Set SKILL_DIR to the playwright skill path in this project:
```
SKILL_DIR=.claude/skills/playwright-skill
```

**Step A — Detect servers:**
```bash
cd $SKILL_DIR && node -e "require('./lib/helpers').detectDevServers().then(s => console.log(JSON.stringify(s)))"
```

If no servers are running, inform the user and skip to step 4.

**Step B — Write a verification script to /tmp:**
Write `/tmp/playwright-verify-feature.js` that:
- Opens the app in a visible browser (`headless: false`)
- Navigates to the main pages affected by this feature
- Checks that key elements are visible (headings, forms, lists, buttons)
- Tests the primary user flow (e.g., create an item, see it in the list)
- Takes screenshots at each step to `/tmp/verify-*.png`
- Reports pass/fail for each check via console.log

**Step C — Execute:**
```bash
cd $SKILL_DIR && node run.js /tmp/playwright-verify-feature.js
```

**Step D — Review screenshots:**
Read the screenshot files and verify the UI looks correct.
If anything is broken, fix it and re-run before proceeding.

## 4. Ship
- Mark all items complete in `.claude/workflows/current-todo.md`
- Stage and commit with a descriptive conventional commit message
- If any mistakes were made, add them to the Mistakes Log in CLAUDE.md

## 5. Summary
Print: what was built, files changed, test results, visual verification results, mistakes learned.

## 6. Cleanup
Delete the current-*.md workflow files (keep the templates).
