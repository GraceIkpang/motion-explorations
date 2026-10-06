import { AnimatePresence, motion, useIsPresent } from 'motion/react'
import { useEffect, useId, useRef, useState, type Dispatch, type KeyboardEvent } from 'react'
import { useLab } from '../lab/LabContext'
import {
  FIRST_MONTH,
  LAST_MONTH,
  MAX_NIGHTS,
  MIN_NIGHTS,
  TODAY,
  dayBlock,
  isBookedNight,
  nights,
  type DateAction,
  type DateBlock,
  type DateState,
} from './dateState'
import {
  addDays,
  addMonthsToDate,
  fmtLong,
  fmtMonth,
  fmtShort,
  monthCells,
  monthOf,
  weekday,
  type ISODate,
  type MonthKey,
} from './dateUtils'

const EASE_OUT = [0.23, 1, 0.32, 1] as const
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const BLOCKED_COPY: Record<DateBlock, string> = {
  past: 'That date has already passed.',
  window: 'Bookings open 12 months ahead.',
  booked: 'That night is already booked.',
  gap: `Not enough free nights there — ${MIN_NIGHTS}-night minimum.`,
  min: `Casa Oliva has a ${MIN_NIGHTS}-night minimum.`,
  max: `Stays are up to ${MAX_NIGHTS} nights.`,
  'spans-booked': "Your stay can't include a booked night.",
}

type Props = { dates: DateState; dispatch: Dispatch<DateAction> }

/**
 * The calendar. Rendered by BOTH the popover and the sheet. Everything that
 * must survive a presentation swap (range, pending check-in, visible month)
 * lives in dateState; only transient UI (hover preview, focused day) is local.
 */
