---
spec-id: {NNN}
spec-name: {Feature Name}
spec-slug: {feature-slug}
spec-date: {YYYY-MM-DD}
status: {pending, in-progress, failed, completed}
---
#  {NNN} {Feature Name}  Spec

## Problem definition

### User stories

- As a user, I want to **{goal}** so that {reason or benefit}

### Business rules

> RuleSpeak format.

- A {subject} must {constraint}.
- A {subject} must not {constraint}.
- A {subject} may {action} only if {condition}
- A {subject} is always {definition/property}
- A {subject} must be considered {status} if {condition}

### Out of scope

## Solution overview

### Data model

> Model Design Convention

- **EntityName**: {short description}
    - unique_attribute: type#
    - mandatory_attribute: type
    - optional_attribute: type?
    - enum_attribute: enum [option1, option2]
    - ranged_attribute: type (min, max)
    - relationship: RelatedEntity [cardinality]
    - Rules:
      - rule 1
      - rule 2


### Backend API

### Frontend app

## Verification criteria
{Number every criterion AC-{NNN}.{n} — plans, tests, and reports reference these ids.}

- [ ] **AC-{NNN}.1** — EARS format criteria to verify the spec is complete and correct