import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { PlanStep, Source } from '../engine/types';
import { ChatBubbleIcon, CheckIcon, ExternalIcon, PersonIcon } from './icons';

// Shared visual building blocks. Teal (accent) is reserved for anything that
// involves a human adviser; the AI is always black/grey.

export const btn = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-[15px] font-medium text-white hover:bg-neutral-800 disabled:opacity-40',
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 text-[15px] font-medium text-neutral-950 hover:border-neutral-950 disabled:opacity-40',
  adviser:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-[15px] font-medium text-white hover:bg-accent-dark disabled:opacity-40',
  adviserOutline:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-accent bg-white px-5 py-3 text-[15px] font-medium text-accent hover:bg-accent-tint',
  ghost: 'inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 underline-offset-4 hover:text-neutral-950 hover:underline',
};

export const inputCls =
  'w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[16px] text-neutral-950 placeholder:text-neutral-500 focus:border-neutral-950 focus:outline-none';

export function Page({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <main className={`mx-auto w-full px-4 pb-16 pt-6 sm:px-6 sm:pt-10 ${wide ? 'max-w-3xl' : 'max-w-2xl'}`}>
      {children}
    </main>
  );
}

export function V0Note({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-[13px] text-neutral-600">
      {children}
    </p>
  );
}

export function AIBadge() {
  return (
    <div className="flex items-center gap-2 text-[13px] text-neutral-600">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-800">
        <ChatBubbleIcon width={16} height={16} />
      </span>
      <span className="rounded border border-neutral-300 px-1.5 py-px text-[11px] font-semibold tracking-wide text-neutral-800">
        AI
      </span>
      <span>Digital advisor</span>
    </div>
  );
}

export function AdviserAvatar({ initials, size = 48 }: { initials?: string; size?: number }) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initials ? (
        <span className="text-sm font-semibold">{initials}</span>
      ) : (
        <PersonIcon width={size / 2} height={size / 2} />
      )}
    </span>
  );
}

export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <div className="text-[13px] text-neutral-600">
      <span className="font-medium text-neutral-800">{sources.length > 1 ? 'Sources' : 'Source'}: </span>
      {sources.map((s, i) => (
        <span key={s.url}>
          {i > 0 && ' · '}
          <a
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-950 hover:decoration-neutral-950"
          >
            {s.label}
            <ExternalIcon width={12} height={12} />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </span>
      ))}
    </div>
  );
}

export function Why({ text }: { text: string }) {
  return (
    <details className="group text-[14px]">
      <summary className="cursor-pointer list-none text-[13px] font-medium text-neutral-700 hover:text-neutral-950 [&::-webkit-details-marker]:hidden">
        <span className="inline-block transition-transform group-open:rotate-90">›</span> Why?
      </summary>
      <p className="mt-2 border-l-2 border-neutral-200 pl-3 leading-relaxed text-neutral-700">{text}</p>
    </details>
  );
}

export function AdviserNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-accent/30 bg-accent-tint px-4 py-3 text-[14px] leading-relaxed text-neutral-900">
      <PersonIcon className="mt-0.5 shrink-0 text-accent" width={18} height={18} />
      <p>{children}</p>
    </div>
  );
}

export function FromAdviserTag({ label = 'From your adviser' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-tint px-2 py-0.5 text-[12px] font-medium text-accent">
      <PersonIcon width={13} height={13} />
      {label}
    </span>
  );
}

export function PlanList({
  steps,
  onToggle,
  fromAdviserLabel,
}: {
  steps: PlanStep[];
  onToggle: (id: string) => void;
  fromAdviserLabel?: string;
}) {
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li
          key={step.id}
          className={`flex gap-3 rounded-2xl border p-4 ${
            step.fromAdviser ? 'border-accent/40' : 'border-neutral-200'
          }`}
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={Boolean(step.done)}
            aria-label={`Mark "${step.text}" as ${step.done ? 'not done' : 'done'}`}
            onClick={() => onToggle(step.id)}
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
              step.done ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-400 bg-white'
            }`}
          >
            {step.done && <CheckIcon width={16} height={16} />}
          </button>
          <div className="min-w-0 flex-1">
            {step.fromAdviser && (
              <div className="mb-1">
                <FromAdviserTag label={fromAdviserLabel} />
              </div>
            )}
            <p className={`text-[15px] font-medium ${step.done ? 'text-neutral-500 line-through' : ''}`}>
              <span className="sr-only">Step {i + 1}: </span>
              {step.text}
            </p>
            {step.detail && <p className="mt-1 text-[14px] text-neutral-600">{step.detail}</p>}
            {step.cta && !step.done && (
              <Link to={step.cta.to} className="mt-2 inline-flex text-[14px] font-medium text-accent underline underline-offset-4">
                {step.cta.label}
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
