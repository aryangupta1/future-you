import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { handleChat } from './server/aiChat.js';

// Serves POST /api/chat during `npm run dev` and `npm run preview`, mirroring
// the Vercel function in api/chat.ts. The key comes from .env and stays on the
// server (it has no VITE_ prefix, so it is never bundled).
function aiChatApi(apiKey: string | undefined): Plugin {
  const middleware = (req: any, res: any, next: () => void) => {
    if (req.url !== '/api/chat') return next();
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
      const { status, data } = await handleChat(body, apiKey);
      send(status, data);
    });
  };
  return {
    name: 'ai-chat-api',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), aiChatApi(env.OPENAI_API_KEY)],
  };
});
