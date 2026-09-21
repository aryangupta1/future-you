import { useState } from 'react';
import { Link } from 'react-router-dom';
import { planPage } from '../content/newClientFlow';
import { actions, useAppState } from '../state/store';
import { Page, PlanList, V0Note, btn, inputCls } from '../components/ui';
import { CheckIcon } from '../components/icons';

export function MyPlan() {
  const plan = useAppState((s) => s.plan);
  const [email, setEmail] = useState('');

  if (!plan) {
    return (
      <Page>
        <h1 className="text-[28px] font-semibold tracking-tight">{planPage.title}</h1>
        <p className="mt-3 text-[16px] text-neutral-700">{planPage.empty}</p>
        <Link to="/chat" className={`${btn.primary} mt-6`}>
          Go to the chat
        </Link>
      </Page>
    );
  }

  const done = plan.steps.filter((s) => s.done).length;

  return (
    <Page>
      <h1 className="text-[28px] font-semibold tracking-tight">{planPage.title}</h1>
      <p className="mt-2 text-[16px] text-neutral-700">{planPage.intro}</p>
      <p className="mt-4 text-[13px] font-medium text-neutral-600">
        {done} of {plan.steps.length} done
      </p>
      <div className="mt-3">
        <PlanList steps={plan.steps} onToggle={actions.togglePlanStep} />
      </div>

      {!plan.saved ? (
        <button type="button" className={`${btn.primary} mt-6 w-full sm:w-auto`} onClick={actions.savePlan}>
          {planPage.saveLabel}
        </button>
      ) : (
        <>
          <p className="mt-6 flex items-center gap-2 text-[14px] text-neutral-700">
            <CheckIcon width={18} height={18} /> {planPage.savedNote}
          </p>

          {/* Rule 6: email is optional and only offered after saving a plan. */}
          {!plan.emailDone ? (
            <form
              className="mt-6 rounded-2xl border border-neutral-200 p-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) actions.setPlanEmail(email.trim());
              }}
            >
              <h2 className="text-[16px] font-semibold">{planPage.email.title}</h2>
              <p className="mt-1 text-[14px] text-neutral-600">{planPage.email.body}</p>
              <label htmlFor="plan-email" className="sr-only">
                Email address
              </label>
              <input
                id="plan-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={planPage.email.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputCls} mt-4`}
              />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <button type="submit" className={btn.primary} disabled={!email.trim()}>
                  {planPage.email.send}
                </button>
                <button type="button" className={btn.secondary} onClick={() => actions.setPlanEmail(undefined)}>
                  {planPage.email.skip}
                </button>
              </div>
            </form>
          ) : (
            plan.email && (
              <V0Note>
                {planPage.email.sent} {plan.email}.
              </V0Note>
            )
          )}
        </>
      )}

      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
        <Link to="/chat" className={btn.ghost}>
          Back to the chat
        </Link>
      </div>
    </Page>
  );
}
