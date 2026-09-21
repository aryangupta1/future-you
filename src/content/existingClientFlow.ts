import type { Flow, Node, Option, PlanStep } from '../engine/types';
import { sources } from './sources';

// All Flow 2 (existing $RUs client) text lives here. Same rules as
// newClientFlow.ts: general information only, a source on every factual
// answer, no hardcoded caps or rates, `// VERIFY` on every factual claim.
//
// The AI never reinterprets anything the client's adviser has recorded.

export const client = { firstName: 'Robyn' };

export const adviser = {
  name: 'Priya Nair', // placeholder adviser
  firstName: 'Priya',
  role: 'Financial Adviser, $RUs',
  initials: 'PN',
  replyTime: 'Usually replies within 1 business day',
};

export const signIn = {
  title: 'Sign in to Future You',
  mockNote: 'v0 mock: there is no real sign-in. Any email and password works, or use Demo sign-in.',
  demoLabel: 'Demo sign-in as Robyn',
};

export const dashboard = {
  greeting: `Hi ${client.firstName}`,
  planTitle: 'Your plan',
  fromAdviserLabel: 'From your adviser',
  askLabel: 'Ask my adviser',
  chatLabel: 'Ask the AI a general question',
  chatHint: 'General information only. Your adviser handles anything about your own figures.',
};

/** Robyn's plan as it stands after her last review. */
export const clientPlanSeed: PlanStep[] = [
  {
    id: 'ec-buffer',
    text: 'Keep your tax and super buffer account topped up',
    done: true,
  },
  {
    id: 'ec-contribution',
    text: 'Consider a personal super contribution before 30 June',
    detail: `Recorded by ${adviser.firstName} after your August review.`,
    fromAdviser: true,
  },
  {
    id: 'ec-balance',
    text: "Check your super balance in your fund's app each quarter",
  },
];

// ---------------------------------------------------------------------------
// Conversation tree
// ---------------------------------------------------------------------------

const BACK: Option = { label: 'Back to topics', next: 'ec-topics' };

const QUESTIONS: Option[] = [
  { label: "What's the deadline for a deductible super contribution?", next: 'ec-deadline' },
  { label: 'So how much should I put in this year?', next: 'ec-how-much' },
  { label: 'What is a notice of intent?', next: 'ec-noi' },
  { label: 'Did my last contribution go through?', next: 'ec-check' },
  { label: 'What is Payday Super? Does it affect me?', next: 'ec-payday' },
];

const nodes: Node[] = [
  {
    id: 'ec-start',
    messages: [
      `Hi ${client.firstName}. I'm the Future You digital advisor, an AI, not a person.`,
      `I give general information only. Anything about your own figures is for ${adviser.firstName}, and I never change or reinterpret what ${adviser.firstName} has recorded on your plan.`,
    ],
    options: QUESTIONS,
  },
  {
    id: 'ec-topics',
    messages: ['What else would you like to know?'],
    options: QUESTIONS,
  },
  {
    id: 'ec-deadline',
    messages: [
      // VERIFY: contributions must be received by the fund by 30 June to count in that financial year.
      'In general, a contribution has to be received by your super fund by 30 June to count for that financial year. Sending it on 30 June may be too late.',
      // VERIFY: BPAY and some payment methods take several business days; funds may set earlier cut-offs.
      'Some payment methods take a few business days, and some funds set an earlier cut-off. Leave yourself a buffer.',
      // VERIFY: fund acknowledgement of notice of intent is needed before lodging the tax return.
      "To claim the deduction you also need your fund's acknowledgement of your notice of intent before you lodge your tax return.",
    ],
    adviserNote: `${adviser.firstName}'s recorded step stands: "Consider a personal super contribution before 30 June." I've only explained the general deadline. I haven't changed or reinterpreted ${adviser.firstName}'s advice.`,
    sources: [sources.atoPersonalContributions],
    options: [
      { label: 'So how much should I put in this year?', next: 'ec-how-much' },
      { label: 'What is a notice of intent?', next: 'ec-noi' },
      BACK,
    ],
  },
  {
    id: 'ec-how-much',
    kind: 'personalAdvice',
    messages: [
      `How much depends on your income so far this year, what you've already contributed and your cash needs. That's personal advice, so it's ${adviser.firstName}'s call, not mine.`,
      // VERIFY: deductible contributions count towards the annual concessional cap; exceeding it can mean extra tax.
      'In general: contributions you claim a deduction for count towards an annual cap, and going over can mean extra tax.',
      'That needs your numbers. Ask your adviser?',
    ],
    sources: [sources.atoConcessionalCap],
    options: [{ label: 'Ask my adviser', next: 'ec-asked', action: 'askAdviser' }, BACK],
  },
  {
    id: 'ec-noi',
    messages: [
      // VERIFY: notice of intent to claim a deduction is an approved form lodged with the fund; acknowledgement required.
      "It's a form you send your super fund saying you plan to claim a tax deduction for a personal contribution. Most funds let you do it online.",
      // VERIFY: fund must acknowledge before you lodge the tax return, withdraw or roll over.
      "Wait for the fund's acknowledgement before you lodge your tax return, withdraw or roll over that money.",
    ],
    sources: [sources.atoNoticeOfIntent, sources.atoPersonalContributions],
    options: [BACK],
  },
  {
    id: 'ec-check',
    messages: [
      "I can't see your super account. I only give general information and don't have access to your records.",
      // VERIFY: contributions can take several business days to reach the fund; members can check via the fund's app or online account.
      "Your fund's app or online account shows contributions once they arrive. Depending on how you paid, that can take a few business days.",
      `If it's close to 30 June and it still hasn't appeared, call your fund, then let ${adviser.firstName} know.`,
    ],
    sources: [sources.msCheckSuper],
    options: [
      { label: "What's the deadline for a deductible super contribution?", next: 'ec-deadline' },
      { label: 'Ask my adviser', next: 'ec-asked', action: 'askAdviser' },
      BACK,
    ],
  },
  {
    id: 'ec-payday',
    messages: [
      // VERIFY: from 1 July 2026, employers must pay super at the same time as salary or wages (Payday Super).
      'From 1 July 2026, employers must pay super at the same time as wages. This is called Payday Super.',
      // VERIFY: under Payday Super, contributions should reach the employee's fund within 7 business days of payday.
      "The money should reach the employee's super fund within 7 business days of payday.",
      "As a sole trader, it doesn't change how you pay your own super. It matters if you hire staff: you'd need to pay their super every payday.",
    ],
    sources: [sources.msPaydaySuper],
    options: [BACK],
  },
  // Rule 5, reached from AI mode: same support card as Flow 1, but the human is her own adviser.
  {
    id: 'ec-distress',
    kind: 'distress',
    messages: [
      `Thanks for telling me. Money stress is really common, and ${adviser.firstName} is there for exactly this.`,
      "I'm an AI, not a support service. These people can properly help:",
    ],
    sources: [sources.ndh, sources.lifeline],
    options: [{ label: 'Ask my adviser', next: 'ec-asked', action: 'askAdviser' }, BACK],
  },
  {
    id: 'ec-asked',
    kind: 'adviser',
    messages: [`Opening a message to ${adviser.firstName} with your question filled in.`],
    options: [BACK],
  },
];

