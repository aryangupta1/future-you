# Future You (v0)

A web app for $RUs with an AI digital advisor. People ask money questions anonymously, build a small plan, and talk to a licensed human adviser when they choose.

**This is v0.** By default the chat is fully hardcoded: the user taps reply chips. An optional **AI mode** (a toggle in the chat header) adds free-text questions answered by OpenAI `gpt-5-nano` through a small server endpoint, behind the same guardrails as the scripted chat (see [AI mode](#ai-mode)). Sign-in, email, bookings and adviser messages are mocks and are labelled "v0" in the UI. All scripted conversation content lives in data files.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks (tsc -b), then builds to dist/
```

AI mode needs `OPENAI_API_KEY` in `.env` (local) or in the Vercel project's environment variables (deployed). Without it, the toggle still appears and the chat shows a clear "not configured" error.

Requires Node 20+. Stack: Vite 6, React 18, TypeScript, Tailwind CSS 4 and React Router 6.

**Design system.** The styling follows the [Breezzy](https://breezzy.framer.ai/) Framer template. `src/index.css` defines it as Tailwind tokens:

| Token | Value | Used for |
| --- | --- | --- |
| `ink` | `#0d111b` | Text, 1px outlines, user bubbles |
| `lime` / `lime-50` | `#e4fdc4` / `#f7fff0` | Primary buttons, the chat bar / page background |
| `accent-fill` / `accent-tint` / `accent` | `#c3f1fd` / `#e3f9ff` / `#075b72` | Human-adviser moments only |
| `sun` / `sun-50` | `#f1ee83` / `#fdfbc3` | Notices, flags, v0 notes |
| `shadow-hard-sm` / `shadow-hard` / `shadow-hard-lg` | 2 / 4 / 8px offset, no blur | Buttons, cards, confirmation |
| `card`, `press` | utilities | Outlined white card; press-down hover on buttons |
| `.display` | Darker Grotesque 700 | Page and section headings |

Fonts load from Google Fonts in `index.html`.

Press **D** anywhere (or tap "Dev" in the footer or chat tray) to open the dev panel. From there you can reset all state, jump to Flow 1 or Flow 2, simulate an adviser reply, show or hide the correction notice, set the advisor status (normal, slow or unavailable), simulate a return visit, and open the $RUs staff view.

Product context (persona, the four engagement measures, the phases) is in `docs/product.md`, and build status against the ranked backlog is in `docs/backlog.md`.

## Project layout

```
api/chat.ts                 Vercel Function: POST /api/chat
api/adviser-reply.ts        Vercel Function: POST /api/adviser-reply (simulated adviser, v0)
server/openai.ts            Shared OpenAI Responses call with a strict JSON schema
server/aiChat.ts            AI mode: prompt, schema, guardrails (also served by the Vite dev middleware)
server/adviserReply.ts      Simulated adviser reply: prompt, schema, guardrails
src/
  ai/                       Wire types and the browser client for /api/chat
  content/
    newClientFlow.ts        Flow 1: every word of the new-client chat, landing, plan and handover copy
    existingClientFlow.ts   Flow 2: existing-client chat, dashboard, adviser, reply, correction notice
    sources.ts              ATO / Moneysmart / ASIC links used by answers
    service.ts              Service-status copy (slow / unavailable) and the $RUs staff view
  engine/
    types.ts                Source, Option, Node, Flow, PlanStep
    engine.ts               Pure functions: choose(), visibleOptions(), buildSummary(), validateFlow()
    measures.ts             The four engagement measures and monitoring-log classification
    guardrails.ts           Deterministic distress / personal-advice / figures checks, shared by browser and server
  state/store.ts            App state + actions + monitoring log, persisted to localStorage (try/catch wrapped)
  components/               Chat window, layout/header, dev panel, shared UI
  pages/                    One file per screen
```

## How the conversation data works

Each flow is a tree of `Node`s keyed by id:

```ts
type Node = {
  id: string;
  messages: string[];     // AI bubbles, revealed one by one with a typing indicator
  why?: string;           // optional "Why?" expander
  sources?: Source[];     // { label, url }: required on every factual answer
  kind?: 'normal' | 'personalAdvice' | 'distress' | 'adviser';
  options: Option[];      // reply chips; the chosen label becomes the user's message
  topic?: string;         // shown under "Topics covered" in the adviser summary
  adviserNote?: string;   // existing clients: note that the adviser's recorded advice stands
};

type Option = {
  label: string;
  next: string;           // id of the node to show next
  action?: 'savePlan' | 'handover' | 'askAdviser' | 'addPlanStep';
  planStep?: PlanStep;    // with 'addPlanStep'
};
```

- **kind** controls styling. `personalAdvice` shows a "Needs personal advice" label and outlined bubbles. `distress` adds the support card. `adviser` uses the teal tint. Options with `handover` or `askAdviser` always render as teal chips.
- **Actions.** `addPlanStep` adds `planStep` to My Plan. `savePlan` creates the plan and opens My Plan. `handover` opens Talk to a person. `askAdviser` opens Ask my adviser with the last question pre-filled. Navigation happens after the `next` node has finished typing.
- **Plan offer.** `flow.planOffer` appends a one-off "Want me to turn this into a plan?" message once the user has read `afterAnswers` factual answers (nodes with sources). After that, the offer chip stays available until a plan exists. It is never shown under the distress card.
- **Adviser summary.** `buildSummary()` collects the topics covered and the questions that led to an answer or a personal-advice node. The distress mention is only shared if the user ticks a box.
- **Validation.** In dev, `validateFlow()` logs to the console any option that points at a missing node.

Chat threads store node **ids**, not text. Editing a content file therefore updates past messages too.

### Adding a question

1. Add a node to the `nodes` array in `src/content/newClientFlow.ts` (or `existingClientFlow.ts`):

   ```ts
   {
     id: 'super-find-lost',
     topic: 'Super for the self-employed',
     messages: [
       // VERIFY: you can find lost super through ATO online services via myGov.
       'You can search for lost or unclaimed super through myGov, linked to the ATO.',
     ],
     sources: [sources.atoPersonalContributions], // add a proper entry to sources.ts
     options: [BACK],
   },
   ```

2. Link to it from an existing node's `options`, for example under `super`: `{ label: 'How do I find lost super?', next: 'super-find-lost' }`.
3. Follow the content rules. Every factual answer has a source. Anything that needs the user's own figures goes to a `personalAdvice` node with a `TALK` option. Never hardcode caps, rates or thresholds. Put a `// VERIFY` comment above each factual claim.
4. Run `npm run dev` and check the console for validation errors.

## Product rules and where they live

| Rule | Where |
| --- | --- |
| General information only; personal questions lead to a human | `personalAdvice` nodes (`super-40k`, `advice-ai`, `ec-how-much`) |
| AI disclosed before the first question | `start` / `ec-start` nodes; "AI" badge on every AI message |
| Source on every factual answer | `sources` on nodes, rendered under each answer |
| "Talk to a person" on every page | Header (`Layout.tsx`); signed-in clients go to their adviser |
| Distress leads to a calm support card, not crisis help | `distress` node + `supportCard` |
| Anonymous by default; email optional, offered only on saving a plan | No sign-up; `MyPlan.tsx` |
| No hardcoded caps, rates or thresholds; `// VERIFY` on facts | Content files |
| Every exchange logged for review, like a human adviser (A6) | `actions.logChat()`, `/staff` monitoring log |
| Told honestly when the advisor is slow or down (A2, A5) | `serviceStatus` in the store, `ServiceBanner` in `Layout.tsx`, chat tray |

Pain points P1 to P5 are referenced in comments where content addresses them.

## 2-minute walkthrough

**Flow 1: new client (anonymous)**

1. Open `/` and tap **Start a conversation**. The AI says it's an AI, that it gives general information only, and that no account is needed.
2. Tap **Super for the self-employed**, then **Do I have to pay my own super if I'm self-employed?** Note the sources and the "Why?" expander.
3. Tap **How does claiming a deduction work?** After this second answer, the AI offers to turn the chat into a plan.
4. Tap **I've got $40k saved. Should I put $20k into super?** The AI explains the personal-advice line, gives the general rules, and offers a teal **Talk to an adviser**.
5. Back to topics, then tap **Honestly, money stress…** to see the support card (an $RUs adviser, National Debt Helpline, Lifeline).
6. Tap **Yes, turn this into a plan**. My Plan opens. Tick a step, **Save my plan**, then skip or fill in the optional email.
7. Reload `/`. The **Welcome back** card replaces the start buttons.
8. Tap **Talk to a person** in the header. Review the summary preview, share it, pick a slot, and book. The confirmation shows the adviser and says they'll read the summary first.

**Flow 2: existing client**

1. On `/`, tap **I'm an existing $RUs client**, then **Demo sign-in**.
2. The dashboard shows the plan with a teal **From your adviser** step, plus Priya's card.
3. **Open the AI chat**, then tap **What's the deadline for a deductible super contribution?** You get a general answer with a source and a teal note that Priya's recorded step stands.
4. Tap **So how much should I put in this year?** This is personal advice, so it offers **Ask my adviser**. The message page opens with the question pre-filled and context attached.
5. Tick **time-sensitive** and **Send**, then **Simulate adviser reply**. Priya's reply is generated by AI (labelled "Simulated by AI · v0") from your messages, what you asked the AI chat, and your plan. It may add one "From your adviser" step to your plan. Without an API key, or if the AI breaks a rule, the scripted reply is used instead and the page says so.
6. Press **D** and turn on **Show correction notice** to see the dashboard banner, including what $RUs is doing about it.

**Flow 3: return, service status and the staff view**

1. On a fresh start, tap **What happens to my data?** before choosing a topic.
2. After saving a plan, choose **When a payment lands** under Check-ins. Back on `/`, the Welcome back card shows **A payment just landed**, which opens a sourced check-in in the chat.
3. On My Plan, **Use a private link instead** swaps the email for a copyable link (v0: this device only).
4. Press **D**, set **Advisor status** to Slow or Unavailable. Every page shows a banner. In the chat, Unavailable replaces the reply chips with a "Talk to a person" card.
5. Press **D**, tap **Simulate a return visit**, then **Open $RUs staff view** (also in the footer). It shows the four engagement measures and the monitoring log, with advice-line and distress exchanges flagged for review.

## AI mode

Toggle **AI mode** in the chat header (both chats). The reply chips give way to a text box; action chips such as "Talk to an adviser" stay. The key is only read on the server: the browser calls `/api/chat`, which is `api/chat.ts` on Vercel and middleware in `vite.config.ts` during `npm run dev` and `npm run preview`.

The same rules as the scripted chat, enforced in code where possible:

| Rule | How AI mode enforces it |
| --- | --- |
| Distress leads to the support card | `detectDistress()` runs in the browser and again on the server. A match skips the model and shows the flow's vetted distress node (`flow.ai.distressNode`). |
| Personal questions lead to a human | `detectPersonalAdvice()` forces `kind: 'personalAdvice'` whatever the model says. Those answers get the teal hand-off chip (`flow.ai.handover`). |
| Source on every factual answer | The model can only cite source **ids** from `src/content/sources.ts` (a JSON-schema enum), so it can't invent links. Answers with no source are flagged "unchecked" and offer a human. |
| No hardcoded caps or rates | The prompt forbids them. Replies that still contain a `$` figure or a `%` get a "check the source" note. |
| AI disclosed | Answers are tagged "Generated", with a note that no person has checked them. |
| Stays on topic | Off-topic requests get a fixed reply; the model's text is thrown away. |
| Monitored | Every AI exchange is logged. Personal-advice and unsourced answers are flagged in `/staff`. |
| Adviser summary | AI questions and topics flow into the Talk to a person summary like scripted ones. |

**Simulated adviser reply** (`/api/adviser-reply`) plays Priya, Robyn's adviser, for the Flow 2 demo. It reads the message thread, the client's AI chat and her plan (including steps Priya recorded). Guardrails:
- A reply that quotes a figure Robyn didn't write herself is regenerated once. If it happens again, the scripted reply is used.
- Distress in her messages appends the National Debt Helpline line from the support card.
- At most one new plan step, which must be Robyn's own action. Existing steps are never changed.

Limits: questions up to 600 characters, the last 10 turns as context, 45-second timeout, `store: false` on the OpenAI request. There is no rate limiting or auth on `/api/chat` yet, so add both before a public pilot.

## Out of scope for v0

Real authentication, real financial data, an adviser backend, email sending and payments. Anything that implies these is mocked and labelled "v0".
