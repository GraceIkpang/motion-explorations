import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useLab } from '../lab/LabContext'

const EASE_OUT = [0.23, 1, 0.32, 1] as const

/**
 * 2 → 3 rolls up, 3 → 2 rolls down: direction tells you which button you hit.
 * `popLayout` lets the old digit leave while the new one enters, and each
 * change is its own short-lived pair — rapid input never queues.
 */
export function AnimatedCount({ value }: { value: number }) {
  const { reduceMotion, timeScale } = useLab()
  // Derive direction from the previous value during render (render-safe, no ref mutation).
  const [last, setLast] = useState({ value, dir: 1 })
  if (last.value !== value) setLast({ value, dir: value > last.value ? 1 : -1 })
  const dir = last.value !== value ? (value > last.value ? 1 : -1) : last.dir

  const travel = reduceMotion ? 0 : 10
  const t = timeScale

  return (
    <span className="count" aria-hidden="true">
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        <motion.span
          key={value}
          className="count-digit"
          custom={dir}
          variants={{
            enter: (d: number) => ({ opacity: 0, transform: `translateY(${d * travel}px)` }),
            center: { opacity: 1, transform: 'translateY(0px)' },
            exit: (d: number) => ({ opacity: 0, transform: `translateY(${-d * travel}px)` }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: (reduceMotion ? 0.1 : 0.18) * t, ease: EASE_OUT }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
