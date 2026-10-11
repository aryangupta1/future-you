# Next session

_Written 2026-10-11 at the end of the session. Overwrite this file at the end of every session._

## State

- Phase 1 of the backlog is built, except specialist routing (feature 7). See `docs/backlog.md`.
- The code is in git (`origin` is `github.com/aryangupta1/future-you`, branch `master`). The user deploys to Vercel.
- **AI mode** (toggle in the chat header) and the simulated adviser reply (`server/adviserReply.ts`):
  - Server code: `server/aiChat.ts`, `api/chat.ts`, `api/adviser-reply.ts`, and the middleware in `vite.config.ts`.
  - Client code: `src/ai/` and `src/engine/guardrails.ts`. The README's "AI mode" section documents each guardrail.
- **New this session: Claude fallback.**
  - `server/ai.ts` tries OpenAI `gpt-5-nano` first (`server/openai.ts`). It falls back to Anthropic `claude-opus-5-5` (`server/anthropic.ts`, `@anthropic-ai/sdk`) when OpenAI has no key, can't be reached, returns an error status or sends an unreadable answer.
  - The Claude call uses structured output (`betaJSONSchemaOutputFormat`), `effort: 'low'`, and the server-side refusal fallback (`fallbacks: 'default'`).
  - Handlers take `{ openai, anthropic }` keys from `OPENAI_API_KEY` and `ANTHROPIC_API_KEY || API_KEY`. The user's key is named `API_KEY` in Vercel. The guardrails didn't change and run on either provider's answer.
  - **The OpenAI account is out of credits** (429 `insufficient_quota`), so in practice Claude answers every request right now.
- The UI follows the SRU's brand kit (v1.1). Tokens are in `src/index.css`, and the README has a token table. The logo and favicon are in `public/brand/`.
- The booking calendar is on `/talk/details` (`BookingCalendar.tsx`, `engine/slots.ts`).

## Verification status

- `npm run build` passes, and no API key appears in the bundle.
- Dev server with bad keys: the OpenAI 401 falls through to Claude, and the Claude 401 shows as a clean error.
- **Checked on the Vercel production deploy** (`60d2ed6`) in Chrome: `/api/chat` returned 200 with a sourced answer (about 6.5s), and `/api/adviser-reply` returned 200 with a reply and plan step (about 8.7s). Claude served both.
- Not checked locally: the `API_KEY` line in `.env` hadn't been saved to disk during the session.
- If the local shell exports `OPENAI_API_KEY` (one was set to `ollama`), it overrides `.env`, because Vite's `loadEnv` prefers process env.

## Suggested next steps

1. With `API_KEY` saved in `.env`, check AI mode locally with `npm run dev`.
2. Top up OpenAI or make Claude the primary provider. The latter means swapping the order in `server/ai.ts`.
3. Add basic protection on `/api/chat`: per-IP rate limiting and an origin check.
4. Write an evaluation script with about 20 questions (sourced facts, personal advice, distress, off-topic, prompt injection). Run it against both providers.
5. Feature 7: add a first-home specialist handover from `super-fhss` (story C6).

## Open questions for the team

- Which provider should be primary? Claude Opus 5.5 costs much more per token than gpt-5-nano.
- **Brand name:** the brand kit writes "SRU's", while the app copy says "$RUs".
- The booking form asks for an optional email. CLAUDE.md says email is offered "only when saving a plan". Confirm that's OK.
- **Deck correction needed:** slide 9's "1 in 5 self-employed … (ASFA, 2023)" should be ASFA March 2018: 19% of all self-employed have no super, compared with 8% of employees.
- Is AI mode part of the demo? It's off by default.
- The acquisition channel is still to be confirmed (deck slide 7). Is the app free?
