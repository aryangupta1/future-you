import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { handover } from '../content/newClientFlow';
import { availableSlots, dayKey, formatDay, formatTime } from '../engine/slots';

// Booking picker in the Calendly / Cal.com pattern: a month grid of days with
// free times, then the times for the chosen day. Sky blue throughout because
// this is a human-adviser moment.

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // Monday-first weeks
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function BookingCalendar({ value, onChange }: { value: Date | null; onChange: (slot: Date | null) => void }) {
  const slots = useMemo(() => availableSlots(), []);
  const keys = useMemo(() => [...slots.keys()], [slots]);
  const firstFree = new Date(`${keys[0]}T00:00`);
  const lastFree = new Date(`${keys[keys.length - 1]}T00:00`);

  const [selectedDay, setSelectedDay] = useState<string | null>(value ? dayKey(value) : null);
  const [view, setView] = useState(() => {
    const d = value ?? firstFree;
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [focusKey, setFocusKey] = useState<string>(selectedDay ?? keys[0]);
  const gridRef = useRef<HTMLDivElement>(null);

  const cells = monthGrid(view.y, view.m);
  const monthLabel = new Date(view.y, view.m, 1).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  const canPrev = view.y * 12 + view.m > firstFree.getFullYear() * 12 + firstFree.getMonth();
  const canNext = view.y * 12 + view.m < lastFree.getFullYear() * 12 + lastFree.getMonth();

  // Keep the roving focus target inside the visible month.
  const focusInView = cells.some((c) => c && dayKey(c) === focusKey);
  const tabKey = focusInView ? focusKey : dayKey(cells.find((c) => c && slots.has(dayKey(c))) ?? cells.find(Boolean)!);

  const shiftMonth = (delta: number) => setView(({ y, m }) => ({ y: new Date(y, m + delta).getFullYear(), m: new Date(y, m + delta).getMonth() }));

  const pickDay = (key: string) => {
    setSelectedDay(key);
    setFocusKey(key);
    if (value && dayKey(value) !== key) onChange(null);
  };

  const onGridKey = (e: KeyboardEvent) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!step) return;
    e.preventDefault();
    const cur = new Date(`${tabKey}T00:00`);
    const next = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + step);
    const nextKey = dayKey(next);
    if (next.getMonth() !== view.m || next.getFullYear() !== view.y) setView({ y: next.getFullYear(), m: next.getMonth() });
    setFocusKey(nextKey);
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${nextKey}"]`)?.focus());
  };

  const times = selectedDay ? slots.get(selectedDay) ?? [] : [];

  return (
    <div className="card grid gap-5 p-4 sm:grid-cols-[1fr_200px] sm:p-5">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="display text-[24px] leading-none" aria-live="polite">
            {monthLabel}
          </p>
          <div className="flex gap-1.5">
            {[
              { d: -1, ok: canPrev, label: handover.prevMonth, glyph: '‹' },
              { d: 1, ok: canNext, label: handover.nextMonth, glyph: '›' },
            ].map((b) => (
              <button
                key={b.d}
                type="button"
                disabled={!b.ok}
                onClick={() => shiftMonth(b.d)}
                aria-label={b.label}
                className="press flex h-9 w-9 items-center justify-center rounded-lg border border-ink bg-white text-[20px] leading-none shadow-hard-sm hover:bg-accent-tint disabled:opacity-30 disabled:shadow-none"
              >
                {b.glyph}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-semibold tracking-wide text-neutral-600 uppercase" aria-hidden>
          {WEEKDAYS.map((w) => (
            <span key={w} className="py-1">
              {w}
            </span>
          ))}
        </div>
        <div ref={gridRef} role="group" aria-label={monthLabel} className="grid grid-cols-7 gap-1" onKeyDown={onGridKey}>
          {cells.map((c, i) => {
            if (!c) return <span key={`e${i}`} />;
            const key = dayKey(c);
            const free = slots.has(key);
            const selected = key === selectedDay;
            return (
              <button
                key={key}
                type="button"
                data-day={key}
                tabIndex={key === tabKey ? 0 : -1}
                aria-disabled={!free}
                aria-pressed={selected}
                aria-label={`${formatDay(c)}${free ? '' : ', unavailable'}`}
                onClick={() => free && pickDay(key)}
                className={`flex aspect-square items-center justify-center rounded-lg text-[15px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${
                  selected
                    ? 'border border-ink bg-accent-fill font-semibold shadow-hard-sm'
                    : free
                      ? 'border border-ink/30 bg-accent-tint font-semibold text-accent-dark hover:border-ink'
                      : 'cursor-default text-neutral-400'
                }`}
              >
                {c.getDate()}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[13px] text-neutral-600">{handover.timeZoneNote}</p>
      </div>

      <div className="sm:border-l sm:border-ink/20 sm:pl-5">
        {selectedDay ? (
          <>
            <p className="mb-2 text-[14px] font-medium">
              <span className="sr-only">{handover.timesFor} </span>
              {formatDay(new Date(`${selectedDay}T00:00`))}
            </p>
            {times.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-1" role="radiogroup" aria-label={handover.slotsLabel}>
                {times.map((t) => {
                  const on = value?.getTime() === t.getTime();
                  return (
                    <button
                      key={t.toISOString()}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => onChange(t)}
                      className={`press rounded-xl border border-ink px-3 py-2.5 text-[15px] font-medium ${
                        on ? 'bg-accent-fill shadow-hard-sm' : 'bg-white hover:bg-accent-tint'
                      }`}
                    >
                      {formatTime(t)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-[14px] text-neutral-600">{handover.noTimes}</p>
            )}
          </>
        ) : (
          <p className="text-[14px] text-neutral-600">{handover.dayPrompt}</p>
        )}
      </div>
    </div>
  );
}
