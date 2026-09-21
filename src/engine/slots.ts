import { handover } from '../content/newClientFlow';

// v0 mock availability for the booking calendar. Deterministic per date so the
// same day always shows the same free times; a real app would ask the
// adviser's calendar instead.

export type DaySlots = { date: Date; times: Date[] };

export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Small stable hash so some slots look already taken.
function taken(key: string, i: number) {
  let h = 0;
  for (const c of `${key}#${i}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 3 === 0;
}

/** Free times from tomorrow for `handover.availability.daysAhead` days, keyed by dayKey. */
export function availableSlots(from = new Date()): Map<string, Date[]> {
  const { daysAhead, hours } = handover.availability;
  const out = new Map<string, Date[]>();
  const start = startOfDay(from);
  for (let n = 1; n <= daysAhead; n++) {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + n);
    const key = dayKey(day);
    const times = (hours[day.getDay()] ?? [])
      .filter((_, i) => !taken(key, i))
      .map((t) => {
        const [h, m] = t.split(':').map(Number);
        return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
      });
    if (times.length) out.set(key, times);
  }
  return out;
}

export const formatTime = (d: Date) => d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });
export const formatDay = (d: Date) => d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
export const formatSlot = (d: Date) => `${formatDay(d)}, ${formatTime(d)}`;
