// Vercel Function: POST /api/chat. Set OPENAI_API_KEY (and ANTHROPIC_API_KEY
// for the Claude fallback) in the Vercel project's environment variables. Local dev uses the middleware in vite.config.ts.

import { handleChat } from '../server/aiChat.js';

declare const process: { env: Record<string, string | undefined> };

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const { status, data } = await handleChat(body, {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY || process.env.API_KEY,
  });
  return Response.json(data, { status });
}
