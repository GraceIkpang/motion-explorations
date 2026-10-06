import { useCallback, useReducer, useRef, useState } from 'react'
import { BookingSection, type PanelKey } from './BookingSection'
import { datesReducer, initialDates } from './dates/dateState'
import { guestsReducer, initialGuests } from './guests/guestState'
import { useMediaQuery } from './hooks/useMediaQuery'
import { DEBUG } from './lab/debug'
import { LabPanel } from './lab/LabPanel'
import { LabProvider } from './lab/LabContext'
import { Amenities } from './page/Amenities'
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

  // Nav "Reserve": bring the booking panel into view, THEN open the date
  // picker, so the popover anchors to a bar that has stopped moving.
  const reserveFromNav = useCallback(() => {
    const el = bookingRef.current
    if (!el) return
    const open = () => setPanelOpen('dates', true)
    const r = el.getBoundingClientRect()
    if (r.top >= 0 && r.bottom <= window.innerHeight) return open()
    const reduce = document.documentElement.dataset.motion === 'reduce'
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    if (reduce || !('onscrollend' in window)) return void setTimeout(open, reduce ? 0 : 700)
    window.addEventListener('scrollend', open, { once: true })
  }, [setPanelOpen])

  return (
    <LabProvider>
      {DEBUG && <LabPanel guests={guests} dates={dates} openPanel={openPanel} presentation={presentation} />}
      <main className="page">
        <Hero onReserve={reserveFromNav} />
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
        />
      </main>
    </LabProvider>
  )
}
