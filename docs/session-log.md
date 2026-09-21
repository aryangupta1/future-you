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

## 2026-09-21 (design)

- Restyled the app to the Breezzy Framer template's design system. No new pages.
  - Tokens in `src/index.css`.
  - Pill header, lime chat bar, ink outlines, hard shadows, Darker Grotesque headings.
  - Human-adviser colour moved from teal to sky blue.
- Checked in Chrome at desktop width and at 390px (via iframes): no horizontal scroll, fonts load.

## 2026-09-21 (main page + adviser AI)

- Rebuilt `/` from the product brief:
  - Hero, then a real answer preview taken from the content tree.
  - "Ask something now" sample questions that open the chat at that node.
  - P1–P5 pain-point cards, "How it works", "Why now" stats, "Your options today" table, and a closing call to action.
- "Why now" stats checked against primary sources and added to `sources.ts`:
  - ASFA 2018: 19% of the self-employed have no super, vs 8% of employees.
  - ASIC 2026: 63% of Gen Z use social media and 18% use AI for money information.
  - The deck's "1 in 5 reach retirement with no super (ASFA 2023)" isn't what the source says. The page uses the accurate wording.
- The simulated adviser reply is now AI-generated through `/api/adviser-reply`, with the guardrails listed in the README. Falls back to the scripted reply.
- Refactored the OpenAI call into `server/openai.ts`. Renamed `actions.startCheckIn` to `startWithQuestion`.
