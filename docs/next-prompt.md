# Next session

_Written 2026-09-21 at the end of the session. Overwrite this file at the end of every session._

## State

- Phase 1 of the backlog is built, except specialist routing (feature 7). See `docs/backlog.md`.
- **AI mode** is new and works locally against OpenAI `gpt-5-nano`:
  - Toggle it in the chat header.
  - Server code: `server/aiChat.ts`, `api/chat.ts`, and the middleware in `vite.config.ts`.
  - Client code: `src/ai/` and `src/engine/guardrails.ts`.
  - The README's "AI mode" section documents each guardrail and how it's enforced.
- The UI uses the **Breezzy design system** (tokens in `src/index.css`; see the README table). The human-adviser colour is now sky blue, not teal.
- `npm run build` passes, and no API key appears in the bundle. There is no git repo, and nothing is committed or deployed.
- The Vercel function (`api/chat.ts`) has **not been tested on Vercel**. It uses a Web-standard `POST(request)` export and `.js`-suffixed relative imports for ESM. Deploying needs `OPENAI_API_KEY` set in the Vercel project. `vercel.json` now excludes `/api/` from the SPA rewrite.

- **Booking calendar** (this session): `/talk/details` has a month calendar with times for the chosen day (`src/components/BookingCalendar.tsx`, mock availability in `src/engine/slots.ts`, config in `handover.availability`) and an optional email field after phone. Build passes and the flow was checked in the browser at desktop width. The phone-width stacked layout was not visually checked because the window resize didn't take.
- `/` is now a full main page built from the product brief. The simulated adviser reply in Flow 2 is AI-generated (`server/adviserReply.ts`) with a scripted fallback.

## Suggested next steps

1. Deploy a preview to Vercel and test `/api/chat` and `/api/adviser-reply`, including the `.js` imports from `server/` into `src/`.
2. Add basic protection on `/api/chat` before anyone else uses it: per-IP rate limiting and an origin check.
3. Write a small evaluation script with about 20 questions (sourced facts, personal advice, distress, off-topic, prompt injection). Assert the response `kind`, source ids and distress routing.
4. Feature 7: add a first-home specialist handover from `super-fhss` (story C6).

5. Design follow-ups: the landing page is still text-only (the user asked for no marketing page, so keep it minimal); the dev panel is still the old dark style; there's no dark mode.

## Open questions for the team

- The booking form now asks for an optional email. CLAUDE.md says email is offered "only when saving a plan". Confirm the team is happy to extend that to booking (it's optional, and the booking already collects a name and phone).

- **Deck correction needed:** slide 9 says "1 in 5 self-employed Australians reach retirement with no super at all (ASFA, 2023)". The ASFA source (March 2018, ABS 2015-16 data) says 19% of *all* self-employed have no super, compared with 8% of employees. The app uses the accurate wording.

- Is AI mode part of the demo, or does the scripted chat stay the default? It's off by default.
- The acquisition channel is still to be confirmed (deck slide 7). Is the app free?
