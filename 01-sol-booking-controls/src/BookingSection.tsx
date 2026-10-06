import { useRef, type Dispatch } from 'react'
import { DATE_PICKER_ID, DateSelector } from './dates/DateSelector'
import { nights, summarizeDates, type DateAction, type DateState } from './dates/dateState'
import { GUEST_SELECTOR_ID, GuestSelector } from './guests/GuestSelector'
import { summarize, type GuestAction, type Guests } from './guests/guestState'
import { BarTrigger, CalendarIcon, PersonIcon } from './panel/BarTrigger'
import type { Presentation } from './panel/ResponsivePanel'

export type PanelKey = 'dates' | 'guests'

type Props = {
  guests: Guests
  guestDispatch: Dispatch<GuestAction>
  dates: DateState
  dateDispatch: Dispatch<DateAction>
  openPanel: PanelKey | null
  setPanelOpen: (key: PanelKey, open: boolean) => void
  presentation: Presentation
}

const NIGHTLY = 680
const CLEANING = 180
const SERVICE_PER_NIGHT = 60

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen']
const usd = (n: number) => `$${n.toLocaleString('en-US')}`

/** The existing Casa Oliva booking band. Only the Dates and Guests controls are new. */
export function BookingSection({
  guests,
  guestDispatch,
  dates,
  dateDispatch,
  openPanel,
  setPanelOpen,
  presentation,
}: Props) {
  const barRef = useRef<HTMLDivElement>(null)
  const dateTriggerRef = useRef<HTMLButtonElement>(null)
  const guestTriggerRef = useRef<HTMLButtonElement>(null)

  // Prices read the committed range only — a half-picked range never reaches them.
  const n = nights(dates)
  const subtotal = NIGHTLY * n
  const service = SERVICE_PER_NIGHT * n
  const lines = [
    [`${usd(NIGHTLY)} x ${n} nights`, usd(subtotal)],
    ['Cleaning', usd(CLEANING)],
    ['Service fee', usd(service)],
  ]

  return (
    <section className="booking" aria-label="Book Casa Oliva">
      <div className="booking-title">
        <p className="booking-eyebrow">{WORDS[n] ?? n} nights at</p>
        <p className="booking-name" aria-hidden="true">
          Casa
          <br />
          Oliva
        </p>
      </div>

      <div className="booking-card">
        <div className="bar" ref={barRef}>
          <BarTrigger
            ref={dateTriggerRef}
            icon={<CalendarIcon />}
            label={summarizeDates(dates)}
            srPrefix="Dates:"
            open={openPanel === 'dates'}
            onToggle={() => setPanelOpen('dates', openPanel !== 'dates')}
            controlsId={DATE_PICKER_ID}
          />
          <span className="bar-divider" aria-hidden="true" />
          <BarTrigger
            ref={guestTriggerRef}
            icon={<PersonIcon />}
            label={summarize(guests)}
            srPrefix="Guests:"
            open={openPanel === 'guests'}
            onToggle={() => setPanelOpen('guests', openPanel !== 'guests')}
            controlsId={GUEST_SELECTOR_ID}
          />
        </div>

        <DateSelector
          presentation={presentation}
          open={openPanel === 'dates'}
          onOpenChange={(o) => setPanelOpen('dates', o)}
          dates={dates}
          dispatch={dateDispatch}
          anchorRef={barRef}
          triggerRef={dateTriggerRef}
        />
        <GuestSelector
          presentation={presentation}
          open={openPanel === 'guests'}
          onOpenChange={(o) => setPanelOpen('guests', o)}
          guests={guests}
          dispatch={guestDispatch}
          anchorRef={barRef}
          triggerRef={guestTriggerRef}
        />

        <dl className="price">
          {lines.map(([k, v]) => (
            <div className="price-line" key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <div className="price-total">
            <dt>Total</dt>
            <dd>{usd(subtotal + CLEANING + service)}</dd>
          </div>
        </dl>

        <button type="button" className="reserve">
          Reserve
        </button>
        <p className="reserve-note">You won't be charged yet</p>
      </div>
    </section>
  )
}
