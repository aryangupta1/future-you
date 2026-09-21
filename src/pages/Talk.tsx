import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { handover, newClientFlow } from '../content/newClientFlow';
import { buildSummary } from '../engine/engine';
import { actions, useAppState } from '../state/store';
import { AdviserAvatar, Page, V0Note, btn, inputCls } from '../components/ui';
import { PersonIcon } from '../components/icons';

// Rule 4: "Talk to a person", teal throughout. The visitor sees exactly what
// will be shared before sharing anything (rule 6: anonymous by default).

function useSummary() {
  const thread = useAppState((s) => s.chats.newClient.thread);
  const plan = useAppState((s) => s.plan);
  return { ...buildSummary(newClientFlow, thread), planSteps: plan?.steps ?? [] };
}

function SummaryPreview({ includeStress }: { includeStress: boolean }) {
  const { topics, questions, planSteps } = useSummary();
  const empty = !topics.length && !questions.length && !planSteps.length;
  if (empty && !includeStress) return <p className="text-[15px] text-neutral-700">{handover.emptySummary}</p>;

  const Section = ({ title, items }: { title: string; items: string[] }) => (
    <div>
      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-accent">{title}</h3>
      {items.length ? (
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[15px] text-neutral-900">
          {items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 text-[15px] text-neutral-600">None yet</p>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <Section title="Topics covered" items={topics} />
      <Section title="Questions you asked" items={questions} />
      <Section title="Your plan steps" items={planSteps.map((s) => (s.done ? `${s.text} (done)` : s.text))} />
      {includeStress && <Section title="Also shared" items={['Mentioned that money stress is getting on top of them']} />}
    </div>
  );
}

function TealHeading({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <AdviserAvatar size={44} />
      <h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">{children}</h1>
    </div>
  );
}

export function TalkConsent() {
  const navigate = useNavigate();
  const { mentionedStress } = useSummary();
  const [includeStress, setIncludeStress] = useState(false);

  return (
    <Page>
      <TealHeading>{handover.title}</TealHeading>
      <p className="mt-4 text-[16px] leading-relaxed text-neutral-700">{handover.intro}</p>

      <section className="mt-6 rounded-2xl border-2 border-accent/40 bg-accent-tint/50 p-5" aria-label={handover.summaryTitle}>
        <h2 className="mb-4 text-[17px] font-semibold">{handover.summaryTitle}</h2>
        <SummaryPreview includeStress={includeStress} />
        {mentionedStress && (
          <label className="mt-5 flex cursor-pointer items-start gap-3 border-t border-accent/20 pt-4 text-[15px]">
            <input
              type="checkbox"
              checked={includeStress}
              onChange={(e) => setIncludeStress(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#0f6e6e]"
            />
            {handover.stressConsent}
          </label>
        )}
      </section>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button type="button" className={btn.adviser} onClick={() => navigate('/talk/details', { state: { includeStress } })}>
          {handover.consentLabel}
        </button>
        <button type="button" className={btn.secondary} onClick={() => navigate(-1)}>
          {handover.declineLabel}
        </button>
      </div>
    </Page>
  );
}

export function TalkDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const includeStress = Boolean((location.state as { includeStress?: boolean } | null)?.includeStress);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [slot, setSlot] = useState('');
  const [tried, setTried] = useState(false);

  const valid = name.trim() && phone.trim().length >= 8 && slot;

  return (
    <Page>
      <TealHeading>{handover.formTitle}</TealHeading>
      <form
        noValidate
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setTried(true);
          if (!valid) return;
          actions.submitHandover({ name: name.trim(), phone: phone.trim(), slot, includeStress });
          navigate('/talk/confirmed', { replace: true });
        }}
      >
        <div>
          <label htmlFor="name" className="mb-1.5 block text-[14px] font-medium">
            Your first name
          </label>
          <input id="name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          {tried && !name.trim() && <p className="mt-1 text-[13px] text-red-700">Add a name so the adviser knows who to ask for.</p>}
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-[14px] font-medium">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
          />
          {tried && phone.trim().length < 8 && <p className="mt-1 text-[13px] text-red-700">Add a phone number we can call.</p>}
        </div>
        <fieldset>
          <legend className="mb-2 text-[14px] font-medium">{handover.slotsLabel}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {handover.slots.map((s) => (
              <label
                key={s}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[15px] ${
                  slot === s ? 'border-accent bg-accent-tint' : 'border-neutral-300 hover:border-neutral-950'
                }`}
              >
                <input type="radio" name="slot" value={s} checked={slot === s} onChange={() => setSlot(s)} className="accent-[#0f6e6e]" />
                {s}
              </label>
            ))}
          </div>
          {tried && !slot && <p className="mt-1 text-[13px] text-red-700">Pick a time.</p>}
        </fieldset>
        <button type="submit" className={`${btn.adviser} w-full sm:w-auto`}>
          {handover.submitLabel}
        </button>
      </form>
      <V0Note>{handover.mockNote}</V0Note>
    </Page>
  );
}

export function TalkConfirmed() {
  const booking = useAppState((s) => s.handover);
  if (!booking) return <Navigate to="/talk" replace />;

  return (
    <Page>
      <div className="rounded-2xl bg-accent p-6 text-white">
        <p className="flex items-center gap-2 text-[14px] font-medium text-white/85">
          <PersonIcon width={16} height={16} /> {handover.confirmedTitle}
        </p>
        <p className="mt-2 text-[24px] font-semibold leading-tight">{booking.slot}</p>
        <div className="mt-5 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <PersonIcon width={24} height={24} />
          </span>
          <div>
            <p className="text-[16px] font-semibold">{handover.adviserName}</p>
            <p className="text-[14px] text-white/85">{handover.adviserRole}</p>
          </div>
        </div>
        <p className="mt-5 text-[15px]">
          {handover.confirmedBody} They'll call {booking.name} on {booking.phone}.
        </p>
      </div>

      <section className="mt-6 rounded-2xl border border-neutral-200 p-5">
        <h2 className="mb-4 text-[17px] font-semibold">The summary they'll read</h2>
        <SummaryPreview includeStress={booking.includeStress} />
      </section>
      <V0Note>{handover.mockNote}</V0Note>
    </Page>
  );
}
