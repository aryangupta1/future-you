import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { handover, newClientFlow } from '../content/newClientFlow';
import { buildSummary } from '../engine/engine';
import { actions, useAppState } from '../state/store';
import { AdviserAvatar, Page, V0Note, btn, inputCls } from '../components/ui';
import { PersonIcon } from '../components/icons';
import { BookingCalendar } from '../components/BookingCalendar';
import { formatSlot } from '../engine/slots';

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
      <h3 className="text-[12px] font-semibold tracking-wide text-accent uppercase">{title}</h3>
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
      <h1 className="display text-[36px] sm:text-[40px]">{children}</h1>
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

      <section className="card mt-6 !bg-accent-tint p-5" aria-label={handover.summaryTitle}>
        <h2 className="display mb-4 text-[26px]">{handover.summaryTitle}</h2>
        <SummaryPreview includeStress={includeStress} />
        {mentionedStress && (
          <label className="mt-5 flex cursor-pointer items-start gap-3 border-t border-ink/20 pt-4 text-[15px]">
            <input
              type="checkbox"
              checked={includeStress}
              onChange={(e) => setIncludeStress(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#075b72]"
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
  const [email, setEmail] = useState('');
  const [slot, setSlot] = useState<Date | null>(null);
  const [tried, setTried] = useState(false);

  const emailOk = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const valid = name.trim() && phone.trim().length >= 8 && emailOk && slot;

  return (
    <Page>
      <TealHeading>{handover.formTitle}</TealHeading>
      <form
        noValidate
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setTried(true);
          if (!valid || !slot) return;
          actions.submitHandover({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            slot: formatSlot(slot),
            slotAt: slot.toISOString(),
            includeStress,
          });
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
        <div>
          <label htmlFor="email" className="mb-1.5 block text-[14px] font-medium">
            {handover.emailLabel} <span className="font-normal text-neutral-600">{handover.emailOptional}</span>
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-describedby="email-hint"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
          <p id="email-hint" className="mt-1 text-[13px] text-neutral-600">
            {handover.emailHint}
          </p>
          {tried && !emailOk && <p className="mt-1 text-[13px] text-red-700">{handover.emailError}</p>}
        </div>
        <fieldset>
          <legend className="mb-2 text-[14px] font-medium">{handover.slotsLabel}</legend>
          <BookingCalendar value={slot} onChange={setSlot} />
          {tried && !slot && <p className="mt-2 text-[13px] text-red-700">{handover.slotError}</p>}
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
      <div className="card !bg-accent-fill p-6 !shadow-hard-lg">
        <p className="flex items-center gap-2 text-[14px] font-semibold text-accent-dark">
          <PersonIcon width={16} height={16} /> {handover.confirmedTitle}
        </p>
        <p className="display mt-2 text-[40px]">{booking.slot}</p>
        <div className="mt-5 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ink bg-white">
            <PersonIcon width={24} height={24} />
          </span>
          <div>
            <p className="text-[16px] font-semibold">{handover.adviserName}</p>
            <p className="text-[14px] text-neutral-800">{handover.adviserRole}</p>
          </div>
        </div>
        <p className="mt-5 text-[15px]">
          {handover.confirmedBody} They'll call {booking.name} on {booking.phone}.
          {booking.email && ` ${handover.confirmedEmail} ${booking.email}.`}
        </p>
      </div>

      <section className="mt-6 card p-5">
        <h2 className="display mb-4 text-[26px]">The summary they'll read</h2>
        <SummaryPreview includeStress={booking.includeStress} />
      </section>
      <V0Note>{handover.mockNote}</V0Note>
    </Page>
  );
}
