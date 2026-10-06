/**
 * The single source of truth for the stay dates.
 *
 * Same idea as guestState: every rule is a pure function, the calendar
 * renders from them, and the reducer refuses anything they reject. The
 * committed range (start/end) is ALWAYS a valid, bookable stay — prices are
 * computed from it, so it can never be half-picked or span a booked night.
 */
import { addDays, addMonths, diffDays, fmtShort, monthOf, type ISODate, type MonthKey } from './dateUtils'

/** Prototype clock — fixed so the demo range is always in the future. */
export const TODAY: ISODate = '2026-10-06'
export const MIN_NIGHTS = 2
export const MAX_NIGHTS = 14

/** Nights already taken (the night *starting* on each date). */
const BOOKED_NIGHTS = new Set<ISODate>([
  '2026-10-22',
  '2026-10-23',
  '2026-10-24',
  '2026-11-06',
  '2026-11-07',
  '2026-11-08',
])

export const FIRST_MONTH: MonthKey = monthOf(TODAY)
export const LAST_MONTH: MonthKey = addMonths(FIRST_MONTH, 11)

export const isBookedNight = (d: ISODate) => BOOKED_NIGHTS.has(d)

export type DateState = {
  /** Committed check-in. */
  start: ISODate
  /** Committed check-out. */
  end: ISODate
  /** A check-in picked while choosing a new check-out. Never committed on its own. */
  pending: ISODate | null
  /** Month on screen. Lifted so a resize mid-pick lands on the same month. */
  view: MonthKey
}

export const initialDates: DateState = {
  start: '2026-10-16',
  end: '2026-10-20',
  pending: null,
  view: '2026-10',
}

/** Why a day can't be pressed. */
export type DateBlock = 'past' | 'booked' | 'gap' | 'min' | 'max' | 'spans-booked' | 'window'

function nightsFree(start: ISODate, nights: number) {
  for (let i = 0; i < nights; i++) if (isBookedNight(addDays(start, i))) return false
  return true
}

const inWindow = (d: ISODate) => monthOf(d) <= LAST_MONTH

export function checkInBlock(d: ISODate): DateBlock | null {
  if (d < TODAY) return 'past'
  if (!inWindow(d)) return 'window'
  if (isBookedNight(d)) return 'booked'
  if (!nightsFree(d, MIN_NIGHTS)) return 'gap'
  return null
}

export function checkOutBlock(start: ISODate, d: ISODate): DateBlock | null {
  const n = diffDays(start, d)
  if (n < MIN_NIGHTS) return 'min'
  if (n > MAX_NIGHTS) return 'max'
  if (!nightsFree(start, n)) return 'spans-booked'
  return null
}

/**
 * What pressing day `d` would be blocked by, given the current state.
 * While a check-in is pending, later days are judged as check-outs; earlier
 * days restart the selection as a new check-in.
 */
export function dayBlock(s: DateState, d: ISODate): DateBlock | null {
  if (s.pending && d > s.pending) return checkOutBlock(s.pending, d)
  return checkInBlock(d)
}

export type DateAction =
  | { type: 'select'; date: ISODate }
  | { type: 'cancelPending' }
  | { type: 'showMonth'; month: MonthKey }
  | { type: 'shiftMonth'; by: 1 | -1 }
  | { type: 'showStayMonth' }

const clampMonth = (m: MonthKey) => (m < FIRST_MONTH ? FIRST_MONTH : m > LAST_MONTH ? LAST_MONTH : m)

export function datesReducer(s: DateState, a: DateAction): DateState {
  switch (a.type) {
    case 'select': {
      if (dayBlock(s, a.date)) return s
      if (s.pending && a.date > s.pending) return { ...s, start: s.pending, end: a.date, pending: null }
      return { ...s, pending: a.date }
    }
    case 'cancelPending':
      return s.pending ? { ...s, pending: null } : s
    case 'showMonth':
    case 'shiftMonth':
    case 'showStayMonth': {
      // shiftMonth is relative to the *current* state, so rapid clicks each advance a month.
      const target = a.type === 'showMonth' ? a.month : a.type === 'shiftMonth' ? addMonths(s.view, a.by) : monthOf(s.start)
      const view = clampMonth(target)
      return view === s.view ? s : { ...s, view }
    }
  }
}

export const nights = (s: DateState) => diffDays(s.start, s.end)

/** Trigger copy — matches the original "Oct 16 - Oct 20". */
export function summarizeDates(s: DateState) {
  if (s.pending) return `${fmtShort(s.pending)} - Check-out`
  return `${fmtShort(s.start)} - ${fmtShort(s.end)}`
}
