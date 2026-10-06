type Props = {
  kind: 'decrement' | 'increment'
  label: string
  disabled: boolean
  onPress: () => void
  /** Called when a disabled button is pressed, so we can explain why. */
  onBlocked: () => void
}

/**
 * Uses `aria-disabled` instead of `disabled` on purpose: a natively disabled
 * button drops keyboard focus the moment it becomes unavailable. Pressing
 * "+" with Enter up to the limit would throw focus to <body>. With
 * aria-disabled the focus stays put, screen readers still announce "dimmed",
 * and a press can explain the limit instead of doing nothing silently.
 */
export function CounterButton({ kind, label, disabled, onPress, onBlocked }: Props) {
  return (
    <button
      type="button"
      className="counter-btn"
      aria-label={label}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      onClick={disabled ? onBlocked : onPress}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M1.5 6h9" />
        {kind === 'increment' && <path d="M6 1.5v9" />}
      </svg>
    </button>
  )
}
