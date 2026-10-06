import { Drawer } from '@base-ui/react/drawer'
import { Popover } from '@base-ui/react/popover'
import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'

export type Presentation = 'popover' | 'sheet'

type ChangeDetails = { reason: string; event: Event }

type Props = {
  id: string
  title: string
  /** Shown under the sheet title — e.g. "4 guests, 1 infant". */
  summary: string
  presentation: Presentation
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The whole dates/guests bar — the popover aligns to it so it reads as part of the panel. */
  anchorRef: RefObject<HTMLElement | null>
  /** The button that opened it — focus returns here, and the popover grows out of it. */
  triggerRef: RefObject<HTMLButtonElement | null>
  /** Where focus lands on open. Defaults to the first tabbable element. */
  initialFocusSelector?: string
  children: ReactNode
}

/**
 * The container, and only the container. Guests and Dates both render inside
 * this; it knows nothing about either. Above 768px it's an anchored popover,
 * below it's a bottom sheet — the content and its state don't change.
 */
export function ResponsivePanel({
  id,
  title,
  summary,
  presentation,
  open,
  onOpenChange,
  anchorRef,
  triggerRef,
  initialFocusSelector,
  children,
}: Props) {
  const closeReason = useRef('')
  const popupRef = useRef<HTMLDivElement>(null)

  const handleOpenChange = (next: boolean, details: ChangeDetails) => {
    // The trigger lives outside the popup, so pressing it counts as an
    // "outside press". Ignore it here and let the trigger's own click toggle,
    // otherwise it would close then immediately reopen.
    if (!next && details.reason === 'outside-press' && triggerRef.current?.contains(details.event.target as Node)) {
      return
    }
    closeReason.current = details.reason
    onOpenChange(next)
  }

  // Escape / Done / swipe → back to the trigger. Clicking elsewhere → leave
  // focus where the user clicked; yanking it back would be hostile.
  const finalFocus = () => (closeReason.current === 'outside-press' ? false : triggerRef.current)

  const initialFocus = initialFocusSelector
    ? () => popupRef.current?.querySelector<HTMLElement>(initialFocusSelector) ?? true
    : undefined

  if (presentation === 'popover') {
    return (
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Portal>
          <Popover.Positioner
            anchor={anchorRef}
            side="bottom"
            align="end"
            sideOffset={8}
            collisionPadding={16}
            className="panel-positioner"
          >
            <OriginPopup
              id={id}
              popupRef={popupRef}
              triggerRef={triggerRef}
              anchorRef={anchorRef}
              initialFocus={initialFocus}
              finalFocus={finalFocus}
            >
              <Popover.Title className="sr-only">{title}</Popover.Title>
              {children}
            </OriginPopup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    )
  }

  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        <Drawer.Backdrop className="sheet-backdrop" />
        <Drawer.Viewport className="sheet-viewport">
          <Drawer.Popup
            id={id}
            ref={popupRef}
            className="sheet"
            initialFocus={initialFocus}
            finalFocus={finalFocus}
          >
            <div className="sheet-handle" aria-hidden="true" />
            <Drawer.Content className="sheet-content">
              <header className="sheet-header">
                <Drawer.Title className="sheet-title">{title}</Drawer.Title>
                <Drawer.Description className="sheet-summary">{summary}</Drawer.Description>
              </header>
              {children}
              <Drawer.Close className="sheet-done">Done</Drawer.Close>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

/**
 * The popover is as wide as the bar, but it should visibly grow out of the
 * button that opened it — not the bar's centre. Measure the trigger's centre
 * relative to the bar and use it as the transform-origin.
 */
function OriginPopup({
  id,
  popupRef,
  triggerRef,
  anchorRef,
  initialFocus,
  finalFocus,
  children,
}: {
  id: string
  popupRef: RefObject<HTMLDivElement | null>
  triggerRef: RefObject<HTMLElement | null>
  anchorRef: RefObject<HTMLElement | null>
  initialFocus?: () => HTMLElement | true
  finalFocus: () => HTMLElement | null | false
  children: ReactNode
}) {
  const [originX, setOriginX] = useState('50%')
  useLayoutEffect(() => {
    const t = triggerRef.current?.getBoundingClientRect()
    const a = anchorRef.current?.getBoundingClientRect()
    if (t && a) setOriginX(`${t.left + t.width / 2 - a.left}px`)
  }, [triggerRef, anchorRef])

  return (
    <Popover.Popup
      id={id}
      ref={popupRef}
      className="panel-popover"
      initialFocus={initialFocus}
      finalFocus={finalFocus}
      style={{ '--origin-x': originX } as React.CSSProperties}
    >
      {children}
    </Popover.Popup>
  )
}
