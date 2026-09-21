import { Link, useNavigate } from 'react-router-dom';
import { adviser, correctionNotice, dashboard } from '../content/existingClientFlow';
import { actions, useAppState } from '../state/store';
import { AdviserAvatar, Page, PlanList, SourceList, btn } from '../components/ui';
import { AlertIcon, ChatBubbleIcon, PersonIcon } from '../components/icons';

export function Dashboard() {
  const navigate = useNavigate();
  const plan = useAppState((s) => s.clientPlan);
  const showCorrection = useAppState((s) => s.showCorrection);
  const lastFromAdviser = useAppState((s) => [...s.adviserThread].reverse().find((m) => m.from === 'adviser'));

  return (
    <Page wide>
      <div className="flex items-center justify-between gap-3">
        <h1 className="display text-[40px]">{dashboard.greeting}</h1>
        <button
          type="button"
          className={btn.ghost}
          onClick={() => {
            actions.signOut();
            navigate('/');
          }}
        >
          Sign out
        </button>
      </div>

      {showCorrection && (
        <section role="status" className="card mt-5 !bg-sun-50 p-5">
          <h2 className="flex items-center gap-2 text-[16px] font-semibold">
            <AlertIcon width={18} height={18} /> {correctionNotice.title}
          </h2>
          <div className="mt-2 space-y-2 text-[15px] leading-relaxed text-neutral-900">
            <p>{correctionNotice.wrong}</p>
            <p>{correctionNotice.correct}</p>
            <p>{correctionNotice.mitigation}</p>
            <p className="font-medium">{correctionNotice.action}</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <SourceList sources={[correctionNotice.source]} />
            <button type="button" className={`${btn.secondary} !py-2`} onClick={() => actions.setCorrection(false)}>
              {correctionNotice.dismiss}
            </button>
          </div>
        </section>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_260px]">
        <section aria-labelledby="plan-h">
          <h2 id="plan-h" className="display mb-3 text-[26px]">
            {dashboard.planTitle}
          </h2>
          <PlanList steps={plan} onToggle={actions.toggleClientStep} fromAdviserLabel={dashboard.fromAdviserLabel} />

          <div className="mt-6 card p-5">
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              <ChatBubbleIcon width={18} height={18} /> {dashboard.chatLabel}
            </p>
            <p className="mt-1 text-[14px] text-neutral-600">{dashboard.chatHint}</p>
            <Link to="/client-chat" className={`${btn.secondary} mt-4 w-full sm:w-auto`}>
              Open the AI chat
            </Link>
          </div>
        </section>

        <aside className="order-first md:order-none">
          <div className="card !bg-accent-tint p-5">
            <div className="flex items-center gap-3">
              <AdviserAvatar size={56} />
              <div className="min-w-0">
                <p className="text-[16px] font-semibold">{adviser.name}</p>
                <p className="text-[13px] text-neutral-600">{adviser.role}</p>
              </div>
            </div>
            <p className="mt-3 text-[13px] text-neutral-600">{adviser.replyTime}</p>
            {lastFromAdviser && (
              <Link to="/ask-adviser" className="mt-3 block rounded-xl border border-ink bg-white p-3 text-[14px] text-ink">
                <span className="font-medium text-accent">New reply: </span>
                {lastFromAdviser.text.slice(0, 80)}…
              </Link>
            )}
            <Link to="/ask-adviser" className={`${btn.adviser} mt-4 w-full`}>
              <PersonIcon width={18} height={18} /> {dashboard.askLabel}
            </Link>
          </div>
        </aside>
      </div>
    </Page>
  );
}
