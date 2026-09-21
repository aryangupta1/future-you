# Next session

_Written 2026-09-21 at the end of the session. Overwrite this file at the end of every session._

## State

- Phase 1 of the backlog is built, except specialist routing (feature 7). See `docs/backlog.md`.
- The build passes. There is no git repo yet, and nothing has been committed or deployed since these changes. `vercel.json` exists for deployment.
- New this session:
  - `/staff` page
  - `src/engine/measures.ts`
  - `src/content/service.ts`
  - `log`, `serviceStatus` and `plan.checkIns` / `plan.privateLink` in the store
  - Dev panel: advisor status selector, "Simulate a return visit", and a link to the staff view

## Suggested next steps

1. Feature 7: add a first-home specialist handover from `super-fhss` (story C6). The Talk pages would need a specialist variant.
2. Decide whether to `git init` and commit, then redeploy to Vercel.
3. Deck slide 5 (wireframes) is still empty. Screenshots of `/`, `/chat`, `/plan`, `/talk`, `/dashboard` and `/staff` could fill it.

## Open questions for the team

- The acquisition channel is still to be confirmed (deck slide 7).
- Is the app free? The deck assumes so because Murray's goal is engagement.
