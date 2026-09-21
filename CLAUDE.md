# Future You

A v0 prototype of an AI digital advisor web app for $RUs, a financial advice firm, built for a University of Sydney group assessment (A3). The chat is hardcoded, with reply chips instead of free text, and there is no backend. Everything persists to localStorage.

## Commands

```bash
npm run dev      # http://localhost:5173
npm run build    # tsc -b then vite build. Run this before calling any change done.
```

There is no test suite. Verify behaviour in the browser: press **D** for the dev panel, and check the console for `validateFlow()` errors.

## Where things are

- `README.md`: architecture, conversation data model, how to add a question, demo walkthroughs
- `docs/product.md`: persona (Robyn Banks), pain points P1–P5, the four engagement measures, phases
- `docs/backlog.md`: ranked backlog (features 1–15) and what is built
- `docs/session-log.md`: one short entry per session
- `docs/next-prompt.md`: handoff to the next session (see below)

## Rules that must hold

- **General information only.** Anything that needs the user's own figures goes to a `personalAdvice` node that explains the line and offers a human.
- **A source on every factual answer.** Every factual claim gets a `// VERIFY` comment above it, and there are no hardcoded caps, rates or thresholds.
- **The AI discloses itself** before the first question. Teal (`accent`) is reserved for human-adviser moments; the AI is always black or grey.
- **Distress gets a calm support card**, never crisis-help positioning.
- **Anonymous by default.** Email or a private link is offered only when saving a plan.
- **All user-facing copy lives in `src/content/`**, not in components. Keep that separation so a real AI can replace the tree later.
- **Label mocks** "v0" in the UI (`V0Note`).
- **Scope:** don't build Phase 2 or 3 features (own-figures guidance, projections, aged selfie, ESG) unless asked. See `docs/product.md`.

## Session protocol

**At session start:** a SessionStart hook (`.claude/hooks/inject-handoff.sh`) injects `docs/next-prompt.md` into context on startup and `/clear`. Treat it as the starting brief, unless the user's first message says to ignore it or start fresh. In that case, drop it and follow the user. To skip the injection entirely, launch with `FUTURE_YOU_SKIP_HANDOFF=1`.

**Before the session ends** (when the user wraps up, or after finishing a substantial piece of work):

1. **Overwrite `docs/next-prompt.md`** as a self-contained brief:
   - Date and current state
   - What changed and where
   - Build or verification status
   - Ranked next steps
   - Open questions

   Write it for a reader with no memory of this session.
2. **Append a short dated entry to `docs/session-log.md`.**
3. **Update `docs/backlog.md`** if any feature's status changed.
