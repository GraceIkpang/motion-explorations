import { useCallback, useReducer, useState } from 'react'
import { BookingSection, type PanelKey } from './BookingSection'
import { datesReducer, initialDates } from './dates/dateState'
import { guestsReducer, initialGuests } from './guests/guestState'
import { useMediaQuery } from './hooks/useMediaQuery'
import { LabPanel } from './lab/LabPanel'
import { LabProvider } from './lab/LabContext'

export default function App() {
  // One source of truth per field. Popover and sheet both read/write these.
  const [guests, guestDispatch] = useReducer(guestsReducer, initialGuests)
  const [dates, dateDispatch] = useReducer(datesReducer, initialDates)
  // Which panel is open is lifted too, so a resize mid-interaction swaps the
  // container without closing it — and only one panel can ever be open.
  const [openPanel, setOpenPanel] = useState<PanelKey | null>(null)
  const wide = useMediaQuery('(min-width: 768px)')
  const presentation = wide ? 'popover' : 'sheet'

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

  return (
    <LabProvider>
      <main className="page">
        <div className="frame">
          <LabPanel guests={guests} dates={dates} openPanel={openPanel} presentation={presentation} />
          <BookingSection
            guests={guests}
            guestDispatch={guestDispatch}
            dates={dates}
            dateDispatch={dateDispatch}
            openPanel={openPanel}
            setPanelOpen={setPanelOpen}
            presentation={presentation}
          />
        </div>
      </main>
    </LabProvider>
  )
}
