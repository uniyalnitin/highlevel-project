The user wants to build: $ARGUMENTS

Your job is to gather enough information to write a precise spec. Do NOT create any files or write any code or tests yet.

## Phase 1 — Understand

Read CLAUDE.md and the files in `.claude/skills/` to understand the stack, conventions, TDD workflow, and SOLID principles.

Then analyze `$ARGUMENTS`:
- What is clearly defined (entities, actions, endpoints)?
- What is ambiguous or missing (field types, relationships, validation rules, auth, edge cases)?

## Phase 2 — Discuss

Before writing anything, have a conversation with the user. Ask ONE question at a time. Maximum 5 questions. Wait for each answer.

Focus on gaps that would change the data model, API shape, or business rules:
- What fields does [entity] need? Which are required?
- Does [entity] belong to a user, or is it global?
- Are there relationships to existing models?
- What should happen when [edge case]?
- Is authentication required?
- What validation rules apply?

Stop when you have enough. Don't over-ask.

## Phase 3 — Draft spec for review

Create all three workflow files:

1. `.claude/workflows/current-spec.md` — from `.claude/workflows/spec.md` template
   Fill in: problem, data model, API endpoints, edge cases, success criteria.
   Include a **SOLID Mapping** section:
   - Which service files will be created (Single Responsibility)
   - How middleware will be composed (Open/Closed)
   - What error types are needed (Liskov)

2. `.claude/workflows/current-plan.md` — from `.claude/workflows/prompt_plan.md` template
   Replace all placeholders. The plan MUST follow TDD order: tests first, then implementation.

3. `.claude/workflows/current-todo.md` — from `.claude/workflows/todo.md` template
   Customize for this feature. Tests come before implementation in the checklist.

## Phase 4 — Refine

Show the completed spec, plan, and todo to the user. Ask:
"Here's the spec. What would you change? We can refine the model, endpoints, edge cases, or the prompt sequence before moving forward."

Iterate until the user says it's good. Only then say:
"Spec approved. Next step: run `/test-review` and I'll write the test cases for your approval before any implementation begins."

Do NOT write any code or tests. The next step is `/test-review`.
