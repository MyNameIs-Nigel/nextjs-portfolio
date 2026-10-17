// Calendar dates are kept as `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` strings and are
// never converted through local time, so a day can't shift with the viewer's timezone.

/** Pads a partial date to a full calendar day: `1998` → `1998-01-01`, `1998-06` → `1998-06-01`. */
export function fullDate(date: string) {
  return date.length === 4 ? `${date}-01-01` : date.length === 7 ? `${date}-01` : date;
}

/** True when a `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` string names a real calendar date. */
export function isCalendarDate(value: string) {
  const full = fullDate(value);
  const date = new Date(`${full}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === full;
}
