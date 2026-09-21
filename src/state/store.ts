import { useSyncExternalStore } from 'react';
import type { PlanStep } from '../engine/types';
import type { AiAnswer } from '../ai/types';
import { clientPlanSeed, adviserReply } from '../content/existingClientFlow';

// A tiny app-wide store persisted to localStorage so a returning visitor can
// resume (P4). Every storage access is wrapped in try/catch: private windows
// and blocked storage must not break the app.

export type ThreadEntry =
  | { type: 'user'; text: string }
  | { type: 'node'; nodeId: string; extra?: string[] }
  /** An AI-mode answer. Stored as text because it isn't part of the content tree. */
  | ({ type: 'ai' } & Omit<AiAnswer, 'type'>);

export type ChatState = { thread: ThreadEntry[]; planOffered: boolean };

export type AdviserMessage = {
  from: 'client' | 'adviser';
  text: string;
  timeSensitive?: boolean;
  at: string;
  /** The plan step this reply added, if any. */
  stepId?: string;
  /** v0: 'ai' when generated from the conversation, 'scripted' for the fallback. */
  simulated?: 'ai' | 'scripted';
};

export type Handover = {
  name: string;
  phone: string;
  slot: string;
  includeStress: boolean;
  submittedAt: string;
};

export type ServiceStatus = 'ok' | 'slow' | 'down';

/**
 * Monitoring log (story A6): every digital interaction is recorded so $RUs can
 * review it the way it reviews human advisers. Also feeds the four engagement
 * measures. v0 keeps it on this device only.
 */
export type LogEvent = { at: string } & (
  | { kind: 'visit' }
  | { kind: 'chat'; flow: 'newClient' | 'existingClient'; question: string; nodeId: string }
  | { kind: 'ai'; flow: 'newClient' | 'existingClient'; question: string; outcome: AiAnswer['kind']; sources: number }
  | { kind: 'planSaved' }
  | { kind: 'stepDone'; step: string }
  | { kind: 'handover' }
  | { kind: 'adviserMessage' }
);

export type CheckIns = 'payment' | 'monthly' | 'off';

export type AppState = {
  version: 1;
  chats: { newClient: ChatState; existingClient: ChatState };
  /** New-client plan. null until the AI offers one and the visitor accepts. */
  plan: {
    steps: PlanStep[];
    saved: boolean;
    email?: string;
    emailDone?: boolean;
    /** A private return link instead of an email (journey map: "email or a private link"). */
    privateLink?: string;
    /** P1: check-ins follow her income, not the calendar. Unset until she chooses. */
    checkIns?: CheckIns;
  } | null;
  /** Steps added from the chat before a plan exists. */
  pendingSteps: PlanStep[];
  handover: Handover | null;
  signedIn: boolean;
  clientPlan: PlanStep[];
  adviserThread: AdviserMessage[];
  showCorrection: boolean;
  /** Feature 8: told honestly when the advisor is slow or unavailable. Set from the dev panel in v0. */
  serviceStatus: ServiceStatus;
  log: LogEvent[];
  /** Free-text chat answered by the model, behind the same guardrails. */
  aiMode: boolean;
};

const KEY = 'futureYou.v0';

const emptyChat = (): ChatState => ({ thread: [], planOffered: false });

export const initialState = (): AppState => ({
  version: 1,
  chats: { newClient: emptyChat(), existingClient: emptyChat() },
  plan: null,
  pendingSteps: [],
  handover: null,
  signedIn: false,
  clientPlan: clientPlanSeed.map((s) => ({ ...s })),
  adviserThread: [],
  showCorrection: false,
  serviceStatus: 'ok',
  log: [],
  aiMode: false,
});

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed?.version !== 1) return initialState();
    return { ...initialState(), ...parsed };
  } catch {
    return initialState();
  }
}

let state: AppState = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable: the app keeps working for this session only.
  }
}

export function getState() {
  return state;
}

export function setState(update: (s: AppState) => AppState) {
  state = update(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAppState<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state));
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

const withStep = (steps: PlanStep[], step: PlanStep) =>
  steps.some((s) => s.id === step.id) ? steps : [...steps, { ...step }];

const LOG_LIMIT = 500;
const now = () => new Date().toISOString();

// Omit that keeps the union intact, so each event kind still type-checks.
type NewEvent = LogEvent extends infer E ? (E extends LogEvent ? Omit<E, 'at'> : never) : never;

const withLog = (s: AppState, event: NewEvent, at = now()): AppState => ({
  ...s,
  log: [...s.log, { ...event, at } as LogEvent].slice(-LOG_LIMIT),
});

/** A new visit starts after 30 minutes away. */
const VISIT_GAP_MS = 30 * 60 * 1000;

