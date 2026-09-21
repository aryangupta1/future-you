// Vercel Function: POST /api/adviser-reply (simulated adviser reply, v0).

import { handleAdviserReply } from '../server/adviserReply.js';

declare const process: { env: Record<string, string | undefined> };

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const { status, data } = await handleAdviserReply(body, process.env.OPENAI_API_KEY);
  return Response.json(data, { status });
}
