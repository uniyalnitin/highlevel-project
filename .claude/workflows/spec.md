# Feature Spec Template

> Fill this out before writing any code. This is the "what + why" document.

## Feature: [name]

### Problem
What problem does this solve? Who asked for it?

### Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Data Model
What entities are involved? What are their fields and relationships?

```
Entity {
  field: Type (required/optional)
  field: Type (required/optional)
  relation: -> OtherEntity
}
```

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET    | /api/resource | List all |
| POST   | /api/resource | Create one |
| GET    | /api/resource/:id | Get by ID |
| PUT    | /api/resource/:id | Update |
| DELETE | /api/resource/:id | Delete |

### Success Criteria
How do we know this is done? What does "working" look like?

### Edge Cases
What could go wrong? What inputs should be rejected?
