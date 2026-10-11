import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { handleChat } from './server/aiChat.js';
import { handleAdviserReply } from './server/adviserReply.js';
import type { AiKeys } from './server/ai.js';

type Handler = (body: unknown, keys: AiKeys) => Promise<{ status: number; data: unknown }>;

// Serves the /api routes during `npm run dev` and `npm run preview`, mirroring
// the Vercel functions in api/. The keys come from .env and stay on the
// server (they have no VITE_ prefix, so they are never bundled).
const routes: Record<string, Handler> = {
  '/api/chat': handleChat,
  '/api/adviser-reply': handleAdviserReply,
};

function aiApi(keys: AiKeys): Plugin {
  const middleware = (req: any, res: any, next: () => void) => {
    const handler = routes[req.url];
    if (!handler) return next();
    const send = (status: number, data: unknown) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };
    if (req.method !== 'POST') return send(405, { type: 'error', message: 'Use POST.' });
    let raw = '';
    req.on('data', (chunk: string) => {
      raw += chunk;
      if (raw.length > 64_000) req.destroy();
    });
    req.on('end', async () => {
      let body: unknown = null;
      try {
        body = JSON.parse(raw);
      } catch {
        /* handled by handleChat */
      }
      const { status, data } = await handler(body, keys);
      send(status, data);
    });
  };
  return {
    name: 'ai-api',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), aiApi({ openai: env.OPENAI_API_KEY, anthropic: env.ANTHROPIC_API_KEY || env.API_KEY })],
  };
});
