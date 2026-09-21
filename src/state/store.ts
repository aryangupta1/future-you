import { useSyncExternalStore } from 'react';
import type { PlanStep } from '../engine/types';
import { clientPlanSeed, adviserReply } from '../content/existingClientFlow';

// A tiny app-wide store persisted to localStorage so a returning visitor can
// resume (P4). Every storage access is wrapped in try/catch: private windows
// and blocked storage must not break the app.

export type ThreadEntry =
  | { type: 'user'; text: string }
  | { type: 'node'; nodeId: string; extra?: string[] };

export type ChatState = { thread: ThreadEntry[]; planOffered: boolean };

export type AdviserMessage = {
  from: 'client' | 'adviser';
  text: string;
  timeSensitive?: boolean;
  at: string;
};

export type Handover = {
  name: string;
  phone: string;
  slot: string;
  includeStress: boolean;
  submittedAt: string;
};

export type AppState = {
  version: 1;
  chats: { newClient: ChatState; existingClient: ChatState };
  /** New-client plan. null until the AI offers one and the visitor accepts. */
  plan: { steps: PlanStep[]; saved: boolean; email?: string; emailDone?: boolean } | null;
  /** Steps added from the chat before a plan exists. */
  pendingSteps: PlanStep[];
  handover: Handover | null;
  signedIn: boolean;
  clientPlan: PlanStep[];
  adviserThread: AdviserMessage[];
  showCorrection: boolean;
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
    setState((s) => (s.plan ? { ...s, plan: { ...s.plan, saved: true } } : s));
  },

  setPlanEmail(email: string | undefined) {
    setState((s) => (s.plan ? { ...s, plan: { ...s.plan, email, emailDone: true } } : s));
  },

  togglePlanStep(id: string) {
    setState((s) =>
      s.plan
        ? {
            ...s,
            plan: {
              ...s.plan,
              steps: s.plan.steps.map((st) => (st.id === id ? { ...st, done: !st.done } : st)),
            },
          }
        : s,
    );
  },

  toggleClientStep(id: string) {
    setState((s) => ({
      ...s,
      clientPlan: s.clientPlan.map((st) => (st.id === id ? { ...st, done: !st.done } : st)),
    }));
  },

  submitHandover(h: Omit<Handover, 'submittedAt'>) {
    setState((s) => ({ ...s, handover: { ...h, submittedAt: new Date().toISOString() } }));
  },

  signIn() {
    setState((s) => ({ ...s, signedIn: true }));
  },

  signOut() {
    setState((s) => ({ ...s, signedIn: false }));
  },

  sendToAdviser(text: string, timeSensitive: boolean) {
    setState((s) => ({
      ...s,
      adviserThread: [
        ...s.adviserThread,
        { from: 'client', text, timeSensitive, at: new Date().toISOString() },
      ],
    }));
  },

  /** Dev/demo: adds the hardcoded adviser reply and its plan step. */
  simulateAdviserReply() {
    setState((s) => ({
      ...s,
      adviserThread: [
        ...s.adviserThread,
        { from: 'adviser', text: adviserReply.text, at: new Date().toISOString() },
      ],
      clientPlan: withStep(s.clientPlan, adviserReply.step),
    }));
  },

  setCorrection(show: boolean) {
    setState((s) => ({ ...s, showCorrection: show }));
  },
};
