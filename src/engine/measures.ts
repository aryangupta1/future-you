import type { Flow } from './types';
import type { LogEvent } from '../state/store';
import { isAnswer } from './engine';

// Pure functions over the monitoring log: the four engagement measures
// (feature 9) and how each logged exchange is classified for review (A6).

const DAY_MS = 24 * 60 * 60 * 1000;
const dayOf = (iso: string) => new Date(iso).toDateString();

export type Measures = {
  firstConversation: boolean;
  returned: boolean;
  planMoved: boolean;
  handover: boolean;
};

export function computeMeasures(log: LogEvent[], flows: Record<string, Flow>): Measures {
  const answers = log.filter((e) => {
    if (e.kind !== 'chat') return false;
    const node = flows[e.flow]?.nodes[e.nodeId];
    return Boolean(node && isAnswer(node));
  });
  const visits = log.filter((e) => e.kind === 'visit').map((e) => e.at).sort();
  const first = visits[0];
  const returned =
    first !== undefined &&
    visits.some((v) => dayOf(v) !== dayOf(first) && Date.parse(v) - Date.parse(first) <= 30 * DAY_MS);

  return {
    firstConversation: answers.length >= 2,
    returned,
    planMoved: log.some((e) => e.kind === 'stepDone'),
    handover: log.some((e) => e.kind === 'handover' || e.kind === 'adviserMessage'),
  };
}

export type Outcome = { label: string; flagged: boolean; reason?: string };

/** What the advisor did in a logged exchange, and whether a human should look at it. */
export function classify(event: LogEvent, flows: Record<string, Flow>): Outcome {
  switch (event.kind) {
    case 'visit':
      return { label: 'Visit started', flagged: false };
    case 'planSaved':
      return { label: 'Plan saved', flagged: false };
    case 'stepDone':
      return { label: `Plan step done: ${event.step}`, flagged: false };
    case 'handover':
      return { label: 'Handover booked with a summary', flagged: false };
    case 'adviserMessage':
      return { label: 'Message sent to their adviser', flagged: false };
    case 'chat': {
      const node = flows[event.flow]?.nodes[event.nodeId];
      if (!node) return { label: `Unknown node "${event.nodeId}"`, flagged: true, reason: 'Content missing' };
      if (node.kind === 'distress')
        return { label: 'Distress: support card shown, human offered', flagged: true, reason: 'Distress language' };
      if (node.kind === 'personalAdvice')
        return {
          label: 'Advice line: general rules only, human offered',
          flagged: true,
          reason: 'Asked for personal advice',
        };
      if (node.kind === 'adviser') return { label: 'Handed to a person', flagged: false };
      if (isAnswer(node))
        return {
          label: `General answer · ${node.sources!.length} source${node.sources!.length > 1 ? 's' : ''}`,
          flagged: false,
        };
      return { label: 'Navigation', flagged: false };
    }
  }
}
