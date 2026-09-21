# Session log

Append-only. Add one entry per session at the end of the file: the date, what changed, and anything left open. Keep each entry to a few lines; details belong in commits and `next-prompt.md`.

## 2026-09-21

- Read the team's personas workbook and pitch deck from SharePoint. Their contents are summarised in `docs/product.md` and `docs/backlog.md`.
- Built the missing Phase 1 features:
  - Service status (feature 8)
  - Monitoring log and engagement measures at `/staff` (features 4, 9)
  - Correction mitigation line (A4)
  - Income-timed check-ins and "A payment just landed" (feature 5)
  - Private-link save option
  - "What happens to my data?" (feature 1)
- Set up `CLAUDE.md`, `docs/`, and a SessionStart hook that injects `docs/next-prompt.md`.
- Build passes (`npm run build`). Flows were smoke-tested in Chrome with no console errors.

## 2026-09-21 (later)

- Added AI mode:
  - A toggle in the chat header.
  - Free text answered by OpenAI `gpt-5-nano` through `/api/chat`: `api/chat.ts` on Vercel, `vite.config.ts` middleware in dev.
- Guardrails enforced in code:
  - Distress skips the model.
  - Personal-advice questions are forced into that shape.
  - Sources come from an allowlist only.
  - Off-topic replies are fixed text.
  - Replies that quote figures get a note.
- Tested live: sourced answer, personal-advice hand-off chip, distress support card, off-topic refusal, adviser summary, and `/staff` flags.