export const actions = {
  resetAll() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setState(() => initialState());
  },

  addPlanStep(step: PlanStep) {
    setState((s) =>
      s.plan
        ? { ...s, plan: { ...s.plan, steps: withStep(s.plan.steps, step) } }
        : { ...s, pendingSteps: withStep(s.pendingSteps, step) },
    );
  },

  createPlan(template: PlanStep[]) {
    setState((s) => {
      if (s.plan) return s;
      const steps = s.pendingSteps.reduce(withStep, template.map((t) => ({ ...t })));
      return { ...s, plan: { steps, saved: false }, pendingSteps: [] };
    });
  },

  savePlan() {
    setState((s) => (s.plan ? withLog({ ...s, plan: { ...s.plan, saved: true } }, { kind: 'planSaved' }) : s));
  },

  setPrivateLink(link: string) {
    setState((s) => (s.plan ? { ...s, plan: { ...s.plan, privateLink: link, emailDone: true } } : s));
  },

  setCheckIns(checkIns: CheckIns) {
    setState((s) => (s.plan ? { ...s, plan: { ...s.plan, checkIns } } : s));
  },

  setPlanEmail(email: string | undefined) {
    setState((s) => (s.plan ? { ...s, plan: { ...s.plan, email, emailDone: true } } : s));
  },

  togglePlanStep(id: string) {
    setState((s) => {
      if (!s.plan) return s;
      const step = s.plan.steps.find((st) => st.id === id);
      const next = {
        ...s,
        plan: { ...s.plan, steps: s.plan.steps.map((st) => (st.id === id ? { ...st, done: !st.done } : st)) },
      };
      return step && !step.done ? withLog(next, { kind: 'stepDone', step: step.text }) : next;
    });
  },

  toggleClientStep(id: string) {
    setState((s) => {
      const step = s.clientPlan.find((st) => st.id === id);
      const next = { ...s, clientPlan: s.clientPlan.map((st) => (st.id === id ? { ...st, done: !st.done } : st)) };
      return step && !step.done ? withLog(next, { kind: 'stepDone', step: step.text }) : next;
    });
  },

  submitHandover(h: Omit<Handover, 'submittedAt'>) {
    setState((s) => withLog({ ...s, handover: { ...h, submittedAt: now() } }, { kind: 'handover' }));
  },

  signIn() {
    setState((s) => ({ ...s, signedIn: true }));
  },

  signOut() {
    setState((s) => ({ ...s, signedIn: false }));
  },

  sendToAdviser(text: string, timeSensitive: boolean) {
    setState((s) =>
      withLog(
        { ...s, adviserThread: [...s.adviserThread, { from: 'client', text, timeSensitive, at: now() }] },
        { kind: 'adviserMessage' },
      ),
    );
  },

  /** v0: a simulated adviser reply, optionally adding one "From your adviser" plan step. */
  receiveAdviserReply(text: string, step: PlanStep | undefined, simulated: 'ai' | 'scripted') {
    setState((s) => ({
      ...s,
      adviserThread: [...s.adviserThread, { from: 'adviser', text, at: now(), stepId: step?.id, simulated }],
      clientPlan: step ? withStep(s.clientPlan, { ...step, fromAdviser: true }) : s.clientPlan,
    }));
  },

  /** Fallback when AI is unavailable: the hardcoded reply and its plan step. */
  scriptedAdviserReply() {
    actions.receiveAdviserReply(adviserReply.text, adviserReply.step, 'scripted');
  },

  setCorrection(show: boolean) {
    setState((s) => ({ ...s, showCorrection: show }));
  },

  setServiceStatus(serviceStatus: ServiceStatus) {
    setState((s) => ({ ...s, serviceStatus }));
  },

  logChat(flow: 'newClient' | 'existingClient', question: string, nodeId: string) {
    setState((s) => withLog(s, { kind: 'chat', flow, question, nodeId }));
  },

  logAi(flow: 'newClient' | 'existingClient', question: string, outcome: AiAnswer['kind'], sources: number) {
    setState((s) => withLog(s, { kind: 'ai', flow, question, outcome, sources }));
  },

  setAiMode(aiMode: boolean) {
    setState((s) => ({ ...s, aiMode }));
  },

  /** Called once per page load. Counts as a new visit after 30 minutes away. */
  recordVisit() {
    setState((s) => {
      const last = [...s.log].reverse().find((e) => e.kind === 'visit');
      if (last && Date.now() - Date.parse(last.at) < VISIT_GAP_MS) return s;
      return withLog(s, { kind: 'visit' });
    });
  },

  /**
   * Continue the anonymous chat at a given node, as if she had tapped the
   * question herself. Used by the landing page's sample questions and the
   * "A payment just landed" check-in (P1).
   */
  startWithQuestion(question: string, nodeId: string) {
    setState((s) => {
      const chat = s.chats.newClient;
      const thread: ThreadEntry[] = [
        ...(chat.thread.length ? chat.thread : [{ type: 'node' as const, nodeId: 'start' }]),
        { type: 'user', text: question },
        { type: 'node', nodeId },
      ];
      return withLog(
        { ...s, chats: { ...s.chats, newClient: { ...chat, thread } } },
        { kind: 'chat', flow: 'newClient', question, nodeId },
      );
    });
  },

  /** Dev/demo: pretend the first visit was eight days ago, so today counts as a return. */
  simulateReturnVisit() {
    setState((s) => {
      const at = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
      return { ...s, log: [{ kind: 'visit', at } as LogEvent, ...s.log].slice(-LOG_LIMIT) };
    });
  },
};
