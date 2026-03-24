Build mode. Execute the current phase from prompt_plan.md.

## Gate check — run this first

Read todo.md. Check if the current phase involves writing any logic code
(routes, services, models with methods, React components with state).

If YES → you must go through TDD first:
  Print: "This phase requires TDD. Run /tdd to list scenarios first."
  STOP. Do not proceed until I run /tdd and confirm scenarios.

If NO (pure config, env setup, static files, types only) → proceed directly.

---

## Build steps (only after TDD gate is cleared)

1. Read todo.md and identify the first unchecked phase.
2. Read the corresponding phase prompt from prompt_plan.md.
3. State in one sentence what you are about to do.
4. Implement it — write the code, create/update the files.
5. After writing, run the test suite: confirm all tests still pass.
6. Mark the todo.md checkboxes for this phase as done.
7. Print: "Phase [N] complete. [N passing] tests. Next: [Phase N+1 name]"

Rules:
- One phase per /build call. Do not bleed into the next phase.
- If you hit a blocker, stop and tell me. Do not improvise around it.
- Keep all code clean enough to be read on a screen-share.