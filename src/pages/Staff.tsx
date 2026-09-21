import { useState } from 'react';
import { staff } from '../content/service';
import { newClientFlow } from '../content/newClientFlow';
import { existingClientFlow } from '../content/existingClientFlow';
import { classify, computeMeasures, type Measures } from '../engine/measures';
import { useAppState } from '../state/store';
import { Page, V0Note } from '../components/ui';
import { AlertIcon, CheckIcon } from '../components/icons';

// Feature 9: Murray sees the four engagement measures. Story A6: every digital
// interaction goes through the same monitoring the human advisers get.

const flows = { newClient: newClientFlow, existingClient: existingClientFlow };

const flowLabel = { newClient: 'Anonymous', existingClient: 'Client' } as const;

const time = (iso: string) =>
  new Date(iso).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export function Staff() {
  const log = useAppState((s) => s.log);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const measures = computeMeasures(log, flows);

  const rows = [...log]
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((e) => ({ event: e, outcome: classify(e, flows) }))
    .filter((r) => !flaggedOnly || r.outcome.flagged);
  const flaggedCount = log.filter((e) => classify(e, flows).flagged).length;

  return (
    <Page wide>
      <h1 className="text-[28px] font-semibold tracking-tight">{staff.title}</h1>
      <p className="mt-2 text-[16px] leading-relaxed text-neutral-700">{staff.intro}</p>
      <V0Note>{staff.mockNote}</V0Note>

      <section aria-labelledby="measures-h" className="mt-8">
        <h2 id="measures-h" className="text-[17px] font-semibold">
          {staff.measuresTitle}
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {(Object.keys(staff.measures) as (keyof Measures)[]).map((key) => {
            const m = staff.measures[key];
            const met = measures[key];
            return (
              <li key={key} className="rounded-2xl border border-neutral-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[15px] font-semibold">{m.label}</p>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium ${
                      met ? 'bg-neutral-950 text-white' : 'border border-neutral-300 text-neutral-600'
                    }`}
                  >
                    {met && <CheckIcon width={13} height={13} />}
                    {met ? 'Met' : 'Not yet'}
                  </span>
                </div>
                <p className="mt-1 text-[14px] text-neutral-600">{m.definition}</p>
                <p className="mt-2 text-[12px] text-neutral-500">{staff.measuresTarget}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="log-h" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="log-h" className="text-[17px] font-semibold">
              {staff.logTitle}
            </h2>
            <p className="mt-1 text-[14px] text-neutral-600">{staff.logIntro}</p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[14px]">
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={(e) => setFlaggedOnly(e.target.checked)}
              className="h-4 w-4 accent-neutral-950"
            />
            {staff.flaggedOnly} ({flaggedCount})
          </label>
        </div>

        {rows.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-neutral-300 p-5 text-[15px] text-neutral-600">
            {flaggedOnly ? 'No flagged exchanges.' : staff.logEmpty}
          </p>
        ) : (
          <ol className="mt-4 divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
            {rows.map(({ event, outcome }, i) => (
              <li key={i} className={`px-4 py-3 ${outcome.flagged ? 'bg-neutral-50' : ''}`}>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-neutral-500">
                  <time dateTime={event.at}>{time(event.at)}</time>
                  {event.kind === 'chat' && <span>· {flowLabel[event.flow]}</span>}
                  {outcome.flagged && (
                    <span className="inline-flex items-center gap-1 font-semibold text-neutral-950">
                      <AlertIcon width={13} height={13} /> Review: {outcome.reason}
                    </span>
                  )}
                </div>
                {event.kind === 'chat' && <p className="mt-1 text-[15px] font-medium">“{event.question}”</p>}
                <p className={`text-[14px] text-neutral-700 ${event.kind === 'chat' ? '' : 'mt-1'}`}>{outcome.label}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Page>
  );
}
