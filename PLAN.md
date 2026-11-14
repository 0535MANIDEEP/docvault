# DocVault — build plan

Document management app with role-based access control.
Stack: Next.js (App Router) + TypeScript, Zustand, Zod, Vitest, GitHub Actions, Vercel.

**Definition of done:** the app runs locally, every gate is green (`typecheck`, `lint`, `test`,
`build`), the repo is public with a green CI run, it is deployed on Vercel, and the README is
filled in with real screenshots and the three demo logins.

**Live demo:** https://docvault-blond-rho.vercel.app

---

## Week 1 — foundation

- [x] 1. Types + permissions matrix, with unit tests for `can()` covering all roles
- [x] 2. Mock DB with 8–10 sample documents
- [x] 3. `/api/auth` — 3 fake users, cookie session
- [x] 4. Login page — zod validation, inline errors
- [x] 5. Zustand auth store + route guard that redirects logged-out users

## Week 2 — features

- [x] 6. `/api/documents` (GET, POST) and `/api/documents/[id]` (GET, PATCH, DELETE) — 403 on each
- [x] 7. Document table — search, status filter, sorting
- [x] 8. Create/edit form — validation (title length, required fields)
- [x] 9. Upload dropzone — file type + size validation, store file name only
- [x] 10. Detail page — version history, status change limited to reviewer/admin
- [x] 11. Loading / Empty / Error states on every data screen

## Week 3 — quality and shipping

- [x] 12. Component tests for the form and `RoleGate` (3–5 tests)
- [x] 13. Keyboard-navigation + contrast pass (labels, focus states, aria)
- [x] 14. GitHub Actions workflow: lint + test on every push
- [x] 15. Deploy to Vercel
- [x] 16. README, screenshots, pin the repo

## Portfolio update (after DocVault is live)

- [ ] P1. Header: name, role, GitHub / LinkedIn / email links
- [ ] P2. Projects section: one card per project (screenshot, result, tags, Live + Code) — DocVault first
- [ ] P3. Experience: Crystalline internship, DocVault link beside the RBAC bullet
- [ ] P4. Lighthouse pass on the portfolio, fixed, with before/after scores

---

## Conventions

- Commits are small and conventional: `feat:`, `fix:`, `test:`, `docs:`, `chore:`.
- Permissions are checked in **two** places: the UI (`RoleGate`) for UX and the route handler
  for real security. The route handler check is the one that matters.
- UI gates are never treated as security. Every mutating route handler re-checks `can()`.
- `next@16` renamed `middleware.ts` to `proxy.ts` — the route guard uses the v16 convention.

## Notes from the build

- The root layout reads the session cookie, so with Cache Components on it cannot be
  prerendered. `export const instant = false` keeps it blocking on the server.
- `react-hooks/set-state-in-effect` rejects a fetch-in-effect that calls `setState`, even after
  an `await`. The fetch lives in module-scope helpers and resolves in a `.then()` callback.
- Vitest 5 wants `@types/node` `^22 || ^24`; the scaffold pinned `^20`.
- On a serverless host the in-memory store is per instance, so writes are not durable. Documented
  in the README rather than hidden.
