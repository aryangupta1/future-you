import type { Flow, Node, Option } from './types';
import type { ChatState, ThreadEntry } from '../state/store';
import type { AiAnswer, AiTurn } from '../ai/types';
import { AI_LIMITS } from './guardrails';

type AiEntry = Extract<ThreadEntry, { type: 'ai' }>;

/** An AI answer counts like a factual node when it cites a vetted source. */
const isAiAnswer = (e: AiEntry) => e.kind === 'normal' && e.sources.length > 0;

/** AI answers that must offer a human: personal advice, or nothing to check it against. */
export const aiNeedsHuman = (e: AiEntry) => e.kind === 'personalAdvice' || Boolean(e.unsourced);

// Pure functions over a Flow and a chat thread. No React, no storage, so the
// hardcoded tree can later be replaced by an AI that returns Node objects.

export function getNode(flow: Flow, id: string): Node {
  const node = flow.nodes[id];
  if (!node) throw new Error(`Unknown node "${id}" in flow "${flow.id}"`);
  return node;
}

/** A factual answer = a node with sources that isn't the distress card. */
export function isAnswer(node: Node) {
  return Boolean(node.sources?.length) && node.kind !== 'distress';
}

export function countAnswers(flow: Flow, thread: ThreadEntry[]) {
  const ids = new Set(
    thread.flatMap((e) => (e.type === 'node' && isAnswer(getNode(flow, e.nodeId)) ? [e.nodeId] : [])),
  );
  return ids.size + thread.filter((e) => e.type === 'ai' && isAiAnswer(e)).length;
}

export function startChat(flow: Flow): ChatState {
  return { thread: [{ type: 'node', nodeId: flow.start }], planOffered: false };
}

/** Append the user's choice and the next node. Adds the one-off plan offer when due. */
export function choose(flow: Flow, chat: ChatState, option: Option): ChatState {
  const thread: ThreadEntry[] = [...chat.thread, { type: 'user', text: option.label }];
  const nextEntry: ThreadEntry = { type: 'node', nodeId: option.next };
  thread.push(nextEntry);

  let planOffered = chat.planOffered;
  const offer = flow.planOffer;
  if (
    offer &&
    !planOffered &&
    option.action !== 'savePlan' &&
    isAnswer(getNode(flow, option.next)) &&
    countAnswers(flow, thread) >= offer.afterAnswers
  ) {
    nextEntry.extra = [offer.message];
    planOffered = true;
  }
  return { thread, planOffered };
}

/**
 * Append an AI-mode exchange. Distress never shows model text: it lands on the
 * flow's vetted distress node, exactly as if the chip had been tapped.
 */
export function appendAi(flow: Flow, chat: ChatState, question: string, res: AiAnswer | { type: 'distress' }): ChatState {
  const user: ThreadEntry = { type: 'user', text: question };
  if (res.type === 'distress') {
    const nodeId = flow.ai?.distressNode ?? flow.topicsNode;
    return { ...chat, thread: [...chat.thread, user, { type: 'node', nodeId }] };
  }
  const { type: _type, ...answer } = res;
  return { ...chat, thread: [...chat.thread, user, { type: 'ai', ...answer }] };
}

/** Options for the latest node, including the plan offer once it has been made. */
export function visibleOptions(flow: Flow, chat: ChatState, planExists: boolean): Option[] {
  const last = [...chat.thread].reverse().find((e): e is Exclude<ThreadEntry, { type: 'user' }> => e.type !== 'user');
  if (!last) return [];
  if (last.type === 'ai') {
    // After an AI answer: the human hand-off when it's needed, and a way back to the guided topics.
    const back: Option = { label: 'Back to topics', next: flow.topicsNode };
    return [...(flow.ai && aiNeedsHuman(last) ? [flow.ai.handover] : []), back];
  }
  const node = getNode(flow, last.nodeId);
  const options = node.options;
  const offer = flow.planOffer;
  // Never upsell a plan under the distress card.
  if (!offer || !chat.planOffered || planExists || node.kind === 'distress') return options;
  const backIndex = options.findIndex((o) => o.next === flow.topicsNode);
  const at = backIndex === -1 ? options.length : backIndex;
  return [...options.slice(0, at), offer.option, ...options.slice(at)];
}

