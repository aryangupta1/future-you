import { aiHistory } from '../engine/engine';
import { existingClientFlow } from '../content/existingClientFlow';
import { actions, getState } from '../state/store';
import type { AdviserReplyRequest, AdviserReplyResponse } from './types';

// v0: simulates the adviser's reply from the real conversation (her messages,
// her AI chat and her plan) via /api/adviser-reply. If AI is unavailable the
// scripted reply is used instead, so the demo never dead-ends.

const TIMEOUT_MS = 45_000;

export type SimulateResult = { source: 'ai' } | { source: 'scripted'; reason: string };

export async function simulateAdviserReply(): Promise<SimulateResult> {
  const s = getState();
  const req: AdviserReplyRequest = {
    messages: s.adviserThread.map((m) => ({ from: m.from, text: m.text, timeSensitive: m.timeSensitive })),
    chat: aiHistory(existingClientFlow, s.chats.existingClient.thread),
    plan: s.clientPlan.map((p) => ({ text: p.text, done: p.done, fromAdviser: p.fromAdviser })),
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res: AdviserReplyResponse;
  try {
    const r = await fetch('/api/adviser-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: ctrl.signal,
    });
    res = ((await r.json().catch(() => null)) as AdviserReplyResponse | null) ?? {
      type: 'error',
      message: `Unexpected response (${r.status}).`,
    };
  } catch {
    res = { type: 'error', message: "Couldn't reach the server." };
  } finally {
    clearTimeout(timer);
  }

  if (res.type === 'reply') {
    const step = res.step && { id: `adv-${Date.now()}`, text: res.step.text, detail: res.step.detail, fromAdviser: true };
    actions.receiveAdviserReply(res.text, step, 'ai');
    return { source: 'ai' };
  }
  actions.scriptedAdviserReply();
  return { source: 'scripted', reason: res.message };
}
