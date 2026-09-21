import type { AiRequest, AiResponse } from './types';

// Browser side of AI mode. Talks only to our own /api/chat: the OpenAI key
// never leaves the server.

const TIMEOUT_MS = 45_000;

export async function askAi(req: AiRequest): Promise<AiResponse> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: ctrl.signal,
    });
    const data = (await res.json().catch(() => null)) as AiResponse | null;
    if (!data) return { type: 'error', message: `The server returned an unexpected response (${res.status}).` };
    return data;
  } catch (e) {
    const timedOut = e instanceof DOMException && e.name === 'AbortError';
    return { type: 'error', message: timedOut ? 'The AI took too long to answer.' : "Couldn't reach the server." };
  } finally {
    clearTimeout(timer);
  }
}
