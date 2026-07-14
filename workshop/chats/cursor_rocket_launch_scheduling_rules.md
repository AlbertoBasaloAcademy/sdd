# Rocket launch scheduling rules
_Exported on 7/14/2026 at 12:35:47 GMT+2 from Cursor (3.11.19)_

---

**User**

/specify   when a launch is scheduled for a rocket it must not collide in time with any other launch of the same rocket. At least is forbidden to schedule one month before and after a launch. For each lauch the price must be a multiple of 1000. 

---

**Cursor**

Following the specify skill: I'll read the templates and PRD, then check whether this fits an existing launch-scheduler spec or needs a new one.


This fits the **Launches** category and amends **[002 Launch Scheduler](docs/specs/002-launch-scheduler/spec.md)**. That spec currently allows the same rocket on multiple future launches at different times, and only requires price > 0 — your rules add a **1-month buffer** per rocket and **price must be a multiple of 1000**.

**Proposed amendment to 002 Launch Scheduler:**
1. A rocket may not have two launches whose scheduled times fall within one month of each other.
2. Price per passenger must be a positive multiple of 1000.

Should I treat this as an **amendment to 002 Launch Scheduler** rather than a new spec? (yes/no)

---

**User**

yes

---

**Cursor**

One detail still affects the collision rule: which other launches on the same rocket should block scheduling?

Should the one-month buffer apply to **all launches** on that rocket (any status), or only **non-terminal** launches (`created` and `confirmed`)?

- **A)** All launches (any status)  
- **B)** Only non-terminal launches (`created` and `confirmed`)

---

**User**

a

---

**Cursor**

Next detail: how should “one month” be measured for the buffer?

**A)** Calendar month — e.g. Jan 15 blocks Dec 15–Feb 15  
**B)** Exactly 30 days before and after the scheduled time

---

**User**

b

---

**Cursor**

One more detail on the 30-day buffer: if another launch on the same rocket is scheduled **exactly 30 days** before or after, should that be allowed?

**A)** Yes — exactly 30 days apart is allowed (forbidden only if closer than 30 days)  
**B)** No — within 30 days inclusive is forbidden (exactly 30 days apart is also blocked)

---

**User**

a

---

**Cursor**

Confirming the amendment before I write it:

- **002 Launch Scheduler** — amended (not a new spec)
- **Collision:** same rocket; all launches (any status); blocked if another is **closer than 30 days**; exactly 30 days apart is OK
- **Price:** must be a **positive multiple of 1000** (minimum 1000)

Proceed with writing the amendment? (yes/no)

---

**User**

yes

---

**Cursor**

Writing the amendment to spec 002 and updating the PRD.


Amendment written for **002 Launch Scheduler**. Summary of what changed:

### Business rules added
- **30-day collision buffer** — same rocket cannot have two launches less than 30 days apart; applies to all launches regardless of status; exactly 30 days apart is allowed; self-excluded on update
- **Price constraint** — `price_per_passenger` must be a positive multiple of 1000 (minimum 1000)

### Removed
- Rule allowing multiple future launches on the same rocket at any different times

### New verification criteria
- **AC-002.11** — reject launches within 30 days of another on the same rocket
- **AC-002.12** — accept launches exactly 30 days apart
- **AC-002.13** — reject prices that are not multiples of 1000

### Files updated
- `docs/specs/002-launch-scheduler/spec.md` — status set to `in-progress`, updated 2026-07-14
- `docs/specs/PRD.md` — tags updated with `collision-buffer`, `price-multiple`

Ready for implementation via `/codify` when you want to build it.