export type Summary = {
  topics: string[];
  questions: string[];
  mentionedStress: boolean;
};

/**
 * What a human adviser would see: topics covered and the questions that led to
 * an answer or a personal-advice node. The distress mention is reported
 * separately so the visitor can choose whether to share it.
 */
export function buildSummary(flow: Flow, thread: ThreadEntry[]): Summary {
  const topics: string[] = [];
  const questions: string[] = [];
  let mentionedStress = false;

  thread.forEach((entry, i) => {
    const prev = thread[i - 1];
    if (entry.type === 'ai') {
      if (entry.topic && !topics.includes(entry.topic)) topics.push(entry.topic);
      const counts = entry.kind !== 'offTopic';
      if (counts && prev?.type === 'user' && !questions.includes(prev.text)) questions.push(prev.text);
      return;
    }
    if (entry.type !== 'node') return;
    const node = getNode(flow, entry.nodeId);
    if (node.topic && !topics.includes(node.topic)) topics.push(node.topic);
    if (node.kind === 'distress') mentionedStress = true;
    const counts = isAnswer(node) || node.kind === 'personalAdvice';
    if (counts && prev?.type === 'user' && !questions.includes(prev.text)) questions.push(prev.text);
  });

  return { topics, questions, mentionedStress };
}

/** The most recent question the user chose before landing on a given node type. */
export function lastQuestion(flow: Flow, thread: ThreadEntry[]): string | undefined {
  for (let i = thread.length - 1; i > 0; i--) {
    const entry = thread[i];
    const prev = thread[i - 1];
    if (entry.type === 'ai' && prev.type === 'user' && entry.kind !== 'offTopic') return prev.text;
    if (entry.type === 'node' && prev.type === 'user') {
      const node = getNode(flow, entry.nodeId);
      if (isAnswer(node) || node.kind === 'personalAdvice') return prev.text;
    }
  }
  return undefined;
}

/** The recent conversation as plain turns for the model, scripted answers included. */
export function aiHistory(flow: Flow, thread: ThreadEntry[]): AiTurn[] {
  const turns: AiTurn[] = thread.map((e) =>
    e.type === 'user'
      ? { role: 'user', text: e.text }
      : { role: 'assistant', text: (e.type === 'ai' ? e.reply : [...getNode(flow, e.nodeId).messages, ...(e.extra ?? [])]).join('\n') },
  );
  return turns.slice(-AI_LIMITS.historyTurns).map((t) => ({ ...t, text: t.text.slice(0, AI_LIMITS.historyChars) }));
}

/** Dev-time check: every option points at a node that exists. Returns problems found. */
export function validateFlow(flow: Flow): string[] {
  const problems: string[] = [];
  if (!flow.nodes[flow.start]) problems.push(`start node "${flow.start}" missing`);
  if (!flow.nodes[flow.topicsNode]) problems.push(`topics node "${flow.topicsNode}" missing`);
  if (flow.ai && !flow.nodes[flow.ai.distressNode]) problems.push(`AI distress node "${flow.ai.distressNode}" missing`);
  if (flow.ai && !flow.nodes[flow.ai.handover.next]) problems.push(`AI handover points at missing "${flow.ai.handover.next}"`);
  const offerNext = flow.planOffer?.option.next;
  if (offerNext && !flow.nodes[offerNext]) problems.push(`plan offer points at missing "${offerNext}"`);
  for (const node of Object.values(flow.nodes)) {
    for (const o of node.options) {
      if (!flow.nodes[o.next]) problems.push(`"${node.id}" option "${o.label}" points at missing "${o.next}"`);
      if (o.action === 'addPlanStep' && !o.planStep) problems.push(`"${node.id}" option "${o.label}" has no planStep`);
    }
  }
  return problems.map((p) => `[${flow.id}] ${p}`);
}
