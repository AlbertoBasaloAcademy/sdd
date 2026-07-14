# Branch Guide — AstroBookings SDD Workshop

Follow these branches **in order** to walk through the AstroBookings project from empty baseline to the full, spec-driven product.

> **Repository:** https://github.com/AlbertoBasaloAcademy/sdd

---

## How to use this guide

1. Clone the repo (if you have not already):

   ```bash
   git clone https://github.com/AlbertoBasaloAcademy/sdd.git
   cd sdd
   ```

2. Fetch all branches:

   ```bash
   git fetch origin
   ```

3. Check out each branch below, **one step at a time**, and explore the code, specs, and tests before moving on.

4. Install and run the project at any step:

   ```bash
   nub install
   nub run dev      # API :3000 + client :4000
   nub run test     # unit tests
   nub run test:e2e # Playwright e2e (starts servers automatically)
   ```

---


## Steps

### 0 — Baseline · `chore/initial`

| | |
|---|---|
| **Branch** | `chore/initial` |
| **Commit** | `72d54ed` |
| **Tag** | — |
| **Spec** | — |

**What you get:** The workshop starting point. Monorepo scaffold (back, front, e2e) with no business features yet.

**Checkout:**

```bash
git switch chore/initial
```

**Goal:** Understand the project layout before any spec-driven work begins.

---

### 1a — (Optional) Vibe coding · `feat/rockets-vibe-coding`

| | |
|---|---|
| **Branch** | `feat/rockets-vibe-coding` |
| **Commit** | `6b509a3` |
| **Tag** | — |
| **Spec** | — (no formal spec) |

**What you get:** Rocket Fleet built through informal "vibe coding" — code and tests, but **no specification document**.

**Checkout:**

```bash
git switch feat/rockets-vibe-coding
```

**Goal:** Compare this ad-hoc approach with the spec-driven path in the steps that follow. This branch diverged from the baseline and is **not** on the main learning line.

---

### 1 — Spec 001: Rocket Fleet · `feat/rockets-specs`

| | |
|---|---|
| **Branch** | `feat/rockets-specs` |
| **Commit** | `c2f57b5` |
| **Tag** | — |
| **Spec** | [001 Rocket Fleet](../specs/001-rocket-fleet/spec.md) |

**What you get:**

- Spec document and verification report for Rocket Fleet
- Backend API (`src/back/api/rockets/`)
- Frontend pages (list, add, edit rockets)
- E2E and unit tests

**Checkout:**

```bash
git switch feat/rockets-specs
```

**Goal:** See the full **specify → codify → verify** cycle for the first feature.

---

### 2 — SDD skills & tooling · `chore/spec-skills`

| | |
|---|---|
| **Branch** | `chore/spec-skills` |
| **Commit** | `d11c792` |
| **Tag** | — |
| **Spec** | [002 Launch Scheduler](../specs/002-launch-scheduler/spec.md) (written, not yet implemented) |

**What you get:**

- Agent skills: `specify`, `codify`, `verify`, `releasify` (under `.agents/skills/`)
- Spec template and PRD template
- Launch Scheduler **specification only** — no implementation yet

**Checkout:**

```bash
git switch chore/spec-skills
```

**Goal:** Learn the AIDD tooling that drives spec-driven development before building the next feature.

---

### 3 — Spec 002: Launch Scheduler · `feat/pipeline-launches`

| | |
|---|---|
| **Branch** | `feat/pipeline-launches` |
| **Commit** | `232b38a` |
| **Tag** | `v0.2.0` |
| **Spec** | [002 Launch Scheduler](../specs/002-launch-scheduler/spec.md) — completed |

**What you get:**

- Launch Scheduler API and UI (schedule, edit, confirm, cancel, complete)
- E2E tests for all 10 acceptance criteria
- Verification report (all AC pass)
- Verify and release skills wired into the pipeline

**Checkout:**

```bash
git switch feat/pipeline-launches
```

**Goal:** Follow a complete feature from spec through implementation, verification, and release.

---

### 4 — Spec 002 enhancements · `v0.3.0` on `main`

| | |
|---|---|
| **Branch** | `main` (or continue from `feat/pipeline-launches` and fast-forward) |
| **Commit** | `9924aee` |
| **Tag** | `v0.3.0` |
| **Spec** | [002 Launch Scheduler](../specs/002-launch-scheduler/spec.md) — enhanced |

**What you get (on top of step 3):**

- 30-day collision buffer between launches on the same rocket
- Price multiples of 1 000 enforced (API + UI)
- 3 additional acceptance criteria (AC-002.11–AC-002.13)

**Checkout:**

```bash
git switch main   # today main includes everything; for this milestone only:
git switch --detach v0.3.0
```

**Goal:** See how an existing spec evolves with new acceptance criteria and a minor release.

---

### 5 — Spec 003: Cancel Launches · `chore/spec-anchored`

| | |
|---|---|
| **Branch** | `chore/spec-anchored` |
| **Commit** | `795427b` |
| **Tag** | `v0.4.0` |
| **Spec** | [003 Cancel Launches](../specs/003-cancel-launches/spec.md) — completed |

**What you get (on top of step 4):**

- Cancellation reasons (`economic`, `technical`, `meteorological`)
- 7-day rule blocking economic cancellations
- Cancellation dialog in the UI
- 6 new E2E acceptance-criteria tests
- Build-spec command and workshop chat logs

**Checkout:**

```bash
git switch chore/spec-anchored
```

**Goal:** Complete the third spec cycle and review the most advanced workshop state.

---

### 6 — Current · `main`

| | |
|---|---|
| **Branch** | `main` |
| **Commit** | `795427b` |
| **Tag** | `v0.4.0` |
| **Spec** | All three specs completed — see [PRD](../specs/PRD.md) |

**What you get:** The full, up-to-date product. Identical to `chore/spec-anchored` after the merge.

**Checkout:**

```bash
git switch main
```

**Goal:** This is the reference branch going forward.

---

## Quick reference table

| Step | Branch | Commit | Tag | Feature / milestone |
|:---:|---|---|---|---|
| 0 | `chore/initial` | `72d54ed` | — | Baseline scaffold |
| 1a | `feat/rockets-vibe-coding` | `6b509a3` | — | Rocket Fleet (vibe coding, optional) |
| 1 | `feat/rockets-specs` | `c2f57b5` | — | Spec 001 — Rocket Fleet |
| 2 | `chore/spec-skills` | `d11c792` | — | SDD skills + Launch Scheduler spec |
| 3 | `feat/pipeline-launches` | `232b38a` | `v0.2.0` | Spec 002 — Launch Scheduler |
| 4 | `main` @ `v0.3.0` | `9924aee` | `v0.3.0` | Spec 002 enhancements |
| 5 | `chore/spec-anchored` | `795427b` | `v0.4.0` | Spec 003 — Cancel Launches |
| 6 | `main` | `795427b` | `v0.4.0` | Full product (current) |

