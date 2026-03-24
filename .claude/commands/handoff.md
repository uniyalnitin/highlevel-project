Generate a handoff document so the next session can pick up exactly where this one left off.

Read the current state from:
- `CLAUDE.md` for project context
- `.claude/workflows/current-spec.md` for what is being built
- `.claude/workflows/current-todo.md` for progress
- `git log --oneline -10` for recent commits
- `git diff --stat` for uncommitted changes

Then write `.claude/workflows/handoff.md` with these sections:
- **What was done**: summary of completed work
- **What is left**: remaining items from the todo
- **Current state**: changed files, uncommitted work, blockers
- **How to continue**: next prompt from the plan, pending decisions
- **Context needed**: architectural decisions made, gotchas encountered

If there is uncommitted work, commit it first.
