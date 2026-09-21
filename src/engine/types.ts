// Conversation engine types. Content files in src/content/ are plain data
// shaped by these types, so the hardcoded v0 tree can later be swapped for
// AI-generated nodes without touching the UI.

export type Source = { label: string; url: string };

export type OptionAction = 'savePlan' | 'openPlan' | 'handover' | 'askAdviser' | 'addPlanStep';

export type Option = {
  label: string;
  next: string;
  action?: OptionAction;
  /** Only used with action 'addPlanStep': the step to add to My Plan. */
  planStep?: PlanStep;
};

export type NodeKind = 'normal' | 'personalAdvice' | 'distress' | 'adviser';

export type Node = {
  id: string;
  /** Advisor messages, shown one after another with a short typing indicator. */
  messages: string[];
  /** Optional "Why?" expander with the reasoning. */
  why?: string;
  sources?: Source[];
  /** Controls styling. 'adviser' and 'personalAdvice' hand-offs use the teal accent. */
  kind?: NodeKind;
  /** Buttons the user can choose. The chosen label appears as the user's message. */
  options: Option[];
  /** Topic label used in the adviser summary ("Topics covered"). */
  topic?: string;
  /** A note from the client's human adviser shown alongside the answer (existing clients). */
  adviserNote?: string;
};

export type PlanStep = {
  id: string;
  text: string;
  detail?: string;
  /** true when the step was recorded by a human adviser, not the AI. */
  fromAdviser?: boolean;
  /** Optional in-app link shown on the step, e.g. to book a chat. */
  cta?: { label: string; to: string };
  done?: boolean;
};

export type Flow = {
  id: 'newClient' | 'existingClient';
  start: string;
  nodes: Record<string, Node>;
  /** Id of the topics menu node that "Back to topics" returns to. */
  topicsNode: string;
  /**
   * Offer to build a plan once the user has read this many factual answers
   * (nodes with sources). The message is appended once; the option stays
   * available on every node until a plan is saved.
   */
  planOffer?: { afterAnswers: number; message: string; option: Option };
};
