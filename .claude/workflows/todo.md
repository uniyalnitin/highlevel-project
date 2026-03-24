# Task Tracker

> Granular checklist for the current feature. TDD order: tests → implement → refactor.

## Feature: [name]

### Setup
- [ ] Spec discussed and approved
- [ ] Prompt plan ready
- [ ] Error classes exist (AppError, NotFoundError, ValidationError)

### Tests (RED phase — write before implementation)
- [ ] Service tests written — all business logic covered
- [ ] Route/integration tests written — all endpoints covered
- [ ] Edge case tests written
- [ ] **User has reviewed and approved all tests**
- [ ] All tests run and FAIL (confirmed red)

### Model (partial GREEN)
- [ ] Schema created with proper types
- [ ] Required fields set
- [ ] timestamps: true added
- [ ] Indexes defined (if needed)

### Service (GREEN phase)
- [ ] Service file created with all business logic
- [ ] Each method: receives data, returns data or throws typed error
- [ ] No req/res references in service
- [ ] Service tests now PASS

### Routes (GREEN phase)
- [ ] Routes created — thin handlers calling services
- [ ] Validation middleware applied
- [ ] Registered in routes/index.js
- [ ] Route/integration tests now PASS
- [ ] All tests green

### Frontend
- [ ] List page renders (SSR)
- [ ] Create/edit forms work (CSR)
- [ ] Loading and error states
- [ ] Connected to API via proxy

### Refactor + SOLID Review
- [ ] S: Every file has single responsibility
- [ ] O: New features don't modify existing code
- [ ] L: All errors extend AppError consistently
- [ ] I: No unnecessary imports
- [ ] D: Routes → services → models (no shortcuts)
- [ ] All tests still pass after refactor

### Ship
- [ ] Code reviewed against CLAUDE.md
- [ ] All tests pass
- [ ] Committed with descriptive message
- [ ] Mistakes (if any) added to CLAUDE.md
