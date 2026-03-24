TDD mode. Do this in strict order. Do NOT skip steps.

## Step 1 — Scenario discovery (do this first, nothing else)

Read the current phase from prompt_plan.md and spec.md.

List ALL test scenarios as a numbered checklist. Group them:

### Happy path
- [ ] [scenario description — what input, what expected output]

### Edge cases
- [ ] [boundary conditions, empty inputs, min/max values]

### Error cases
- [ ] [invalid input, missing fields, wrong types, constraint violations]

### Integration
- [ ] [DB not found, DB down, downstream failures]

Print exactly this after the list:
"--- SCENARIO REVIEW ---
Add scenarios with: /tdd add [description]
Remove scenarios with: /tdd remove [number]
When ready, type: /tdd confirm"

STOP. Do not write any code or tests yet. Wait for my response.

---

## Step 2 — Only runs after I type "/tdd confirm"

Write ALL failing tests now, before any implementation exists.

Rules:
- Every scenario from the confirmed list gets exactly one test
- Tests must FAIL when you run them (no implementation exists yet)
- Test names must match the scenario description exactly
- For FastAPI routes: use pytest + httpx AsyncClient
- For Next.js components: use Vitest + Testing Library
- Run the tests after writing them and confirm they all fail
- Print the failure output as proof

File locations:
- Backend tests: tests/unit/ and tests/integration/
- Frontend tests: frontend/__tests__/

Print exactly this after:
"--- TESTS WRITTEN AND FAILING ---
[paste first 3 lines of failure output]
Ready to implement. Type: /build"

STOP. Do not write implementation code yet.

---

## Step 3 — Only runs after I type "/build"

Implement the minimum code to make every test pass.

Rules:
- Write only what is needed to pass the tests — no extra logic
- After each function/route is implemented, run tests immediately
- If a test passes that wasn't supposed to yet, stop and tell me
- When ALL tests pass, run the full test suite one final time
- Print: "All N tests passing. Implementation complete."

Then run /commit automatically.