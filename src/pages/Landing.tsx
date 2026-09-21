import { Link, useNavigate } from 'react-router-dom';
import { landing, newClientFlow } from '../content/newClientFlow';
import { actions, useAppState } from '../state/store';
import { ChatBubbleIcon, CheckIcon, PersonIcon } from '../components/icons';
import { SourceList, btn } from '../components/ui';

// The main page tells the product brief's story: who it's for (the persona's
// pain points), how it works, why now, and the one boundary that holds it
// together. Every sample question opens the real chat at that answer.

export function Landing() {
  const navigate = useNavigate();
  const plan = useAppState((s) => s.plan);
  const hasChat = useAppState((s) => s.chats.newClient.thread.length > 0);
  const signedIn = useAppState((s) => s.signedIn);
  const existingTo = signedIn ? '/dashboard' : '/signin';

  const ask = (question: string, nodeId: string) => {
    actions.startWithQuestion(question, nodeId);
    navigate('/chat');
  };
  const start = () => navigate('/chat');

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      {/* Hero */}
      <section className="pt-8 sm:pt-12">
        <p className="inline-flex items-center gap-2 rounded-full border border-ink bg-white px-3 py-1 text-[13px] font-medium">
          <span className="h-2 w-2 rounded-full bg-[#7fd13b]" aria-hidden /> {landing.eyebrow}
        </p>
        <h1 className="display mt-5 text-[52px] leading-[0.88] sm:text-[76px]">{landing.headline}</h1>
        <div className="mt-5 max-w-xl space-y-3 text-[16px] leading-relaxed text-neutral-800 sm:text-[17px]">
          {landing.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        {!plan?.saved && (
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button type="button" className={`${btn.primary} !px-6 !py-3.5 !text-[16px]`} onClick={start}>
              <ChatBubbleIcon width={18} height={18} />
              {hasChat ? 'Continue the conversation' : landing.startLabel}
            </button>
            <button type="button" className={btn.secondary} onClick={() => navigate(existingTo)}>
              {landing.existingLabel}
            </button>
          </div>
        )}

        <ul className="mt-6 flex flex-wrap gap-2" aria-label="What to expect">
          {landing.proofPoints.map((p) => (
            <li key={p} className="inline-flex items-center gap-1.5 rounded-full border border-ink/30 bg-white/70 px-3 py-1 text-[13px]">
              <CheckIcon width={14} height={14} /> {p}
            </li>
          ))}
        </ul>
      </section>

      {plan?.saved && <WelcomeBack existingTo={existingTo} />}

      <ChatPreview />

      {/* Ask something now */}
      <section className="mt-14" aria-labelledby="ask-h">
        <h2 id="ask-h" className="display text-[34px] sm:text-[40px]">
          {landing.ask.title}
        </h2>
        <p className="mt-2 text-[15px] text-neutral-700">{landing.ask.body}</p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {landing.ask.questions.map((q) => {
            const personal = newClientFlow.nodes[q.nodeId]?.kind === 'personalAdvice';
            return (
              <button
                key={q.nodeId}
                type="button"
                onClick={() => ask(q.label, q.nodeId)}
                className={`press rounded-full border border-ink px-4 py-2.5 text-left text-[14px] font-medium shadow-hard-sm ${
                  personal ? 'bg-sun-50' : 'bg-white hover:bg-lime-50'
                }`}
              >
                {q.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Pain points */}
      <section className="mt-16" aria-labelledby="pain-h">
        <h2 id="pain-h" className="display text-[34px] sm:text-[40px]">
          {landing.painPoints.title}
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {landing.painPoints.items.map((p, i) => (
            <li key={p.code} className={`card p-5 ${i === 0 ? 'sm:col-span-2 !bg-lime' : ''}`}>
              <p className="flex items-center gap-2">
                <span className="rounded-md border border-ink bg-white px-1.5 py-px text-[11px] font-semibold">{p.code}</span>
                <span className="display text-[24px]">{p.pain}</span>
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-neutral-800">{p.does}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section className="mt-16" aria-labelledby="how-h">
        <h2 id="how-h" className="display text-[34px] sm:text-[40px]">
          {landing.steps.title}
        </h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {landing.steps.items.map((s, i) => (
            <li
              key={s.title}
              className={`rounded-2xl border border-ink p-4 ${s.human ? 'bg-accent-fill shadow-hard' : 'bg-white shadow-hard-sm'}`}
            >
              <span
                className="display flex h-9 w-9 items-center justify-center rounded-full border border-ink bg-white text-[22px]"
                aria-hidden
              >
                {s.human ? <PersonIcon width={18} height={18} /> : i + 1}
              </span>
              <p className="mt-3 text-[15px] font-semibold">{s.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-neutral-800">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Why now */}
      <section className="mt-16" aria-labelledby="why-h">
        <h2 id="why-h" className="display text-[34px] sm:text-[40px]">
          {landing.whyNow.title}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {landing.whyNow.stats.map((s) => (
            <figure key={s.figure} className="card flex flex-col p-5">
              <p className="display text-[72px] leading-[0.8]">{s.figure}</p>
              <figcaption className="mt-3 flex-1 text-[15px] leading-relaxed text-neutral-800">{s.text}</figcaption>
              <div className="mt-4 border-t border-ink/15 pt-3">
                <SourceList sources={[s.source]} />
              </div>
            </figure>
          ))}
        </div>
      </section>

      {/* Your options today */}
      <section className="mt-16" aria-labelledby="compare-h">
        <h2 id="compare-h" className="display text-[34px] sm:text-[40px]">
          {landing.compare.title}
        </h2>
        <div className="card mt-6 overflow-hidden !p-0">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-ink">
                <th scope="col" className="p-3 sm:p-4">
                  <span className="sr-only">Option</span>
                </th>
                {landing.compare.columns.map((c) => (
                  <th key={c} scope="col" className="p-2 text-center text-[12px] font-semibold sm:p-4 sm:text-[13px]">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {landing.compare.rows.map((r) => (
                <tr key={r.option} className={`border-b border-ink/15 last:border-0 ${r.highlight ? 'bg-lime' : ''}`}>
                  <th scope="row" className={`p-3 sm:p-4 ${r.highlight ? 'display text-[22px]' : 'font-medium'}`}>
                    {r.option}
                  </th>
                  {r.values.map((v, i) => (
                    <td key={i} className="p-2 text-center sm:p-4">
                      {v ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-ink bg-white">
                          <CheckIcon width={16} height={16} />
                          <span className="sr-only">Yes</span>
                        </span>
                      ) : (
                        <span className="text-[18px] text-neutral-500">
                          <span aria-hidden>–</span>
                          <span className="sr-only">No</span>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* The boundary + final CTA */}
      <section className="card mt-16 !bg-lime p-6 !shadow-hard-lg sm:p-8">
        <h2 className="display text-[34px] sm:text-[44px]">{landing.boundary.title}</h2>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-neutral-900">{landing.boundary.body}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" className={`${btn.secondary} !px-6`} onClick={start}>
            <ChatBubbleIcon width={18} height={18} /> {landing.boundary.cta}
          </button>
          <Link to={signedIn ? '/ask-adviser' : '/talk'} className={btn.adviser}>
            <PersonIcon width={18} height={18} /> Talk to a person
          </Link>
        </div>
      </section>
    </main>
  );
}

/** A real answer from the tree, rendered like the chat so people see the product before they start. */
function ChatPreview() {
  const node = newClientFlow.nodes[landing.preview.nodeId];
  return (
    <section aria-label="Example answer" className="card relative mt-10 p-4 sm:p-6">
      <span className="absolute -top-3 left-5 rounded-full border border-ink bg-sun px-2.5 py-0.5 text-[12px] font-semibold">
        A real answer
      </span>
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-[20px] rounded-br-md bg-ink px-4 py-2.5 text-[15px] text-white">
          {landing.preview.question}
        </p>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink bg-white" aria-hidden>
          <ChatBubbleIcon width={15} height={15} />
        </span>
        <div className="min-w-0 space-y-1.5">
          <p className="pl-1 text-[12px] text-neutral-700">
            Future You <span className="rounded-md border border-ink px-1 text-[10px] font-semibold">AI</span>
          </p>
          {node.messages.slice(0, landing.preview.messages).map((m) => (
            <p key={m} className="w-fit rounded-[20px] border border-ink bg-lime-50 px-4 py-2.5 text-[15px] leading-relaxed">
              {m}
            </p>
          ))}
          {node.sources && (
            <div className="pt-1 pl-1">
              <SourceList sources={node.sources} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function WelcomeBack({ existingTo }: { existingTo: string }) {
  const navigate = useNavigate();
  const plan = useAppState((s) => s.plan);
  if (!plan) return null;
  const done = plan.steps.filter((s) => s.done).length;
  const w = landing.welcomeBack;

  return (
    // P4: a returning visitor goes straight back to where they were.
    <section className="card mt-8 p-5">
      <h2 className="display text-[28px]">{w.title}</h2>
      <p className="mt-1 text-[15px] text-neutral-700">
        {w.body} {done} of {plan.steps.length} steps done.
      </p>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full border border-ink bg-white" aria-hidden>
        <div className="h-full bg-lime-strong" style={{ width: `${plan.steps.length ? (done / plan.steps.length) * 100 : 0}%` }} />
      </div>
      {plan.checkIns === 'payment' && (
        // P1: the check-in is triggered by her income arriving.
        <div className="mt-4 rounded-2xl border border-ink bg-lime-50 p-4">
          <button
            type="button"
            className={`${btn.primary} w-full sm:w-auto`}
            onClick={() => {
              actions.startWithQuestion(w.paymentLanded, w.paymentLandedNode);
              navigate('/chat');
            }}
          >
            {w.paymentLanded}
          </button>
          <p className="mt-2 text-[13px] text-neutral-700">{w.paymentLandedHint}</p>
        </div>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" className={btn.primary} onClick={() => navigate('/plan')}>
          {w.openPlan}
        </button>
        <button type="button" className={btn.secondary} onClick={() => navigate('/chat')}>
          {w.continueChat}
        </button>
      </div>
      <Link to={existingTo} className={`${btn.ghost} mt-4`}>
        {landing.existingLabel}
      </Link>
    </section>
  );
}