export function DateFields({ dates, dispatch }: Props) {
  const { reduceMotion, timeScale } = useLab()
  const headingId = useId()
  const [focused, setFocused] = useState<ISODate>(dates.pending ?? dates.start)
  const [hover, setHover] = useState<ISODate | null>(null)
  const [blocked, setBlocked] = useState<{ reason: DateBlock; n: number } | null>(null)
  const keyboardMove = useRef(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const noteRef = useRef<HTMLParagraphElement>(null)
  const { view } = dates

  // Month direction, derived during render (same pattern as AnimatedCount).
  const [last, setLast] = useState({ view, dir: 1 })
  if (last.view !== view) setLast({ view, dir: view > last.view ? 1 : -1 })
  const dir = last.view !== view ? (view > last.view ? 1 : -1) : last.dir

  // Roving tabindex: exactly one day in the visible month is tabbable.
  const tabStop =
    [focused, dates.pending, dates.start, dates.end].find((d) => d && monthOf(d) === view) ?? `${view}-01`

  // After an arrow-key move, focus the new day — in the *entering* month grid.
  useEffect(() => {
    if (!keyboardMove.current) return
    keyboardMove.current = false
    viewportRef.current
      ?.querySelector<HTMLElement>(`[data-month="${view}"] [data-date="${focused}"]`)
      ?.focus({ preventScroll: true })
  }, [focused, view])

  useEffect(() => {
    if (!blocked || !noteRef.current) return
    noteRef.current.animate([{ color: 'var(--ink)' }, { color: 'var(--ink-muted)' }], {
      duration: (reduceMotion ? 400 : 900) * timeScale,
      easing: 'ease-out',
    })
  }, [blocked, reduceMotion, timeScale])

  const moveFocus = (to: ISODate) => {
    if (monthOf(to) < FIRST_MONTH || monthOf(to) > LAST_MONTH) return
    keyboardMove.current = true
    setFocused(to)
    if (monthOf(to) !== view) dispatch({ type: 'showMonth', month: monthOf(to) })
  }

  // Standard ARIA date-grid keys — nothing invented.
  const onGridKeyDown = (e: KeyboardEvent) => {
    const from = tabStop
    const map: Record<string, () => ISODate> = {
      ArrowLeft: () => addDays(from, -1),
      ArrowRight: () => addDays(from, 1),
      ArrowUp: () => addDays(from, -7),
      ArrowDown: () => addDays(from, 7),
      Home: () => addDays(from, -weekday(from)),
      End: () => addDays(from, 6 - weekday(from)),
      PageUp: () => addMonthsToDate(from, -1),
      PageDown: () => addMonthsToDate(from, 1),
    }
    const next = map[e.key]
    if (!next) return
    e.preventDefault()
    moveFocus(next())
  }

  const press = (d: ISODate) => {
    const reason = dayBlock(dates, d)
    if (reason) {
      setBlocked((b) => ({ reason, n: (b?.n ?? 0) + 1 }))
      return
    }
    setBlocked(null)
    setFocused(d)
    dispatch({ type: 'select', date: d })
  }

  // Hover preview of the range while choosing check-out (no animation: it fires constantly).
  const previewEnd = dates.pending && hover && hover > dates.pending && !dayBlock(dates, hover) ? hover : null
  const rangeStart = dates.pending ?? dates.start
  const rangeEnd = dates.pending ? previewEnd : dates.end

  const n = nights(dates)
  const note = blocked
    ? BLOCKED_COPY[blocked.reason]
    : dates.pending
      ? `Check-in ${fmtShort(dates.pending)} · now pick check-out (${MIN_NIGHTS}-night min)`
      : `${n} nights · ${fmtShort(dates.start)} – ${fmtShort(dates.end)}`

  const atFirst = view <= FIRST_MONTH
  const atLast = view >= LAST_MONTH

  return (
    <>
      <div className="cal-head stagger" style={{ '--i': 0 } as React.CSSProperties}>
        <button
          type="button"
          className="counter-btn cal-nav"
          aria-label="Previous month"
          aria-disabled={atFirst || undefined}
          data-disabled={atFirst || undefined}
          onClick={() => !atFirst && dispatch({ type: 'shiftMonth', by: -1 })}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M7.5 2.5 4 6l3.5 3.5" />
          </svg>
        </button>
        <h3 className="cal-month" id={headingId} aria-live="polite">
          {fmtMonth(view)}
        </h3>
        <button
          type="button"
          className="counter-btn cal-nav"
          aria-label="Next month"
          aria-disabled={atLast || undefined}
          data-disabled={atLast || undefined}
          onClick={() => !atLast && dispatch({ type: 'shiftMonth', by: 1 })}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M4.5 2.5 8 6 4.5 9.5" />
          </svg>
        </button>
      </div>

      <div className="cal-weekdays stagger" aria-hidden="true" style={{ '--i': 1 } as React.CSSProperties}>
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div
        ref={viewportRef}
        className="cal-viewport stagger"
        style={{ '--i': 2 } as React.CSSProperties}
        onKeyDown={onGridKeyDown}
        onMouseLeave={() => setHover(null)}
      >
        <AnimatePresence initial={false} custom={dir}>
          <MonthGrid
            key={view}
            month={view}
            dir={dir}
            travel={reduceMotion ? 0 : 20}
            duration={(reduceMotion ? 0.12 : 0.22) * timeScale}
            labelledBy={headingId}
            render={(d) => {
              const block = dayBlock(dates, d)
              const isStart = d === rangeStart
              const isEnd = d === rangeEnd
              const inBand = !!rangeEnd && d > rangeStart && d < rangeEnd
              const band = rangeEnd ? (isStart ? 'start' : isEnd ? 'end' : inBand ? 'mid' : undefined) : undefined
              const label =
                fmtLong(d) +
                (isStart ? (dates.pending ? ', selected check-in' : ', check-in') : '') +
                (isEnd && !dates.pending ? ', check-out' : '') +
                (isBookedNight(d) ? ', booked' : '')
              return {
                band,
                preview: !!dates.pending && !!band,
                button: (
                  <button
                    type="button"
                    className="day"
                    data-date={d}
                    data-endpoint={isStart || isEnd || undefined}
                    data-unavailable={block ?? undefined}
                    data-booked={isBookedNight(d) || undefined}
                    data-today={d === TODAY || undefined}
                    tabIndex={d === tabStop ? 0 : -1}
                    aria-label={label}
                    aria-pressed={isStart || isEnd}
                    aria-disabled={block ? true : undefined}
                    onClick={() => press(d)}
                    onFocus={() => setFocused(d)}
                    onMouseEnter={() => setHover(d)}
                  >
                    {Number(d.slice(8))}
                  </button>
                ),
              }
            }}
          />
        </AnimatePresence>
      </div>

      <p ref={noteRef} className="panel-note stagger" aria-live="polite" style={{ '--i': 3 } as React.CSSProperties}>
        {note}
      </p>
    </>
  )
}

type Cell = { band?: 'start' | 'mid' | 'end'; preview: boolean; button: React.ReactNode }

/**
 * One month. Keyed by month, so changing months is an enter/exit pair that
 * slides in the direction of travel. The leaving grid goes inert so it can't
 * be focused or read while it fades.
 */
function MonthGrid({
  month,
  dir,
  travel,
  duration,
  labelledBy,
  render,
}: {
  month: MonthKey
  dir: number
  travel: number
  duration: number
  labelledBy: string
  render: (d: ISODate) => Cell
}) {
  const isPresent = useIsPresent()
  const cells = monthCells(month)
  const weeks = Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7))

  return (
    <motion.div
      className="cal-grid"
      role="grid"
      aria-labelledby={labelledBy}
      data-month={month}
      inert={!isPresent}
      custom={dir}
      variants={{
        enter: (d: number) => ({ opacity: 0, transform: `translateX(${d * travel}px)` }),
        center: { opacity: 1, transform: 'translateX(0px)' },
        exit: (d: number) => ({ opacity: 0, transform: `translateX(${-d * travel}px)` }),
      }}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration, ease: EASE_OUT }}
    >
      {weeks.map((week, w) => (
        <div className="cal-week" role="row" key={w}>
          {week.map((d, i) => {
            if (!d) return <div className="cal-cell" role="gridcell" key={i} />
            const cell = render(d)
            return (
              <div
                className="cal-cell"
                role="gridcell"
                key={d}
                data-band={cell.band}
                data-preview={cell.preview || undefined}
                aria-selected={cell.band === 'start' || cell.band === 'end' || undefined}
              >
                {cell.button}
              </div>
            )
          })}
        </div>
      ))}
    </motion.div>
  )
}
