import { useRef, type Dispatch, type Ref } from 'react'
import { DATE_PICKER_ID, DateSelector } from './dates/DateSelector'
import { nights, summarizeDates, type DateAction, type DateState } from './dates/dateState'
import { GUEST_SELECTOR_ID, GuestSelector } from './guests/GuestSelector'
import { summarize, type GuestAction, type Guests } from './guests/guestState'
import { BarTrigger, CalendarIcon, PersonIcon } from './panel/BarTrigger'
import type { Presentation } from './panel/ResponsivePanel'
import { fmtShort } from './dates/dateUtils'
import { VILLA, quote, usd } from './villa'

export type PanelKey = 'dates' | 'guests'

type Props = {
  ref?: Ref<HTMLElement>
  guests: Guests
  guestDispatch: Dispatch<GuestAction>
  dates: DateState
  dateDispatch: Dispatch<DateAction>
  openPanel: PanelKey | null
  setPanelOpen: (key: PanelKey, open: boolean) => void
  presentation: Presentation
  /** Whether "Reserve" was pressed for the current selection. Lifted so the mobile bar can show it too. */
  requested: boolean
  onRequest: () => void
}


const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen']

/** The existing Casa Oliva booking band. Only the Dates and Guests controls are new. */
export function BookingSection({
  ref,
  guests,
  guestDispatch,
  dates,
  dateDispatch,
  openPanel,
  setPanelOpen,
  presentation,
  requested,
  onRequest,
}: Props) {
  const barRef = useRef<HTMLDivElement>(null)
  const dateTriggerRef = useRef<HTMLButtonElement>(null)
  const guestTriggerRef = useRef<HTMLButtonElement>(null)

  // Prices read the committed range only — a half-picked range never reaches them.
  const n = nights(dates)
  const { subtotal, cleaning, service, total } = quote(n)

  const lines = [
    [`${usd(VILLA.nightly)} x ${n} nights`, usd(subtotal)],
    ['Cleaning', usd(cleaning)],
    ['Service fee', usd(service)],
  ]

  return (
    <section ref={ref} className="booking" id="book" aria-label="Book Casa Oliva">
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
            <dd>{usd(total)}</dd>
          </div>
        </dl>

        <div className="reserve-wrap">
          <button
            type="button"
            className="reserve"
            data-requested={requested || undefined}
            aria-disabled={requested || undefined}
            onClick={onRequest}
          >
            <span className="reserve-label" data-label="idle" aria-hidden={requested}>
              Reserve
            </span>
            <span className="reserve-label" data-label="done" aria-hidden={!requested}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.75 7.25 5.5 10l5.75-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Request sent
            </span>
          </button>
          <p className="reserve-note" data-requested={requested || undefined} aria-live="polite">
            {requested
              ? `${fmtShort(dates.start)} – ${fmtShort(dates.end)} · ${summarize(guests)} · ${usd(total)}. We'll confirm within a day.`
              : "You won't be charged yet"}
          </p>
        </div>
      </div>
    </section>
  )
}
