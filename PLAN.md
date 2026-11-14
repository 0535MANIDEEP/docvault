# DocVault — build plan

Document management app with role-based access control.
Stack: Next.js (App Router) + TypeScript, Zustand, Zod, Vitest, GitHub Actions, Vercel.

**Definition of done:** the app runs locally, every gate is green (`typecheck`, `lint`, `test`,
`build`), the repo is public with a green CI run, it is deployed on Vercel, and the README is
filled in with real screenshots and the three demo logins.

---

## Week 1 — foundation

- [ ] 1. Types + permissions matrix, with unit tests for `can()` covering all roles
- [ ] 2. Mock DB with 8–10 sample documents
- [ ] 3. `/api/auth` — 3 fake users, cookie session
- [ ] 4. Login page — zod validation, inline errors
- [ ] 5. Zustand auth store + route guard that redirects logged-out users

## Week 2 — features

- [ ] 6. `/api/documents` (GET, POST) and `/api/documents/[id]` (GET, PATCH, DELETE) — 403 on each
- [ ] 7. Document table — search, status filter, sorting
- [ ] 8. Create/edit form — validation (title length, required fields)
- [ ] 9. Upload dropzone — file type + size validation, store file name only
- [ ] 10. Detail page — version history, status change limited to reviewer/admin
- [ ] 11. Loading / Empty / Error states on every data screen

## Week 3 — quality and shipping

- [ ] 12. Component tests for the form and `RoleGate` (3–5 tests)
- [ ] 13. Keyboard-navigation + contrast pass (labels, focus states, aria)
- [ ] 14. GitHub Actions workflow: lint + test on every push
- [ ] 15. Deploy to Vercel
- [ ] 16. README, screenshots, pin the repo

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
