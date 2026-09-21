import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Flow, Node, Option, OptionAction, PlanStep } from '../engine/types';
import { aiHistory, aiNeedsHuman, appendAi, choose, getNode, startChat, visibleOptions } from '../engine/engine';
import { AI_LIMITS, detectDistress } from '../engine/guardrails';
import { askAi } from '../ai/client';
import { aiMode } from '../content/ai';
import { actions, getState, setState, useAppState, type AppState, type ThreadEntry } from '../state/store';
import { supportCard } from '../content/newClientFlow';
import { chatUnavailable, serviceStatus } from '../content/service';
import { AdviserNote, SourceList, Why, btn } from './ui';
import { ChatBubbleIcon, PersonIcon, PhoneIcon } from './icons';
import { toggleDevPanel } from './DevPanel';

type ChatKey = keyof AppState['chats'];

type Props = {
  flow: Flow;
  chatKey: ChatKey;
  /** Used by the 'savePlan' action to create the plan. */
  planTemplate?: PlanStep[];
  /** Navigation actions run after the next node has finished "typing". */
  onNavigate: (action: Exclude<OptionAction, 'addPlanStep'>) => void;
  /** Optional element on the left of the chat header, e.g. a back link. */
  leading?: ReactNode;
  /** Small system note shown at the top of the thread. */
  startNote?: string;
};

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Short typing pauses: P4/P5, she has no time for theatre.
const typingDelay = (text: string) => (reducedMotion() ? 0 : Math.min(350 + text.length * 5, 1000));

type BotEntry = Exclude<ThreadEntry, { type: 'user' }>;

const messagesOf = (flow: Flow, entry: BotEntry) =>
  entry.type === 'ai' ? entry.reply : [...getNode(flow, entry.nodeId).messages, ...(entry.extra ?? [])];

/** AI answers render through NodeView, so they get the same bubbles, "Why?" and sources. */
const aiAsNode = (entry: Extract<ThreadEntry, { type: 'ai' }>): Node => ({
  id: 'ai',
  messages: entry.reply,
  kind: entry.kind === 'personalAdvice' ? 'personalAdvice' : 'normal',
  why: entry.why,
  sources: entry.sources,
  options: [],
});

/**
 * Full-height chat window: header bar, scrolling thread, and a reply tray
 * pinned to the bottom. The tray holds quick-reply chips instead of a text
 * box (v0 has no free-text input).
 */
