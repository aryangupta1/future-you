// Minimal OpenAI Responses API client for structured (JSON-schema) output.
// Shared by every server endpoint; the key is passed in, never read here.

export const AI_MODEL = 'gpt-5-nano';

type Input = { role: 'user' | 'assistant'; content: string }[];

export type StructuredResult<T> = { ok: true; value: T } | { ok: false; status: number; message: string };

function outputText(json: any): string | undefined {
  for (const item of json?.output ?? []) {
    if (item?.type !== 'message') continue;
    for (const c of item.content ?? []) if (c?.type === 'output_text') return c.text;
  }
  return undefined;
}

export async function callStructured<T>(opts: {
  apiKey: string;
  instructions: string;
  input: Input;
  name: string;
  schema: object;
}): Promise<StructuredResult<T>> {
  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opts.apiKey}` },
      body: JSON.stringify({
        model: AI_MODEL,
        instructions: opts.instructions,
        input: opts.input,
        reasoning: { effort: 'minimal' },
        max_output_tokens: 1200,
        store: false,
        text: { format: { type: 'json_schema', name: opts.name, strict: true, schema: opts.schema } },
      }),
    });
  } catch {
    return { ok: false, status: 502, message: "Couldn't reach the AI service." };
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error(`[ai] OpenAI ${res.status}: ${detail.slice(0, 500)}`);
    return { ok: false, status: 502, message: `The AI service returned an error (${res.status}).` };
  }

  try {
    const text = outputText(await res.json());
    if (!text) throw new Error('empty');
    return { ok: true, value: JSON.parse(text) as T };
  } catch {
    return { ok: false, status: 502, message: 'The AI returned an answer I could not read.' };
  }
}
