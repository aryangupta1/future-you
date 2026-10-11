// Picks the model provider for every server endpoint: OpenAI first, Claude
// when OpenAI is unavailable (no key, unreachable, an error status or an
// unreadable answer). Guardrails live in the callers and apply to both.

import { callClaude } from './anthropic.js';
import { callStructured as callOpenAI, type StructuredInput, type StructuredResult } from './openai.js';

export type AiKeys = { openai?: string; anthropic?: string };

export const NO_KEY_MESSAGE = 'AI mode is not configured: set OPENAI_API_KEY or ANTHROPIC_API_KEY (or API_KEY) on the server.';

export function hasAiKey(keys: AiKeys) {
  return Boolean(keys.openai || keys.anthropic);
}

export async function callStructured<T>(opts: {
  keys: AiKeys;
  instructions: string;
  input: StructuredInput;
  name: string;
  schema: object;
}): Promise<StructuredResult<T>> {
  const { keys, ...rest } = opts;
  let result: StructuredResult<T> | undefined;
  if (keys.openai) {
    result = await callOpenAI<T>({ apiKey: keys.openai, ...rest });
    if (result.ok || !keys.anthropic) return result;
    console.warn('[ai] OpenAI unavailable, falling back to Claude.');
  }
  if (keys.anthropic) return callClaude<T>({ apiKey: keys.anthropic, ...rest });
  return result ?? { ok: false, status: 500, message: NO_KEY_MESSAGE };
}
