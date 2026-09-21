import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { actions, useAppState, type ServiceStatus } from '../state/store';
import { countAnswers } from '../engine/engine';
import { simulateAdviserReply } from '../ai/adviser';
import { newClientFlow } from '../content/newClientFlow';

// Toggle with "D" (or the footer link on a phone). Demo helpers only.

const listeners = new Set<() => void>();
export const toggleDevPanel = () => listeners.forEach((l) => l());

export function DevPanel() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const showCorrection = useAppState((s) => s.showCorrection);
  const answers = useAppState((s) => countAnswers(newClientFlow, s.chats.newClient.thread));
  const planState = useAppState((s) => (s.plan ? (s.plan.saved ? 'saved' : 'draft') : 'none'));
  const signedIn = useAppState((s) => s.signedIn);
  const serviceStatus = useAppState((s) => s.serviceStatus);

  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    listeners.add(toggle);
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'd' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      listeners.delete(toggle);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  if (!open) return null;

  const item = 'w-full rounded-lg border border-neutral-700 px-3 py-2 text-left text-[13px] hover:bg-neutral-800';

  return (
    <aside
      aria-label="Developer panel"
      className="fixed inset-x-3 bottom-3 z-50 rounded-2xl bg-neutral-950 p-4 text-white shadow-2xl sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-72"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold">Dev panel · v0</p>
        <button type="button" onClick={() => setOpen(false)} className="text-[13px] text-neutral-400 hover:text-white">
          Close (D)
        </button>
      </div>
      <p className="mb-3 text-[12px] text-neutral-400">
        Answers read: {answers} · Plan: {planState} · Signed in: {signedIn ? 'yes' : 'no'}
      </p>
      <div className="space-y-2">
        <button type="button" className={item} onClick={() => navigate('/')}>
          Jump to Flow 1 (new client)
        </button>
        <button
          type="button"
          className={item}
          onClick={() => {
            actions.signIn();
            navigate('/dashboard');
          }}
        >
          Jump to Flow 2 (existing client)
        </button>
        <button
          type="button"
          className={item}
          onClick={() => {
            navigate('/ask-adviser');
            void simulateAdviserReply();
          }}
        >
          Simulate adviser reply
        </button>
        <label className={`${item} flex cursor-pointer items-center justify-between`}>
          Show correction notice
          <input
            type="checkbox"
            checked={showCorrection}
            onChange={(e) => actions.setCorrection(e.target.checked)}
            className="h-4 w-4 accent-white"
          />
        </label>
        <label className={`${item} flex items-center justify-between gap-2`}>
          Advisor status
          <select
            value={serviceStatus}
            onChange={(e) => actions.setServiceStatus(e.target.value as ServiceStatus)}
            className="rounded bg-neutral-800 px-1.5 py-0.5 text-[13px]"
          >
            <option value="ok">Normal</option>
            <option value="slow">Slow</option>
            <option value="down">Unavailable</option>
          </select>
        </label>
        <button type="button" className={item} onClick={actions.simulateReturnVisit}>
          Simulate a return visit (first visit 8 days ago)
        </button>
        <button type="button" className={item} onClick={() => navigate('/staff')}>
          Open $RUs staff view
        </button>
        <button
          type="button"
          className={`${item} border-red-400/60 text-red-200`}
          onClick={() => {
            actions.resetAll();
            navigate('/');
          }}
        >
          Reset all state
        </button>
      </div>
    </aside>
  );
}
