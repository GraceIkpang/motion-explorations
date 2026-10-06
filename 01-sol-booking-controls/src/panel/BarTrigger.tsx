import type { ReactNode, Ref } from 'react'
import calendarDots from '../assets/calendar-dots.svg'
import caretDown from '../assets/caret-down.svg'
import user from '../assets/user.svg'

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
      <img className="chevron" src={caretDown} width="14" height="14" alt="" />
    </button>
  )
}

export const PersonIcon = () => <img className="bar-icon" src={user} width="16" height="16" alt="" />

export const CalendarIcon = () => <img className="bar-icon" src={calendarDots} width="16" height="16" alt="" />
