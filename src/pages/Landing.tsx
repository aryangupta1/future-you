import { Link, useNavigate } from 'react-router-dom';
import { landing } from '../content/newClientFlow';
import { actions, useAppState } from '../state/store';
import { CheckIcon } from '../components/icons';
import { Page, btn } from '../components/ui';

export function Landing() {
  const navigate = useNavigate();
  const plan = useAppState((s) => s.plan);
  const hasChat = useAppState((s) => s.chats.newClient.thread.length > 0);
  const signedIn = useAppState((s) => s.signedIn);
  const existingTo = signedIn ? '/dashboard' : '/signin';

  const done = plan?.steps.filter((s) => s.done).length ?? 0;

  return (
    <Page>
      <p className="text-[13px] font-medium text-neutral-600">{landing.eyebrow}</p>
      <h1 className="mt-3 text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[44px]">{landing.headline}</h1>
      <div className="mt-5 space-y-3 text-[16px] leading-relaxed text-neutral-700 sm:text-[17px]">
        {landing.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {plan?.saved ? (
        // P4: a returning visitor goes straight back to where they were.
        <section className="mt-8 rounded-2xl border border-neutral-200 p-5">
          <h2 className="text-[18px] font-semibold">{landing.welcomeBack.title}</h2>
          <p className="mt-1 text-[15px] text-neutral-600">
            {landing.welcomeBack.body} {done} of {plan.steps.length} steps done.
          </p>
          {plan.checkIns === 'payment' && (
            // P1: the check-in is triggered by her income arriving.
            <div className="mt-4 rounded-xl bg-neutral-100 p-4">
              <button
                type="button"
                className={`${btn.primary} w-full sm:w-auto`}
                onClick={() => {
                  actions.startCheckIn(landing.welcomeBack.paymentLanded, landing.welcomeBack.paymentLandedNode);
                  navigate('/chat');
                }}
              >
                {landing.welcomeBack.paymentLanded}
              </button>
              <p className="mt-2 text-[13px] text-neutral-600">{landing.welcomeBack.paymentLandedHint}</p>
            </div>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button type="button" className={btn.primary} onClick={() => navigate('/plan')}>
              {landing.welcomeBack.openPlan}
            </button>
            <button type="button" className={btn.secondary} onClick={() => navigate('/chat')}>
              {landing.welcomeBack.continueChat}
            </button>
          </div>
          <Link to={existingTo} className={`${btn.ghost} mt-4`}>
            {landing.existingLabel}
          </Link>
        </section>
      ) : (
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <button type="button" className={btn.primary} onClick={() => navigate('/chat')}>
            {hasChat ? 'Continue the conversation' : landing.startLabel}
          </button>
          <button type="button" className={btn.secondary} onClick={() => navigate(existingTo)}>
            {landing.existingLabel}
          </button>
        </div>
      )}

      <ul className="mt-10 space-y-2.5 border-t border-neutral-200 pt-6">
        {landing.proofPoints.map((p) => (
          <li key={p} className="flex gap-2.5 text-[15px] text-neutral-700">
            <CheckIcon className="mt-0.5 shrink-0 text-neutral-950" width={18} height={18} />
            {p}
          </li>
        ))}
      </ul>
    </Page>
  );
}
