import { useEffect, useRef, useState, type Dispatch } from 'react'
import { useLab } from '../lab/LabContext'
import { GuestRow } from './GuestRow'
import {
  CAPACITY,
  MAX_INFANTS,
  blockReason,
  canDecrement,
  canIncrement,
  occupancy,
  summarize,
  type BlockReason,
  type GuestAction,
  type GuestKey,
  type Guests,
} from './guestState'

const ROWS: { key: GuestKey; label: string; noun: string; hint: string }[] = [
  { key: 'adults', label: 'Adults', noun: 'adult', hint: 'Ages 13+' },
  { key: 'children', label: 'Children', noun: 'child', hint: 'Ages 2–12' },
  { key: 'infants', label: 'Infants', noun: 'infant', hint: 'Under 2' },
]

const BLOCKED_COPY: Record<BlockReason, string> = {
  capacity: `Casa Oliva sleeps ${CAPACITY}. Infants don't count.`,
  infants: `${MAX_INFANTS} cribs available — up to ${MAX_INFANTS} infants.`,
  'adult-min': 'Every stay needs at least 1 adult.',
  min: '',
}

type Props = { guests: Guests; dispatch: Dispatch<GuestAction> }

/**
 * The rows + capacity note. Rendered by BOTH the popover and the sheet —
 * this is "presentation changes, state doesn't" in practice: neither
 * container knows anything about guest rules.
 */
export function GuestFields({ guests, dispatch }: Props) {
  const { reduceMotion, timeScale } = useLab()
  const [blocked, setBlocked] = useState<{ reason: BlockReason; n: number } | null>(null)
  const noteRef = useRef<HTMLParagraphElement>(null)
  const atCapacity = occupancy(guests) >= CAPACITY

  const note =
    blocked && BLOCKED_COPY[blocked.reason]
      ? BLOCKED_COPY[blocked.reason]
      : atCapacity
        ? `At capacity — Casa Oliva sleeps ${CAPACITY}.`
        : `Up to ${CAPACITY} guests. Infants don't count.`

  // A pressed-but-unavailable button brightens the note once. Color only, no
  // movement, so it reads the same with reduced motion. WAAPI restarts on
  // every press, which is what we want for a "you hit the wall" signal.
  useEffect(() => {
    if (!blocked || blocked.reason === 'min' || !noteRef.current) return
    noteRef.current.animate(
      [{ color: 'var(--ink)' }, { color: 'var(--ink-muted)' }],
      { duration: (reduceMotion ? 400 : 900) * timeScale, easing: 'ease-out' },
    )
  }, [blocked, reduceMotion, timeScale])

  return (
    <>
      <div className="guest-rows">
        {ROWS.map((row, i) => (
          <GuestRow
            key={row.key}
            index={i}
            label={row.label}
            noun={row.noun}
            hint={row.hint}
            value={guests[row.key]}
            canDecrement={canDecrement(guests, row.key)}
            canIncrement={canIncrement(guests, row.key)}
            onChange={(dir) => {
              setBlocked(null)
              dispatch({ type: dir === 1 ? 'increment' : 'decrement', key: row.key })
            }}
            onBlocked={(dir) =>
              setBlocked((b) => ({ reason: blockReason(row.key, dir), n: (b?.n ?? 0) + 1 }))
            }
          />
        ))}
      </div>
      <p ref={noteRef} className="panel-note stagger" data-at-capacity={atCapacity || undefined} aria-live="polite">
        {note}
      </p>
      {/* Announces the result of each press for screen-reader users. */}
      <span className="sr-only" aria-live="polite">
        {summarize(guests)}
      </span>
    </>
  )
}
