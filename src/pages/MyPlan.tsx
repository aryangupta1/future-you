import { useState } from 'react';
import { Link } from 'react-router-dom';
import { planPage } from '../content/newClientFlow';
import { actions, useAppState, type CheckIns } from '../state/store';
import { Page, PlanList, V0Note, btn, inputCls } from '../components/ui';
import { CheckIcon } from '../components/icons';

const randomKey = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(9)), (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 12);

export function MyPlan() {
  const plan = useAppState((s) => s.plan);
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  if (!plan) {
    return (
      <Page>
        <h1 className="display text-[40px]">{planPage.title}</h1>
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
      <h1 className="display text-[40px]">{planPage.title}</h1>
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
              className="mt-6 card p-5"
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
              <button
                type="button"
                className={`${btn.ghost} mt-4`}
                onClick={() => actions.setPrivateLink(`${window.location.origin}/plan?k=${randomKey()}`)}
              >
                {planPage.email.privateLinkLabel}
              </button>
            </form>
          ) : plan.privateLink ? (
            <section className="mt-6 card p-5">
              <h2 className="text-[16px] font-semibold">{planPage.email.privateLinkTitle}</h2>
              <p className="mt-1 text-[14px] text-neutral-600">{planPage.email.privateLinkBody}</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input readOnly value={plan.privateLink} aria-label="Private link" className={`${inputCls} font-mono !text-[14px]`} />
                <button
                  type="button"
                  className={btn.secondary}
                  onClick={() => {
                    navigator.clipboard?.writeText(plan.privateLink!).then(() => setCopied(true), () => {});
                  }}
                >
                  {copied ? planPage.email.privateLinkCopied : planPage.email.privateLinkCopy}
                </button>
              </div>
              <V0Note>{planPage.email.privateLinkMock}</V0Note>
            </section>
          ) : (
            plan.email && (
              <V0Note>
                {planPage.email.sent} {plan.email}.
              </V0Note>
            )
          )}

          {/* Feature 5: check-ins follow her income, not the calendar. Opt-in. */}
          <fieldset className="mt-6 card p-5">
            <legend className="px-1 text-[16px] font-semibold">{planPage.checkIns.title}</legend>
            <p className="text-[14px] text-neutral-600">{planPage.checkIns.body}</p>
            <div className="mt-3 space-y-2">
              {planPage.checkIns.options.map((o) => (
                <label
                  key={o.value}
                  className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3 ${
                    plan.checkIns === o.value ? 'border-ink bg-lime shadow-hard-sm' : 'border-ink bg-white hover:bg-lime-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="check-ins"
                    value={o.value}
                    checked={plan.checkIns === o.value}
                    onChange={() => actions.setCheckIns(o.value as CheckIns)}
                    className="mt-1 accent-neutral-950"
                  />
                  <span>
                    <span className="block text-[15px] font-medium">{o.label}</span>
                    <span className="block text-[14px] text-neutral-600">{o.detail}</span>
                  </span>
                </label>
              ))}
            </div>
            {plan.checkIns && plan.checkIns !== 'off' && <V0Note>{planPage.checkIns.mockNote}</V0Note>}
          </fieldset>
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
