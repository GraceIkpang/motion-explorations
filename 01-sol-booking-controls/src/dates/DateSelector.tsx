import type { Dispatch, RefObject } from 'react'
import { ResponsivePanel, type Presentation } from '../panel/ResponsivePanel'
import { DateFields } from './DateFields'
import { nights, type DateAction, type DateState } from './dateState'
import { fmtShort } from './dateUtils'

export const DATE_PICKER_ID = 'date-picker'

type Props = {
  presentation: Presentation
  open: boolean
  onOpenChange: (open: boolean) => void
  dates: DateState
  dispatch: Dispatch<DateAction>
  anchorRef: RefObject<HTMLElement | null>
  triggerRef: RefObject<HTMLButtonElement | null>
}

export function DateSelector({ dates, dispatch, ...panel }: Props) {
  const summary = dates.pending
    ? `Check-in ${fmtShort(dates.pending)} · pick check-out`
    : `${fmtShort(dates.start)} – ${fmtShort(dates.end)} · ${nights(dates)} nights`
  return (
    <ResponsivePanel
      id={DATE_PICKER_ID}
      title="Dates"
      summary={summary}
      // Land on the selected day, not the "previous month" button.
      initialFocusSelector='[data-date][tabindex="0"]'
      {...panel}
    >
      <DateFields dates={dates} dispatch={dispatch} />
    </ResponsivePanel>
  )
}
