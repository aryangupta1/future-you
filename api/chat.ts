// Vercel Function: POST /api/chat. Set OPENAI_API_KEY in the Vercel project's
// environment variables. Local dev uses the middleware in vite.config.ts.

import { handleChat } from '../server/aiChat.js';

declare const process: { env: Record<string, string | undefined> };

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const { status, data } = await handleChat(body, process.env.OPENAI_API_KEY);
  return Response.json(data, { status });
}
