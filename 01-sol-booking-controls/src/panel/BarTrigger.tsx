import type { ReactNode, Ref } from 'react'

type Props = {
  ref?: Ref<HTMLButtonElement>
  icon: ReactNode
  /** Visible text, e.g. "Oct 16 - Oct 20" or "2 guests". */
  label: string
  /** Prefix for screen readers, e.g. "Dates:" — the icon carries it visually. */
  srPrefix: string
  open: boolean
  onToggle: () => void
  controlsId: string
}

/**
 * One trigger per field, shared by both presentations. It isn't a Base UI
 * Trigger part on purpose: when the viewport crosses the breakpoint the
 * popover swaps for a sheet, and this button — and focus on it — must not
 * remount.
 */
export function BarTrigger({ ref, icon, label, srPrefix, open, onToggle, controlsId }: Props) {
  return (
    <button
      ref={ref}
      type="button"
      className="bar-segment bar-trigger"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? controlsId : undefined}
      data-open={open || undefined}
      onClick={onToggle}
    >
      {icon}
      <span className="bar-trigger-label">
        <span className="sr-only">{srPrefix} </span>
        {label}
      </span>
      <svg className="chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M2.5 3.75 5 6.25l2.5-2.5" />
      </svg>
    </button>
  )
}

export const PersonIcon = () => (
  <svg className="bar-icon" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <circle cx="6" cy="3.75" r="2.25" />
    <path d="M1.75 10.75c.5-2.1 2.2-3.25 4.25-3.25s3.75 1.15 4.25 3.25" />
  </svg>
)

export const CalendarIcon = () => (
  <svg className="bar-icon" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <rect x="1.5" y="2.25" width="9" height="8.25" rx="1.25" />
    <path d="M1.5 4.75h9M4 1v2.25M8 1v2.25" />
  </svg>
)