export function Chat({ flow, chatKey, planTemplate, onNavigate, leading, startNote }: Props) {
  const chat = useAppState((s) => s.chats[chatKey]);
  const planExists = useAppState((s) => s.plan !== null);
  const status = useAppState((s) => s.serviceStatus);
  const aiOn = useAppState((s) => s.aiMode) && Boolean(flow.ai);
  const [draft, setDraft] = useState('');
  /** The question waiting on the model, shown as a user bubble until the answer lands. */
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [aiError, setAiError] = useState<{ question: string; message: string } | null>(null);
  // Index of the thread entry currently being revealed, and how many of its
  // messages are visible. Not persisted: a reload shows everything at once.
  const [animating, setAnimating] = useState<{ index: number; shown: number } | null>(null);
  const pendingNav = useRef<Exclude<OptionAction, 'addPlanStep'> | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const navigateRef = useRef(onNavigate);
  navigateRef.current = onNavigate;

  const setChat = (next: typeof chat) =>
    setState((s) => ({ ...s, chats: { ...s.chats, [chatKey]: next } }));

  // Start the conversation with the disclosure node.
  useEffect(() => {
    if (chat.thread.length === 0) {
      setChat(startChat(flow));
      setAnimating({ index: 0, shown: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reveal messages one by one.
  useEffect(() => {
    if (!animating) return;
    const entry = chat.thread[animating.index];
    if (!entry || entry.type === 'user') {
      setAnimating(null);
      return;
    }
    const msgs = messagesOf(flow, entry);
    if (animating.shown >= msgs.length) {
      setAnimating(null);
      return;
    }
    const t = setTimeout(
      () => setAnimating({ index: animating.index, shown: animating.shown + 1 }),
      typingDelay(msgs[animating.shown]),
    );
    return () => clearTimeout(t);
  }, [animating, chat.thread, flow]);

  // Once the hand-off message has finished, move to the target page.
  useEffect(() => {
    if (animating || !pendingNav.current) return;
    const nav = pendingNav.current;
    const t = setTimeout(() => {
      pendingNav.current = null;
      navigateRef.current(nav);
    }, reducedMotion() ? 0 : 600);
    return () => clearTimeout(t);
  }, [animating]);

  // Keep the newest message in view. Jump on first render, glide after that.
  const firstScroll = useRef(true);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const smooth = !firstScroll.current && !reducedMotion();
    firstScroll.current = false;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }, [animating, chat.thread.length, pendingQuestion, aiError]);

  const onChoose = (option: Option) => {
    if (animating) return;
    if (option.action === 'addPlanStep' && option.planStep) actions.addPlanStep(option.planStep);
    if (option.action === 'savePlan' && planTemplate) actions.createPlan(planTemplate);
    if (option.action && option.action !== 'addPlanStep') pendingNav.current = option.action;
    actions.logChat(flow.id, option.label, option.next);
    const next = choose(flow, chat, option);
    setChat(next);
    setAnimating({ index: next.thread.length - 1, shown: 0 });
  };

  // AI mode: free text, same guardrails. Distress is caught here before any
  // network call and lands on the vetted support card.
  const sendAi = async (raw: string) => {
    const question = raw.trim().slice(0, AI_LIMITS.questionChars);
    if (!question || animating || pendingQuestion || !flow.ai) return;
    setAiError(null);
    setDraft('');
    const history = aiHistory(flow, chat.thread);
    const showDistress = () => {
      const next = appendAi(flow, chat, question, { type: 'distress' });
      actions.logChat(flow.id, question, flow.ai!.distressNode);
      setChat(next);
      setAnimating({ index: next.thread.length - 1, shown: 0 });
    };
    if (detectDistress(question)) return showDistress();

    setPendingQuestion(question);
    const res = await askAi({ flow: flow.id, question, history });
    setPendingQuestion(null);
    if (res.type === 'error') return setAiError({ question, message: res.message });
    if (res.type === 'distress') return showDistress();
    // Read the latest thread: the user may have tapped nothing, but state could have moved on.
    const current = getState().chats[chatKey];
    const next = appendAi(flow, current, question, res);
    actions.logAi(flow.id, question, res.kind, res.sources.length);
    setChat(next);
    setAnimating({ index: next.thread.length - 1, shown: 0 });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendAi(draft);
  };

  const allOptions = visibleOptions(flow, chat, planExists);
  // In AI mode the text box replaces topic chips; only actions (a person, the plan) stay as chips.
  const options = aiOn ? allOptions.filter((o) => o.action && o.action !== 'addPlanStep') : allOptions;
  const busy = animating !== null || pendingNav.current !== null || pendingQuestion !== null;

  return (
    <div className="flex h-[calc(100dvh-3.5rem-1px)] flex-col">
      {/* Chat header bar */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2.5 sm:px-6">
          {leading}
          <AIAvatar size={36} />
          <div className="min-w-0 leading-tight">
            <p className="flex items-center gap-1.5 text-[15px] font-semibold">
              Future You <AIBadge />
            </p>
            <p className="truncate text-[12px] text-neutral-600">
              {pendingQuestion
                ? aiMode.thinking
                : busy && animating
                ? 'Typing…'
                : status === 'ok'
                  ? 'General information only · replies instantly'
                  : serviceStatus[status].chatSubtitle}
            </p>
          </div>
          {flow.ai && <AiToggle on={aiOn} />}
        </div>
      </div>

      {/* Thread */}
      <div ref={scrollerRef} className="flex-1 overflow-y-auto overscroll-contain bg-white">
        <ol className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6" aria-live="polite" aria-relevant="additions">
          {startNote && (
            <li className="flex justify-center">
              <p className="rounded-full bg-neutral-100 px-3 py-1 text-center text-[12px] text-neutral-600">{startNote}</p>
            </li>
          )}
          {chat.thread.map((entry, i) => {
            if (entry.type === 'user') {
              return (
                <li key={i} className="fade-up flex justify-end pl-10">
                  <p className="max-w-[85%] rounded-[20px] rounded-br-md bg-neutral-950 px-4 py-2.5 text-[15px] leading-relaxed text-white">
                    <span className="sr-only">You: </span>
                    {entry.text}
                  </p>
                </li>
              );
            }
            const node = entry.type === 'ai' ? aiAsNode(entry) : getNode(flow, entry.nodeId);
            const msgs = messagesOf(flow, entry);
            const isAnimating = animating?.index === i;
            const shown = isAnimating ? animating.shown : msgs.length;
            return (
              <li key={i}>
                <NodeView
                  node={node}
                  messages={msgs.slice(0, shown)}
                  typing={isAnimating}
                  complete={!isAnimating}
                  generated={entry.type === 'ai'}
                  notes={entry.type === 'ai' ? <AiNotes entry={entry} /> : undefined}
                />
              </li>
            );
          })}
          {(pendingQuestion || aiError) && (
            <li className="fade-up flex justify-end pl-10">
              <p className="max-w-[85%] rounded-[20px] rounded-br-md bg-neutral-950 px-4 py-2.5 text-[15px] leading-relaxed text-white">
                <span className="sr-only">You: </span>
                {pendingQuestion ?? aiError?.question}
              </p>
            </li>
          )}
          {pendingQuestion && (
            <li className="flex items-end gap-2">
              <AIAvatar />
              <TypingIndicator />
            </li>
          )}
          {aiError && (
            <li role="alert" className="fade-up rounded-2xl border border-neutral-300 bg-neutral-50 p-4 text-[14px]">
              <p className="font-semibold">{aiMode.error}</p>
              <p className="mt-1 text-neutral-700">{aiError.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className={`${btn.secondary} !px-4 !py-2 text-[14px]`} onClick={() => void sendAi(aiError.question)}>
                  {aiMode.retry}
                </button>
                <button
                  type="button"
                  className={`${btn.ghost}`}
                  onClick={() => {
                    setAiError(null);
                    actions.setAiMode(false);
                  }}
                >
                  {aiMode.switchToTopics}
                </button>
              </div>
            </li>
          )}
        </ol>
      </div>

      {/* Reply tray */}
      <div className="border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-2xl px-4 pt-3 pb-2 sm:px-6">
          {status === 'down' && !busy ? (
            <ChatUnavailable talkTo={flow.id === 'existingClient' ? '/ask-adviser' : '/talk'} />
          ) : busy && !aiOn ? (
            <p className="flex h-10 items-center text-[14px] text-neutral-500">
              {animating ? 'Future You is typing…' : 'Opening…'}
            </p>
          ) : aiOn ? (
            <div className="fade-up space-y-2">
              {options.length > 0 && !busy && (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested actions">
                  {options.map((o) => (
                    <button key={o.label + o.next} type="button" onClick={() => onChoose(o)} className={chipClass(o, flow)}>
                      {(o.action === 'handover' || o.action === 'askAdviser') && <PersonIcon width={16} height={16} />}
                      <span>{o.label}</span>
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={onSubmit} className="flex items-end gap-2">
                <label htmlFor="ai-input" className="sr-only">
                  {aiMode.placeholder}
                </label>
                <textarea
                  id="ai-input"
                  rows={1}
                  value={draft}
                  maxLength={AI_LIMITS.questionChars}
                  disabled={pendingQuestion !== null}
                  placeholder={aiMode.placeholder}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void sendAi(draft);
                    }
                  }}
                  className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-2.5 text-[16px] leading-snug placeholder:text-neutral-500 focus:border-neutral-950 focus:outline-none disabled:bg-neutral-50"
                />
                <button type="submit" disabled={!draft.trim() || busy} className={`${btn.primary} !h-11 !rounded-2xl !px-4`}>
                  {aiMode.send}
                </button>
              </form>
              <p className="text-[11px] text-neutral-500">{aiMode.privacyNote}</p>
            </div>
          ) : (
            <div className="fade-up">
              <p className="mb-2 text-[12px] font-medium text-neutral-600">
                Tap a reply
                {status === 'slow' && <span className="font-normal"> · {serviceStatus.slow.trayNote}</span>}
              </p>
              <div
                className="flex max-h-[38dvh] flex-wrap gap-2 overflow-y-auto pb-1"
                role="group"
                aria-label="Choose a reply"
              >
                {options.map((o) => (
                  <button key={o.label + o.next} type="button" onClick={() => onChoose(o)} className={chipClass(o, flow)}>
                    {(o.action === 'handover' || o.action === 'askAdviser') && <PersonIcon width={16} height={16} />}
                    <span>{o.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-neutral-500">
            <span>{aiOn ? aiMode.onNote : 'AI · General information, not personal advice · v0'}</span>
            <button type="button" onClick={toggleDevPanel} className="underline underline-offset-2 hover:text-neutral-950">
              Dev (D)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature 8: say plainly that no reply is coming, and offer a person instead.
function ChatUnavailable({ talkTo }: { talkTo: string }) {
  return (
    <div role="status" className="fade-up rounded-2xl border border-neutral-300 bg-neutral-50 p-4">
      <p className="text-[15px] font-semibold">{chatUnavailable.title}</p>
      <p className="mt-1 text-[14px] text-neutral-700">{chatUnavailable.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to={talkTo} className={`${btn.adviser} !px-4 !py-2 text-[14px]`}>
          <PersonIcon width={16} height={16} /> {chatUnavailable.cta}
        </Link>
        <Link to="/" className={`${btn.secondary} !px-4 !py-2 text-[14px]`}>
          {chatUnavailable.back}
        </Link>
      </div>
    </div>
  );
}

function AiToggle({ on }: { on: boolean }) {
  return (
    <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-2 text-[13px] font-medium text-neutral-800" title={aiMode.toggleHint}>
      {aiMode.toggleLabel}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => actions.setAiMode(!on)}
        className={`relative h-6 w-10 rounded-full transition-colors ${on ? 'bg-neutral-950' : 'bg-neutral-300'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : ''}`}
        />
      </button>
    </label>
  );
}

function AiNotes({ entry }: { entry: Extract<ThreadEntry, { type: 'ai' }> }) {
  if (entry.kind === 'offTopic') return null;
  return (
    <div className="space-y-1.5 text-[12px] leading-relaxed text-neutral-600">
      {entry.unsourced && <p className="font-medium text-neutral-800">{aiMode.unsourcedNote}</p>}
      {entry.kind === 'personalAdvice' && <p>{aiMode.personalNote}</p>}
      {!aiNeedsHuman(entry) && <p>{aiMode.generatedNote}</p>}
    </div>
  );
}

function chipClass(o: Option, flow: Flow) {
  const base =
    'inline-flex max-w-full items-center gap-1.5 rounded-full px-4 py-2 text-left text-[14px] font-medium leading-snug transition-colors';
  if (o.action === 'handover' || o.action === 'askAdviser')
    return `${base} bg-accent text-white hover:bg-accent-dark`;
  if (o.next === flow.topicsNode && o.label.startsWith('Back'))
    return `${base} border border-dashed border-neutral-300 text-neutral-600 hover:border-neutral-950 hover:text-neutral-950`;
  if (o.action === 'savePlan') return `${base} bg-neutral-950 text-white hover:bg-neutral-800`;
  return `${base} border border-neutral-300 bg-white text-neutral-950 hover:border-neutral-950 hover:bg-neutral-50`;
}

function AIAvatar({ size = 28 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <ChatBubbleIcon width={size * 0.55} height={size * 0.55} />
    </span>
  );
}

function AIBadge() {
  return (
    <span className="rounded border border-neutral-300 px-1 py-px text-[10px] font-semibold tracking-wide text-neutral-700">
      AI
    </span>
  );
}

function NodeView({
  node,
  messages,
  typing,
  complete,
  generated = false,
  notes,
}: {
  node: Node;
  messages: string[];
  typing: boolean;
  complete: boolean;
  /** AI-mode answer: labelled so it's never mistaken for reviewed content. */
  generated?: boolean;
  notes?: ReactNode;
}) {
  const kind = node.kind ?? 'normal';
  const bubble =
    kind === 'adviser'
      ? 'bg-accent-tint text-neutral-950'
      : kind === 'personalAdvice'
        ? 'border border-neutral-300 bg-white'
        : 'bg-neutral-100';
  const hasExtras = complete && (kind === 'distress' || node.adviserNote || node.why || node.sources?.length || notes);
  const bubbleEl = (m: string, i: number) => (
    <p
      key={i}
      className={`fade-up w-fit max-w-full whitespace-pre-line rounded-[20px] px-4 py-2.5 text-[15px] leading-relaxed ${bubble} ${
        i === 0 ? 'rounded-tl-md' : ''
      }`}
    >
      {m}
    </p>
  );

  return (
    <div className="flex items-end gap-2 pr-6 sm:pr-12">
      {/* One avatar per group, aligned to the latest bubble like a messaging app. */}
      <AIAvatar />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="flex items-center gap-1.5 pl-1 text-[12px] text-neutral-600">
          Future You <AIBadge />
          {generated && <span>· {aiMode.generatedTag}</span>}
          {kind === 'personalAdvice' && <span className="font-semibold text-neutral-800">· Needs personal advice</span>}
        </p>
        {messages.slice(0, node.messages.length).map((m, i) => bubbleEl(m, i))}
        {/* Sources and "Why?" belong to the answer, so they sit before any appended follow-up. */}
        {hasExtras && (
          <div className="fade-up w-full space-y-3 rounded-[20px] border border-neutral-200 bg-white p-3 sm:p-4">
            {kind === 'distress' && <SupportCard />}
            {node.adviserNote && <AdviserNote>{node.adviserNote}</AdviserNote>}
            {node.why && <Why text={node.why} />}
            {node.sources && node.sources.length > 0 && kind !== 'distress' && <SourceList sources={node.sources} />}
            {notes}
          </div>
        )}
        {messages.slice(node.messages.length).map((m, i) => bubbleEl(m, node.messages.length + i))}
        {typing && <TypingIndicator />}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-[20px] rounded-bl-md bg-neutral-100 px-4 py-3.5" aria-label="The AI is typing">
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neutral-600" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neutral-600" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neutral-600" />
    </div>
  );
}

// Rule 5: calm support card. Not crisis help, just the right people.
export function SupportCard() {
  return (
    <section aria-label={supportCard.title}>
      <h3 className="text-[15px] font-semibold">{supportCard.title}</h3>
      <ul className="mt-3 divide-y divide-neutral-200">
        {supportCard.contacts.map((c) => (
          <li key={c.name} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className={`text-[15px] font-medium ${c.adviser ? 'text-accent' : ''}`}>{c.name}</p>
              <p className="text-[14px] text-neutral-600">{c.detail}</p>
            </div>
            {c.phone ? (
              <a href={`tel:${c.phone.replace(/\s/g, '')}`} className={`${btn.secondary} !px-3 !py-2 text-[14px]`}>
                <PhoneIcon width={16} height={16} /> {c.phone}
              </a>
            ) : (
              <Link to="/talk" className={`${btn.adviser} !px-3 !py-2 text-[14px]`}>
                <PersonIcon width={16} height={16} /> Talk to a person
              </Link>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[13px] text-neutral-600">{supportCard.emergency}</p>
      <div className="mt-3">
        <SourceList
          sources={supportCard.contacts.flatMap((c) => (c.url ? [{ label: c.name, url: c.url }] : []))}
        />
      </div>
    </section>
  );
}
