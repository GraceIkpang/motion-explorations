import { useCallback, useReducer, useRef, useState } from 'react'
import { BookingSection, type PanelKey } from './BookingSection'
import { datesReducer, initialDates } from './dates/dateState'
import { guestsReducer, initialGuests, summarize } from './guests/guestState'
import { useMediaQuery } from './hooks/useMediaQuery'
import { DEBUG } from './lab/debug'
import { LabPanel } from './lab/LabPanel'
import { LabProvider } from './lab/LabContext'
import { Amenities } from './page/Amenities'
import { BookingBar } from './page/BookingBar'
import { Details } from './page/Details'
import { Gallery } from './page/Gallery'
import { Hero } from './page/Hero'

export default function App() {
  // One source of truth per field. Popover and sheet both read/write these.
  const [guests, guestDispatch] = useReducer(guestsReducer, initialGuests)
  const [dates, dateDispatch] = useReducer(datesReducer, initialDates)
  // Which panel is open is lifted too, so a resize mid-interaction swaps the
  // container without closing it — and only one panel can ever be open.
  const [openPanel, setOpenPanel] = useState<PanelKey | null>(null)
  const wide = useMediaQuery('(min-width: 768px)')
  const presentation = wide ? 'popover' : 'sheet'
  const bookingRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLElement>(null)

  // "Reserve" → a quiet confirmation, tied to the exact selection it was made
  // for. Change the dates or guests and it goes back to "Reserve".
  const selectionKey = `${dates.start}|${dates.end}|${summarize(guests)}`
  const [requestedKey, setRequestedKey] = useState<string | null>(null)
  const requested = requestedKey === selectionKey

  const setPanelOpen = useCallback((key: PanelKey, open: boolean) => {
    if (open) {
      // Reopening always starts on the month of the current stay.
      if (key === 'dates') dateDispatch({ type: 'showStayMonth' })
      return setOpenPanel(key)
    }
    // Functional update: closing Guests must not close Dates if Dates just opened.
    setOpenPanel((cur) => (cur === key ? null : cur))
    // A check-in without a check-out is never committed — closing discards it.
    if (key === 'dates') dateDispatch({ type: 'cancelPending' })
  }, [])

  // Bring the booking band into view, THEN act — so a popover anchors to a
  // bar that has stopped moving, and focus doesn't fight the scroll.
  const toBooking = useCallback((then: () => void) => {
    const el = bookingRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    if (r.top >= 0 && r.bottom <= window.innerHeight) return then()
    const reduce = document.documentElement.dataset.motion === 'reduce'
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    if (reduce || !('onscrollend' in window)) return void setTimeout(then, reduce ? 0 : 700)
    window.addEventListener('scrollend', then, { once: true })
  }, [])

  // Nav "Reserve": the user hasn't chosen anything yet, so open the dates.
  const reserveFromNav = useCallback(() => toBooking(() => setPanelOpen('dates', true)), [toBooking, setPanelOpen])

  // Bar "Reserve": dates and total are already chosen, so land on the panel's
  // own Reserve button with the full breakdown above it.
  const reserveFromBar = useCallback(
    () => toBooking(() => bookingRef.current?.querySelector<HTMLElement>('.reserve')?.focus({ preventScroll: true })),
    [toBooking],
  )

  return (
    <LabProvider>
      {DEBUG && <LabPanel guests={guests} dates={dates} openPanel={openPanel} presentation={presentation} />}
      <main className="page">
        <Hero ref={heroRef} onReserve={reserveFromNav} />
        <Details />
        <Gallery />
        <Amenities />
        <BookingSection
          ref={bookingRef}
          guests={guests}
          guestDispatch={guestDispatch}
          dates={dates}
          dateDispatch={dateDispatch}
          openPanel={openPanel}
          setPanelOpen={setPanelOpen}
          presentation={presentation}
          requested={requested}
          onRequest={() => setRequestedKey(selectionKey)}
        />
      </main>
      {presentation === 'sheet' && (
        <BookingBar
          heroRef={heroRef}
          bookingRef={bookingRef}
          dates={dates}
          guests={guests}
          requested={requested}
          suppressed={openPanel !== null}
          onReserve={reserveFromBar}
        />
      )}
    </LabProvider>
  )
}
