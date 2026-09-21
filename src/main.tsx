import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './index.css';
import { validateFlow } from './engine/engine';
import { newClientFlow } from './content/newClientFlow';
import { existingClientFlow } from './content/existingClientFlow';
import { actions } from './state/store';

if (import.meta.env.DEV) {
  const problems = [newClientFlow, existingClientFlow].flatMap(validateFlow);
  if (problems.length) console.error('Conversation content problems:\n' + problems.join('\n'));
}

// Feeds the 'returns within 30 days' measure.
actions.recordVisit();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
