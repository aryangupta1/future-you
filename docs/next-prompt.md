# Next session

_Written 2026-09-29 at the end of the session. Overwrite this file at the end of every session._

## State

- Phase 1 of the backlog is built, except specialist routing (feature 7). See `docs/backlog.md`.
- **AI mode** is new and works locally against OpenAI `gpt-5-nano`:
  - Toggle it in the chat header.
  - Server code: `server/aiChat.ts`, `api/chat.ts`, and the middleware in `vite.config.ts`.
  - Client code: `src/ai/` and `src/engine/guardrails.ts`.
  - The README's "AI mode" section documents each guardrail and how it's enforced.
- **New this session: the UI follows the SRU's brand kit** (`SRUs Brand Guidelines Kit 2.pdf`, v1.1). This replaces Breezzy. Tokens are in `src/index.css` and the README has a token table:
  - Colours: Midnight `#002233` ink, Praxeti White canvas, Isotonic Water lime primary, Pacific Panorama for the human adviser, Grape Mist (`mist`, formerly `sun`) for notices, Mantis for success.
  - Style: 1.5px outlines, flat surfaces with no hard shadows, 20px cards.
  - Type: Geist headings, Lunasima body, Geist Pixel badges (the `pixel` utility).
  - New shared pieces in `ui.tsx`: `PixelTag` and `SectionHeading`.
  - The landing page uses the kit's pattern library (value prop grid, dark icon tiles, data and citation card, Midnight CTA). The header is a Midnight band with a lime rule.
  - Build passes. Checked in Chrome at desktop width and at 390px through same-origin iframes: no horizontal overflow.
- `npm run build` passes, and no API key appears in the bundle. There is no git repo, and nothing is committed or deployed.
- The Vercel function (`api/chat.ts`) has **not been tested on Vercel**. It uses a Web-standard `POST(request)` export and `.js`-suffixed relative imports for ESM. Deploying needs `OPENAI_API_KEY` set in the Vercel project. `vercel.json` now excludes `/api/` from the SPA rewrite.

- **Booking calendar** (this session): `/talk/details` has a month calendar with times for the chosen day (`src/components/BookingCalendar.tsx`, mock availability in `src/engine/slots.ts`, config in `handover.availability`) and an optional email field after phone. Build passes and the flow was checked in the browser at desktop width. The phone-width stacked layout was not visually checked because the window resize didn't take.
- `/` is now a full main page built from the product brief. The simulated adviser reply in Flow 2 is AI-generated (`server/adviserReply.ts`) with a scripted fallback.

## Suggested next steps

1. Deploy a preview to Vercel and test `/api/chat` and `/api/adviser-reply`, including the `.js` imports from `server/` into `src/`.
2. Add basic protection on `/api/chat` before anyone else uses it: per-IP rate limiting and an origin check.
3. Write a small evaluation script with about 20 questions (sourced facts, personal advice, distress, off-topic, prompt injection). Assert the response `kind`, source ids and distress routing.
4. Feature 7: add a first-home specialist handover from `super-fhss` (story C6).

5. Design follow-ups: there's no dark mode. The Geist Pixel badges are small (10–12px). Check they read well on a real phone, and switch the `pixel` utility to Geist Mono if they don't.

## Open questions for the team

- **Brand name:** the brand kit writes the firm as "SRU's" ("A SRU's ADVISER", "SRU's Wealth App"), while the app copy and docs say "$RUs". The copy was left as "$RUs". If the team wants "SRU's", find and replace in `src/content/`, `Layout.tsx` ("by $RUs") and `index.html` `<title>`.
- The kit's sample stat card cites "ASFX Income & Wealth Values Report 2026". That looks like a placeholder. The app keeps the verified ASFA 2018 source.

- The booking form now asks for an optional email. CLAUDE.md says email is offered "only when saving a plan". Confirm the team is happy to extend that to booking (it's optional, and the booking already collects a name and phone).

- **Deck correction needed:** slide 9 says "1 in 5 self-employed Australians reach retirement with no super at all (ASFA, 2023)". The ASFA source (March 2018, ABS 2015-16 data) says 19% of *all* self-employed have no super, compared with 8% of employees. The app uses the accurate wording.

- Is AI mode part of the demo, or does the scripted chat stay the default? It's off by default.
- The acquisition channel is still to be confirmed (deck slide 7). Is the app free?
