import type { Source } from '../engine/types';

// Wire format between the Chat and /api/chat. Shared by both sides.

export type AiFlow = 'newClient' | 'existingClient';

export type AiTurn = { role: 'user' | 'assistant'; text: string };

export type AiRequest = {
  flow: AiFlow;
  question: string;
  /** Earlier turns, oldest first. Trimmed by the client and again by the server. */
  history: AiTurn[];
};

export type AiAnswerKind = 'normal' | 'personalAdvice' | 'offTopic';

export type AiAnswer = {
  type: 'answer';
  reply: string[];
  kind: AiAnswerKind;
  why?: string;
  /** Only ever drawn from the vetted list in src/content/sources.ts. */
  sources: Source[];
  topic?: string;
  /** A factual-looking answer the model couldn't tie to a vetted source. */
  unsourced?: boolean;
};

export type AiResponse =
  | AiAnswer
  /** Distress detected: the client shows the pre-written support card, not model text. */
  | { type: 'distress' }
  | { type: 'error'; message: string };
