import { useEffect, useState, type RefObject } from 'react'
import { fmtRange } from '../dates/dateUtils'
import { nights, type DateState } from '../dates/dateState'
import { summarize, type Guests } from '../guests/guestState'
import { quote, usd } from '../villa'

type Props = {
  heroRef: RefObject<HTMLElement | null>
  bookingRef: RefObject<HTMLElement | null>
  dates: DateState
  guests: Guests
  requested: boolean
  /** A sheet is open — the bar steps aside instead of sitting under it. */
  suppressed: boolean
  onReserve: () => void
}

/**
 * Phones only. Keeps the live booking within thumb reach in the stretch
 * between the hero and the booking band. It appears once the hero is gone,
 * leaves as soon as the real booking panel is in view, and otherwise stays
 * still — no movement tied to scroll position.
 */
export function BookingBar({ heroRef, bookingRef, dates, guests, requested, suppressed, onReserve }: Props) {
  const heroVisible = useInView(heroRef)
  const bookingVisible = useInView(bookingRef)
  const visible = !heroVisible && !bookingVisible && !suppressed
  const { total } = quote(nights(dates))

  return (
    <aside
      className="booking-bar"
      aria-label="Your stay"
      data-visible={visible || undefined}
      // Out of the tab order and the accessibility tree while it's off screen.
      inert={!visible}
    >
      <div className="booking-bar-text">
        <span className="booking-bar-total">
          {usd(total)} <span className="booking-bar-total-label">total</span>
        </span>
        <span className="booking-bar-meta">
          {fmtRange(dates.start, dates.end)} · {summarize(guests)}
        </span>
      </div>
      <button type="button" className="booking-bar-reserve" data-requested={requested || undefined} onClick={onReserve}>
        {requested ? 'Request sent' : 'Reserve'}
      </button>
    </aside>
  )
}

function useInView(ref: RefObject<HTMLElement | null>) {
  // Start "in view" so nothing flashes before the first observation.
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return inView
}
