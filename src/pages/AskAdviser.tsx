import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adviser, askAdviser, existingClientFlow } from '../content/existingClientFlow';
import { buildSummary } from '../engine/engine';
import { actions, useAppState } from '../state/store';
import { AdviserAvatar, FromAdviserTag, Page, V0Note, btn, inputCls } from '../components/ui';
import { ArrowLeftIcon } from '../components/icons';

export function AskAdviser() {
  const location = useLocation();
  const prefill = (location.state as { question?: string } | null)?.question ?? askAdviser.defaultQuestion;
  const thread = useAppState((s) => s.adviserThread);
  const plan = useAppState((s) => s.clientPlan);
  const chatThread = useAppState((s) => s.chats.existingClient.thread);
  const [text, setText] = useState(thread.some((m) => m.from === 'client') ? '' : prefill);
  const [timeSensitive, setTimeSensitive] = useState(false);

  const asked = buildSummary(existingClientFlow, chatThread).questions;
  const hasSent = thread.some((m) => m.from === 'client');
  const hasReply = thread.some((m) => m.from === 'adviser');
  const lastIsClient = thread.at(-1)?.from === 'client';
  const newStep = plan.find((s) => s.id === 'adv-income-ytd');

  return (
    <Page>
      <Link to="/dashboard" className={`${btn.ghost} mb-6`}>
        <ArrowLeftIcon width={16} height={16} /> Back to my dashboard
      </Link>
      <div className="flex items-center gap-3">
        <AdviserAvatar initials={adviser.initials} size={48} />
        <div>
          <h1 className="text-[24px] font-semibold leading-tight tracking-tight">{askAdviser.title}</h1>
          <p className="text-[13px] text-neutral-600">
            {adviser.role} · {adviser.replyTime}
          </p>
        </div>
      </div>

      {thread.length > 0 && (
        <ol className="mt-6 space-y-3" aria-label={`Messages with ${adviser.firstName}`}>
          {thread.map((m, i) => (
            <li key={i} className={`flex ${m.from === 'client' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                  m.from === 'client' ? 'rounded-br-md bg-neutral-950 text-white' : 'rounded-bl-md bg-accent-tint text-neutral-950'
                }`}
              >
                {m.from === 'adviser' && <p className="mb-1 text-[13px] font-semibold text-accent">{adviser.name}</p>}
                {m.text}
                {m.timeSensitive && <p className="mt-1 text-[12px] text-white/75">Marked time-sensitive</p>}
              </div>
            </li>
          ))}
        </ol>
      )}

      {lastIsClient && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] text-neutral-600">{askAdviser.sentNote}</p>
          <button type="button" className={`${btn.adviserOutline} !py-2 text-[14px]`} onClick={actions.simulateAdviserReply}>
            {askAdviser.simulateLabel}
          </button>
        </div>
      )}

      {hasReply && newStep && (
        <div className="mt-4 rounded-2xl border border-accent/40 p-4">
          <FromAdviserTag label="Added to your plan" />
          <p className="mt-2 text-[15px] font-medium">{newStep.text}</p>
          <Link to="/dashboard" className="mt-2 inline-block text-[14px] font-medium text-accent underline underline-offset-4">
            See your plan
          </Link>
        </div>
      )}

      <form
        className="mt-6 rounded-2xl border-2 border-accent/40 p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          actions.sendToAdviser(text.trim(), timeSensitive);
          setText('');
          setTimeSensitive(false);
        }}
      >
        <label htmlFor="msg" className="mb-1.5 block text-[14px] font-medium">
          {hasSent ? 'Send another message' : 'Your question'}
        </label>
        <textarea id="msg" rows={3} value={text} onChange={(e) => setText(e.target.value)} className={`${inputCls} resize-y`} />

        <div className="mt-3 rounded-xl bg-neutral-50 p-3 text-[14px]">
          <p className="font-medium">{askAdviser.contextTitle}</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-neutral-700">
            <li>Your plan ({plan.filter((s) => s.done).length} of {plan.length} steps done)</li>
            {asked.length > 0 && <li>Questions you asked the AI: {asked.join('; ')}</li>}
          </ul>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3 text-[15px]">
          <input
            type="checkbox"
            checked={timeSensitive}
            onChange={(e) => setTimeSensitive(e.target.checked)}
            className="h-4 w-4 accent-[#0f6e6e]"
          />
          {askAdviser.timeSensitiveLabel}
        </label>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-neutral-600">{adviser.replyTime}</p>
          <button type="submit" className={btn.adviser} disabled={!text.trim()}>
            {askAdviser.sendLabel}
          </button>
        </div>
      </form>
      <V0Note>{askAdviser.mockNote}</V0Note>
    </Page>
  );
}
