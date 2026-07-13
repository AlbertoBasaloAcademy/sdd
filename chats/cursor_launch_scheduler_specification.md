# Launch scheduler specification
_Exported on 7/13/2026 at 11:57:52 GMT+2 from Cursor (3.11.13)_

---

**User**

/verify @docs/specs/002-launch-scheduler/spec.md 

---

**Cursor**

I'll run the verify workflow for the launch scheduler spec — reading the spec, report template, and related e2e tests first.


Checking for existing verification reports and how e2e tests are run.


**Research — spec 002 Launch Scheduler**

| Item | Location |
|------|----------|
| Spec | `docs/specs/002-launch-scheduler/spec.md` |
| E2E tests | `src/e2e/tests/launches.page.spec.ts` (AC-002.1–AC-002.10) |
| Frontend | `src/front/app/router/launch-scheduler-page.component.ts` |
| Backend | Launches API (`GET/POST/PUT /api/launches`) |

Planned command:

```bash
nub run test:e2e -- tests/launches.page.spec.ts
```

(from `src/e2e`; Playwright starts back + front automatically)

Should I run all 10 acceptance-criteria tests (AC-002.1–AC-002.10) and generate the verification report? **(yes/no)**

---

**User**

yes

---

**Cursor**

Running the launch scheduler e2e tests, then generating the verification report.


Reading the test results JSON for per-test timing and details.


Generating the verification report and committing it per the verify skill.


Verification complete for **002 Launch Scheduler**.

## Result: FAILED (7/10)

| Passed | Failed |
|--------|--------|
| AC-002.1, .4, .5, .6, .7, .8, .9 | AC-002.2, .3, .10 |

**Command:** `nub run test:e2e -- tests/launches.page.spec.ts` — 15.4s, exit code 1

### Failures (test suite, not product)

1. **AC-002.2 & AC-002.3** — Locale mismatch: `formatPrice()` uses system locale (`275,00 US$`) but the UI shows `$275.00`. Launches are created/updated correctly.
2. **AC-002.10** — `expectToast` hits strict-mode violation when two error toasts are on screen; the error message does appear.

### Deliverables

- Report: `docs/specs/002-launch-scheduler/verify.report.md`
- Committed: `8f63654` — `docs(launch-scheduler): add verification report for spec 002`

### Recommended next steps

1. Pin `formatPrice` to `en-US` in e2e helpers.
2. Make `expectToast` handle multiple toasts (e.g. `.last()` or filter by text).
3. Re-run `/verify` to confirm all 10 pass.

Want me to apply those test fixes?

