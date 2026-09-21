# Next session

_Written 2026-09-21 at the end of the session. Overwrite this file at the end of every session._

## State

- Phase 1 of the backlog is built, except specialist routing (feature 7). See `docs/backlog.md`.
- **AI mode** is new and works locally against OpenAI `gpt-5-nano`:
  - Toggle it in the chat header.
  - Server code: `server/aiChat.ts`, `api/chat.ts`, and the middleware in `vite.config.ts`.
  - Client code: `src/ai/` and `src/engine/guardrails.ts`.
  - The README's "AI mode" section documents each guardrail and how it's enforced.
- `npm run build` passes, and no API key appears in the bundle. There is no git repo, and nothing is committed or deployed.
- The Vercel function (`api/chat.ts`) has **not been tested on Vercel**. It uses a Web-standard `POST(request)` export and `.js`-suffixed relative imports for ESM. Deploying needs `OPENAI_API_KEY` set in the Vercel project. `vercel.json` now excludes `/api/` from the SPA rewrite.

## Suggested next steps

1. Deploy a preview to Vercel and test `/api/chat`, including the `.js` imports from `server/` into `src/`.
2. Add basic protection on `/api/chat` before anyone else uses it: per-IP rate limiting and an origin check.
3. Write a small evaluation script with about 20 questions (sourced facts, personal advice, distress, off-topic, prompt injection). Assert the response `kind`, source ids and distress routing.
4. Feature 7: add a first-home specialist handover from `super-fhss` (story C6).

## Open questions for the team

- Is AI mode part of the demo, or does the scripted chat stay the default? It's off by default.
- The acquisition channel is still to be confirmed (deck slide 7). Is the app free?
