// Anthropic Claude client for structured (JSON-schema) output. Used as the
// fallback when OpenAI is unavailable (see ./ai.ts). The key is passed in,
// never read here.

import Anthropic from '@anthropic-ai/sdk';
import { betaJSONSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/beta/json-schema';
import type { StructuredInput, StructuredResult } from './openai.js';

export const CLAUDE_MODEL = 'claude-opus-5-5';

export async function callClaude<T>(opts: {
  apiKey: string;
  instructions: string;
  input: StructuredInput;
  schema: object;
}): Promise<StructuredResult<T>> {
  const client = new Anthropic({ apiKey: opts.apiKey });
  try {
    const response = await client.beta.messages.parse({
      model: CLAUDE_MODEL,
      max_tokens: 16000,
      system: opts.instructions,
      messages: opts.input,
      // Short chat answers: low effort keeps latency down.
      output_config: {
        effort: 'low',
        // The helper strips constraints the API doesn't accept (e.g. maxItems)
        // and checks them client-side instead.
        format: betaJSONSchemaOutputFormat(opts.schema as { type: 'object' }),
      },
      // On a safety decline, the API retries on its default fallback model.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });
    if (response.stop_reason === 'refusal') {
      console.error(`[ai] Claude refused: ${response.stop_details?.category ?? 'unknown'}`);
      return { ok: false, status: 502, message: 'The AI declined to answer that.' };
    }
    if (!response.parsed_output) throw new Error('empty');
    return { ok: true, value: response.parsed_output as T };
  } catch (error) {
    if (error instanceof Anthropic.APIConnectionError) {
      return { ok: false, status: 502, message: "Couldn't reach the AI service." };
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`[ai] Claude ${error.status}: ${error.message.slice(0, 500)}`);
      return { ok: false, status: 502, message: `The AI service returned an error (${error.status}).` };
    }
    return { ok: false, status: 502, message: 'The AI returned an answer I could not read.' };
  }
}
