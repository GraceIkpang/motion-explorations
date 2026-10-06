/**
 * Dates are plain 'YYYY-MM-DD' strings in state: serialisable, timezone-free,
 * and they compare correctly with < and >. Date objects only exist inside
 * these helpers.
 */
export type ISODate = string
/** 'YYYY-MM' */
export type MonthKey = string

const pad = (n: number) => String(n).padStart(2, '0')

export const toISO = (d: Date): ISODate => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const fromISO = (s: ISODate) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (s: ISODate, n: number): ISODate => {
  const d = fromISO(s)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

/** Whole days from a to b. Rounded so DST shifts don't produce 3.96 nights. */
export const diffDays = (a: ISODate, b: ISODate) => Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86_400_000)

export const monthOf = (s: ISODate): MonthKey => s.slice(0, 7)

export const addMonths = (m: MonthKey, n: number): MonthKey => {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo - 1 + n, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

/** Same day-of-month in another month, clamped (Jan 31 → Feb 28). */
export const addMonthsToDate = (s: ISODate, n: number): ISODate => {
  const target = addMonths(monthOf(s), n)
  const day = Math.min(Number(s.slice(8)), daysInMonth(target))
  return `${target}-${pad(day)}`
}

export const daysInMonth = (m: MonthKey) => {
  const [y, mo] = m.split('-').map(Number)
  return new Date(y, mo, 0).getDate()
}

export const weekday = (s: ISODate) => fromISO(s).getDay()

/** Always 6 weeks × 7 days, so switching months never changes the panel's height. */
export function monthCells(m: MonthKey): (ISODate | null)[] {
  const first = `${m}-01`
  const lead = weekday(first)
  const count = daysInMonth(m)
  return Array.from({ length: 42 }, (_, i) => {
    const day = i - lead + 1
    return day >= 1 && day <= count ? `${m}-${pad(day)}` : null
  })
}

export const fmtShort = (s: ISODate) => fromISO(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const fmtMonth = (m: MonthKey) =>
  fromISO(`${m}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

export const fmtLong = (s: ISODate) =>
  fromISO(s).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

/** "Oct 16 – 20", or "Oct 30 – Nov 2" across months. */
export function fmtRange(a: ISODate, b: ISODate) {
  return monthOf(a) === monthOf(b) ? `${fmtShort(a)} – ${Number(b.slice(8))}` : `${fmtShort(a)} – ${fmtShort(b)}`
}
