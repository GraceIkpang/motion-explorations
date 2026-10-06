import { useId } from 'react'
import { AnimatedCount } from './AnimatedCount'
import { CounterButton } from './CounterButton'

type Props = {
  label: string
  /** Singular noun for button labels: "Add adult". */
  noun: string
  hint: string
  value: number
  canDecrement: boolean
  canIncrement: boolean
  onChange: (dir: 1 | -1) => void
  onBlocked: (dir: 1 | -1) => void
  /** Stagger index for the expressive entrance. */
  index: number
}

export function GuestRow({ label, noun, hint, value, canDecrement, canIncrement, onChange, onBlocked, index }: Props) {
  const id = useId()
  return (
    <div className="guest-row stagger" role="group" aria-labelledby={id} style={{ '--i': index } as React.CSSProperties}>
      <div className="guest-row-text">
        <span className="guest-row-label" id={id}>
          {label}
        </span>
        <span className="guest-row-hint">{hint}</span>
      </div>
      <div className="counter">
        <CounterButton
          kind="decrement"
          label={`Remove ${noun}`}
          disabled={!canDecrement}
          onPress={() => onChange(-1)}
          onBlocked={() => onBlocked(-1)}
        />
        <AnimatedCount value={value} />
        <CounterButton
          kind="increment"
          label={`Add ${noun}`}
          disabled={!canIncrement}
          onPress={() => onChange(1)}
          onBlocked={() => onBlocked(1)}
        />
      </div>
    </div>
  )
}
