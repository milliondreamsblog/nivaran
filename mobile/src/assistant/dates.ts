import { isISODate } from '../core/index';

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4, may: 5, jun: 6, june: 6,
  jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};
const pad = (n: number) => String(n).padStart(2, '0');

/** Accepts 2025-04-15, 15/04/2025, 15-04-2025, 15 April 2025, April 15 2025. Returns ISO or null. Never guesses a missing part. */
export function parseDate(text: string): string | null {
  const t = text.trim().toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ');
  let match = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) return check(`${match[1]}-${pad(+match[2])}-${pad(+match[3])}`);
  match = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (match) return check(`${match[3]}-${pad(+match[2])}-${pad(+match[1])}`);
  match = t.match(/^(\d{1,2})(?:st|nd|rd|th)? ([a-z]+) (\d{4})$/);
  if (match && MONTHS[match[2]]) return check(`${match[3]}-${pad(MONTHS[match[2]])}-${pad(+match[1])}`);
  match = t.match(/^([a-z]+) (\d{1,2})(?:st|nd|rd|th)? (\d{4})$/);
  if (match && MONTHS[match[1]]) return check(`${match[3]}-${pad(MONTHS[match[1]])}-${pad(+match[2])}`);
  return null;
}

function check(iso: string): string | null {
  return isISODate(iso) ? iso : null;
}
