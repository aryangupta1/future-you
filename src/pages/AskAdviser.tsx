import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adviser, askAdviser, existingClientFlow } from '../content/existingClientFlow';
import { buildSummary } from '../engine/engine';
import { actions, useAppState } from '../state/store';
import { AdviserAvatar, FromAdviserTag, Page, V0Note, btn, inputCls } from '../components/ui';
import { ArrowLeftIcon } from '../components/icons';
import { simulateAdviserReply } from '../ai/adviser';

export function AskAdviser() {
  const location = useLocation();
  const prefill = (location.state as { question?: string } | null)?.question ?? askAdviser.defaultQuestion;
  const thread = useAppState((s) => s.adviserThread);
  const plan = useAppState((s) => s.clientPlan);
  const chatThread = useAppState((s) => s.chats.existingClient.thread);
  const [text, setText] = useState(thread.some((m) => m.from === 'client') ? '' : prefill);
  const [timeSensitive, setTimeSensitive] = useState(false);
  const [replying, setReplying] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);

  const simulate = async () => {
    setReplying(true);
    setFallbackReason(null);
    const result = await simulateAdviserReply();
    setReplying(false);
    if (result.source === 'scripted') setFallbackReason(result.reason);
  };

  const asked = buildSummary(existingClientFlow, chatThread).questions;
  const hasSent = thread.some((m) => m.from === 'client');
  const hasReply = thread.some((m) => m.from === 'adviser');
  const lastIsClient = thread.at(-1)?.from === 'client';
  const lastReply = [...thread].reverse().find((m) => m.from === 'adviser');
  const newStep = lastReply?.stepId ? plan.find((s) => s.id === lastReply.stepId) : undefined;

  return (
    <Page>
      <Link to="/dashboard" className={`${btn.ghost} mb-6`}>
        <ArrowLeftIcon width={16} height={16} /> Back to my dashboard
      </Link>
      <div className="flex items-center gap-3">
        <AdviserAvatar initials={adviser.initials} size={48} />
        <div>
          <h1 className="display text-[34px]">{askAdviser.title}</h1>
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
                  m.from === 'client' ? 'rounded-br-md border border-ink bg-ink text-white' : 'rounded-bl-md border border-ink bg-accent-tint text-ink'
                }`}
              >
                {m.from === 'adviser' && (
                  <p className="mb-1 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-accent">
                    {adviser.name}
                    {m.simulated && (
                      <span className="rounded-full border border-ink/40 bg-white px-1.5 text-[11px] font-medium text-neutral-700">
                        {m.simulated === 'ai' ? askAdviser.simulatedAiTag : askAdviser.simulatedScriptTag}
                      </span>
                    )}
                  </p>
                )}
                <span className="whitespace-pre-line">{m.text}</span>
                {m.timeSensitive && <p className="mt-1 text-[12px] text-white/75">Marked time-sensitive</p>}
              </div>
            </li>
          ))}
        </ol>
      )}

      {replying && (
        <div className="mt-3 flex items-center gap-2 text-[14px] text-neutral-700" role="status">
          <AdviserAvatar initials={adviser.initials} size={28} />
          {askAdviser.typing}
        </div>
      )}

      {lastIsClient && !replying && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] text-neutral-600">{askAdviser.sentNote}</p>
          <button type="button" className={`${btn.adviserOutline} !py-2 text-[14px]`} onClick={() => void simulate()}>
            {askAdviser.simulateLabel}
          </button>
        </div>
      )}

      {fallbackReason && (
        <V0Note>
          {askAdviser.fallbackNote} ({fallbackReason})
        </V0Note>
      )}

      {hasReply && newStep && (
        <div className="card mt-4 !bg-accent-tint p-4">
          <FromAdviserTag label="Added to your plan" />
          <p className="mt-2 text-[15px] font-medium">{newStep.text}</p>
          <Link to="/dashboard" className="mt-2 inline-block text-[14px] font-medium text-accent underline underline-offset-4">
            See your plan
          </Link>
        </div>
      )}

      <form
        className="card mt-6 p-4 sm:p-5"
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

        <div className="mt-3 rounded-xl border border-ink/30 bg-accent-tint p-3 text-[14px]">
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
            className="h-4 w-4 accent-[#075b72]"
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
