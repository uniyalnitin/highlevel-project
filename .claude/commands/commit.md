Ship the current work and log any learnings.

1. Run `cd backend && npm test` — stop and fix if tests fail
2. Run `git add -A`
3. Write a conventional commit message based on the changes (feat: / fix: / refactor: / test: / docs:)
4. Run `git commit -m "<message>"`
5. Update `.claude/workflows/current-todo.md` — check off completed items
6. If any mistakes were made during this session, append them to the **Mistakes Log** section in `CLAUDE.md` using the format: `- [date] mistake → rule`

Report what was committed and what remains on the todo.