export const existingClientFlow: Flow = {
  id: 'existingClient',
  start: 'ec-start',
  topicsNode: 'ec-topics',
  ai: { handover: { label: 'Ask my adviser', next: 'ec-asked', action: 'askAdviser' }, distressNode: 'ec-distress' },
  nodes: Object.fromEntries(nodes.map((n) => [n.id, n])),
};

// ---------------------------------------------------------------------------
// Ask my adviser (teal)
// ---------------------------------------------------------------------------

export const askAdviser = {
  title: `Ask ${adviser.firstName}`,
  defaultQuestion: 'So how much should I put in this year?',
  contextTitle: `Context ${adviser.firstName} will see`,
  timeSensitiveLabel: 'This is time-sensitive',
  sendLabel: 'Send',
  sentNote: `Sent. ${adviser.firstName} usually replies within 1 business day.`,
  simulateLabel: 'Simulate adviser reply (v0)',
  typing: `${adviser.firstName} is writing a reply…`,
  simulatedAiTag: 'Simulated by AI · v0',
  simulatedScriptTag: 'Scripted demo reply · v0',
  fallbackNote: 'The AI simulation was unavailable, so this is the scripted demo reply.',
  mockNote: 'v0 mock: messages stay on this device. Nothing is sent.',
};

/** Scripted fallback for "Simulate adviser reply" when AI is unavailable. It adds a plan step. */
export const adviserReply = {
  text: `Hi ${client.firstName}, good question, and good timing. Before we pick an amount I'd like to see your income so far this year and what's already gone into super. I've added a step to your plan. Once I have those, we'll settle on a figure in a 15-minute call.`,
  step: {
    id: 'adv-income-ytd',
    text: `Send ${adviser.firstName} your income so far this financial year`,
    detail: 'A rough figure from your accounting software is fine.',
    fromAdviser: true,
  } satisfies PlanStep,
};

// ---------------------------------------------------------------------------
// Correction notice (toggled from the dev panel)
// ---------------------------------------------------------------------------

export const correctionNotice = {
  title: 'Correction: an earlier answer was out of date',
  wrong:
    'An earlier Future You answer about using unused cap amounts from previous years ("carry-forward") described the old eligibility rules.',
  // VERIFY: carry-forward of unused concessional cap amounts from up to five previous years if total super balance was below the threshold at the previous 30 June.
  correct:
    "Correct information: you may be able to use unused concessional cap amounts from up to five previous financial years, but only if your total super balance was below the threshold on 30 June of the previous year. The threshold changes, so check the ATO's current figure.",
  // Story A4: what $RUs is doing about it, so a client can pass it on to family.
  mitigation:
    'What $RUs is doing: the answer was fixed the day it was found, every person who saw it is getting this notice, and an adviser has reviewed each affected conversation. Anyone in your family who used Future You gets the same notice.',
  action: `What to do: if you were planning a catch-up contribution based on that answer, check with ${adviser.firstName} before contributing.`,
  source: sources.atoConcessionalCap,
  dismiss: 'Got it',
};
