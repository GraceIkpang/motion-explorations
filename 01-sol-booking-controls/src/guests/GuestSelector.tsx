import type { Dispatch, RefObject } from 'react'
import { ResponsivePanel, type Presentation } from '../panel/ResponsivePanel'
import { GuestFields } from './GuestFields'
import { summarize, type GuestAction, type Guests } from './guestState'

export const GUEST_SELECTOR_ID = 'guest-selector'

type Props = {
  presentation: Presentation
  open: boolean
  onOpenChange: (open: boolean) => void
  guests: Guests
  dispatch: Dispatch<GuestAction>
  anchorRef: RefObject<HTMLElement | null>
  triggerRef: RefObject<HTMLButtonElement | null>
}

export function GuestSelector({ guests, dispatch, ...panel }: Props) {
  return (
    <ResponsivePanel id={GUEST_SELECTOR_ID} title="Guests" summary={summarize(guests)} {...panel}>
      <GuestFields guests={guests} dispatch={dispatch} />
    </ResponsivePanel>
  )
}
