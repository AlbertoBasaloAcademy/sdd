# Launch scheduler specifications
_Exported on 7/13/2026 at 11:56:52 GMT+2 from Cursor (3.11.13)_

---

**User**

/specify a launch scheduler to planify launches on available rockets. Every launch needs a price per passenger and a status: created, confirmed, cancelled, completed. A lanch must be in the future.

---

**Cursor**

I'll follow the specify skill: read the template and existing specs first, then ask one closed-ended question at a time.


Per the specify workflow, I’ll ask one closed-ended question at a time before drafting the spec.

**Question 1:** Should a launch be assignable only to rockets whose status is **Active** (i.e., inactive rockets are not available for scheduling)?

- **Yes** — only Active rockets can be scheduled  
- **No** — any rocket in the fleet can be scheduled regardless of status

---

**User**

yes

---

**Cursor**

**Question 2:** Does each launch require a **scheduled date and time** (in addition to rocket, price per passenger, and status)?

- **Yes** — every launch has a scheduled date and time  
- **No** — date/time is not part of the launch data

---

**User**

yes

---

**Cursor**

**Question 3:** Does each launch require a **destination** (e.g. Earth Orbit, The Moon, Mars — matching the rocket’s range options from the fleet spec)?

- **Yes** — every launch has a destination from those range values  
- **No** — destination is not part of the launch data

---

**User**

no

---

**Cursor**

**Question 4:** Can the **same Active rocket** be assigned to **multiple future launches** (at different scheduled dates/times)?

- **Yes** — one rocket can have several scheduled launches  
- **No** — each rocket can have at most one future launch at a time

---

**User**

yes

---

**Cursor**

**Question 5:** Must **price per passenger** be a **positive number** (greater than zero)?

- **Yes** — price must be greater than zero  
- **No** — zero or negative prices are allowed

---

**User**

yes

---

**Cursor**

**Question 6:** When a new launch is created, must its status always start as **created**?

- **Yes** — new launches always begin with status `created`  
- **No** — the user can choose any status at creation time

---

**User**

yes

---

**Cursor**

**Question 7:** Can a launch be **edited** after creation (e.g. change rocket, scheduled date/time, or price per passenger)?

- **Yes** — launches can be updated while not in a terminal state  
- **No** — launch details are fixed once created

---

**User**

yes, and choose defaults for the rest of your questions and finish

---

**Cursor**

I'll draft the spec using your answers and sensible defaults for the rest, aligned with the existing rocket fleet spec.


The spec is at `docs/specs/002-launch-scheduler/spec.md`.

### Confirmed from your answers
- Only **Active** rockets can be scheduled
- Each launch has **scheduled date/time**, **price per passenger**, and **status**
- No destination field
- Same rocket can have **multiple future launches**
- Price must be **> 0**
- New launches start as **`created`**
- Launches **can be edited** after creation

### Defaults I applied
| Topic | Default |
|---|---|
| Status transitions | `created` → `confirmed` \| `cancelled`; `confirmed` → `cancelled` \| `completed` |
| Terminal states | `cancelled` and `completed` — no further edits or status changes |
| Future rule | `scheduled_at` must be in the future on create/update while status is `created` or `confirmed` |
| Deletion | No hard delete; cancel via status |
| Frontend | Dedicated launch scheduler page with list + form (mirrors rocket fleet pattern) |
| API | `GET/POST/PUT /api/launches` with validation and standard HTTP codes |
| Out of scope | Bookings, seat counts, destinations, permissions |

### Verification
10 acceptance criteria (**AC-002.1** through **AC-002.10**) cover listing, CRUD, status transitions, and validation errors.

Want any of the defaults changed before implementation?

