# Launch scheduler documentation
_Exported on 7/13/2026 at 11:58:01 GMT+2 from Cursor (3.11.13)_

---

**User**

/codify @docs/specs/002-launch-scheduler/spec.md @docs/specs/002-launch-scheduler/verify.report.md 

---

**Cursor**

Reading the spec, verify report, and related code to identify what to implement.


Reviewing the failing test helpers and related code to plan fixes.


Verify report points to e2e helper fixes, not product code. Implementing those fixes per the codify workflow.


Lint passed. Committing the e2e helper fixes per the codify workflow.


## Summary

The verify report triaged all 3 failures to **e2e test helpers**, not product code. I fixed both root causes.

### Alternatives considered

1. **Pin locale in e2e helpers only** (chosen) — minimal change; matches what Playwright’s browser renders (`$275.00`).
2. **Pin locale in frontend + e2e** — more consistent, but unnecessary since the UI already renders en-US in the test browser.
3. **For `expectToast`**: filter by text + `.last()` (chosen) vs. `.last()` alone — filtering is more precise when multiple error messages could appear.

### Changes

| File | Fix |
|------|-----|
| `src/e2e/tests/helpers/launches.helpers.ts` | `formatPrice` uses `"en-US"` instead of system locale |
| `src/e2e/tests/helpers/rockets.helpers.ts` | `expectToast` targets `.filter({ hasText: message }).last()` |

These address:
- **AC-002.2 / AC-002.3** — locale mismatch (`275,00 US$` vs `$275.00`)
- **AC-002.10** — strict mode violation from duplicate `.toast-error` elements

### Verification

- `nub run lint` — passed (including e2e `tsc --noEmit`)
- E2e tests not run (per codify skill for e2e targets)

### Commit

`184a954` — `fix(e2e): align launch test helpers with browser locale and duplicate toasts`

Re-run verification with `/verify` or:

```bash
nub run test:e2e -- tests/launches.page.spec.ts
```

