import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { PlanStep, Source } from '../engine/types';
import { ChatBubbleIcon, CheckIcon, ExternalIcon, PersonIcon } from './icons';

// Shared visual building blocks, styled after the Breezzy design system
// (ink outlines, hard shadows, lime primary). Sky blue (accent) is reserved
// for anything that involves a human adviser; the AI never uses it.

const btnBase =
  'press inline-flex items-center justify-center gap-2 rounded-xl border border-ink px-5 py-3 text-[15px] font-medium text-ink shadow-hard-sm disabled:opacity-40 disabled:shadow-none';

export const btn = {
  primary: `${btnBase} bg-lime hover:bg-lime-strong`,
  secondary: `${btnBase} bg-white hover:bg-lime-50`,
  adviser: `${btnBase} bg-accent-fill hover:bg-[#aee9f9]`,
  adviserOutline: `${btnBase} bg-accent-tint text-accent-dark`,
  ghost:
    'inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 underline decoration-neutral-400 underline-offset-4 hover:text-ink hover:decoration-ink',
};

export const inputCls =
  'w-full rounded-xl border border-ink bg-white px-4 py-3 text-[16px] text-ink placeholder:text-neutral-500 focus:shadow-hard-sm focus:outline-none';

export function Page({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <main className={`mx-auto w-full px-4 pb-16 pt-6 sm:px-6 sm:pt-10 ${wide ? 'max-w-3xl' : 'max-w-2xl'}`}>
      {children}
    </main>
  );
}

export function V0Note({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 rounded-xl border border-dashed border-ink/50 bg-sun-50 px-3 py-2 text-[13px] text-neutral-800">
      {children}
    </p>
  );
}

export function AIBadge() {
  return (
    <div className="flex items-center gap-2 text-[13px] text-neutral-600">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ink bg-lime text-ink">
        <ChatBubbleIcon width={16} height={16} />
      </span>
      <span className="rounded-md border border-ink bg-white px-1.5 py-px text-[11px] font-semibold tracking-wide text-ink">
        AI
      </span>
      <span>Digital advisor</span>
    </div>
  );
}

export function AdviserAvatar({ initials, size = 48 }: { initials?: string; size?: number }) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center rounded-full border border-ink bg-accent-fill text-accent-dark"
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
            className="inline-flex items-center gap-0.5 underline decoration-neutral-400 underline-offset-2 hover:text-ink hover:decoration-ink"
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
      <p className="mt-2 rounded-xl bg-lime-50 px-3 py-2 leading-relaxed text-neutral-800">{text}</p>
    </details>
  );
}

export function AdviserNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-ink bg-accent-tint px-4 py-3 text-[14px] leading-relaxed text-ink">
      <PersonIcon className="mt-0.5 shrink-0 text-accent" width={18} height={18} />
      <p>{children}</p>
    </div>
  );
}

export function FromAdviserTag({ label = 'From your adviser' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-ink bg-accent-fill px-2 py-0.5 text-[12px] font-medium text-ink">
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
          className={`flex gap-3 rounded-2xl border border-ink p-4 ${step.fromAdviser ? 'bg-accent-tint' : 'bg-white'} ${
            step.done ? 'opacity-70' : 'shadow-hard-sm'
          }`}
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={Boolean(step.done)}
            aria-label={`Mark "${step.text}" as ${step.done ? 'not done' : 'done'}`}
            onClick={() => onToggle(step.id)}
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-ink ${
              step.done ? 'bg-lime text-ink' : 'bg-white hover:bg-lime-50'
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
              <Link to={step.cta.to} className="mt-2 inline-flex text-[14px] font-semibold text-accent underline underline-offset-4">
                {step.cta.label}
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
