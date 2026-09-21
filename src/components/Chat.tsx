import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Flow, Node, Option, OptionAction, PlanStep } from '../engine/types';
import { choose, getNode, startChat, visibleOptions } from '../engine/engine';
import { actions, setState, useAppState, type AppState, type ThreadEntry } from '../state/store';
import { supportCard } from '../content/newClientFlow';
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

const messagesOf = (flow: Flow, entry: Extract<ThreadEntry, { type: 'node' }>) => [
  ...getNode(flow, entry.nodeId).messages,
  ...(entry.extra ?? []),
];

/**
 * Full-height chat window: header bar, scrolling thread, and a reply tray
 * pinned to the bottom. The tray holds quick-reply chips instead of a text
 * box (v0 has no free-text input).
 */
export function Chat({ flow, chatKey, planTemplate, onNavigate, leading, startNote }: Props) {
  const chat = useAppState((s) => s.chats[chatKey]);
  const planExists = useAppState((s) => s.plan !== null);
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
    if (!entry || entry.type !== 'node') {
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
  }, [animating, chat.thread.length]);

  const onChoose = (option: Option) => {
    if (animating) return;
    if (option.action === 'addPlanStep' && option.planStep) actions.addPlanStep(option.planStep);
    if (option.action === 'savePlan' && planTemplate) actions.createPlan(planTemplate);
    if (option.action && option.action !== 'addPlanStep') pendingNav.current = option.action;
    const next = choose(flow, chat, option);
    setChat(next);
    setAnimating({ index: next.thread.length - 1, shown: 0 });
  };

  const options = visibleOptions(flow, chat, planExists);
  const busy = animating !== null || pendingNav.current !== null;

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
              {busy && animating ? 'Typing…' : 'General information only · replies instantly'}
            </p>
          </div>
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
            const node = getNode(flow, entry.nodeId);
            const msgs = messagesOf(flow, entry);
            const isAnimating = animating?.index === i;
            const shown = isAnimating ? animating.shown : msgs.length;
            return (
              <li key={i}>
                <NodeView node={node} messages={msgs.slice(0, shown)} typing={isAnimating} complete={!isAnimating} />
              </li>
            );
          })}
        </ol>
      </div>

      {/* Reply tray */}
      <div className="border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-2xl px-4 pt-3 pb-2 sm:px-6">
          {busy ? (
            <p className="flex h-10 items-center text-[14px] text-neutral-500">
              {animating ? 'Future You is typing…' : 'Opening…'}
            </p>
          ) : (
            <div className="fade-up">
              <p className="mb-2 text-[12px] font-medium text-neutral-600">Tap a reply</p>
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
            <span>AI · General information, not personal advice · v0</span>
            <button type="button" onClick={toggleDevPanel} className="underline underline-offset-2 hover:text-neutral-950">
              Dev (D)
            </button>
          </div>
        </div>
      </div>
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
}: {
  node: Node;
  messages: string[];
  typing: boolean;
  complete: boolean;
}) {
  const kind = node.kind ?? 'normal';
  const bubble =
    kind === 'adviser'
      ? 'bg-accent-tint text-neutral-950'
      : kind === 'personalAdvice'
        ? 'border border-neutral-300 bg-white'
        : 'bg-neutral-100';
  const hasExtras = complete && (kind === 'distress' || node.adviserNote || node.why || node.sources?.length);
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
