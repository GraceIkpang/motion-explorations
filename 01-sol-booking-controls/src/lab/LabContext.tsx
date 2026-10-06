import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'

export type Treatment = 'subtle' | 'expressive'
export type ReducePref = 'system' | 'on'

type Lab = {
  treatment: Treatment
  setTreatment: (t: Treatment) => void
  /** 1 = real time, 5 = slow-mo for inspecting curves. */
  timeScale: 1 | 5
  setTimeScale: (t: 1 | 5) => void
  reducePref: ReducePref
  setReducePref: (r: ReducePref) => void
  /** System preference OR the lab override. Everything motion-related reads this. */
  reduceMotion: boolean
}

const LabContext = createContext<Lab | null>(null)

export function LabProvider({ children }: { children: ReactNode }) {
  const [treatment, setTreatment] = useState<Treatment>('subtle')
  const [timeScale, setTimeScale] = useState<1 | 5>(1)
  const [reducePref, setReducePref] = useState<ReducePref>('system')
  const systemReduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const reduceMotion = systemReduce || reducePref === 'on'

  // CSS reads these attributes, so CSS and JS (Motion) share one decision.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.treatment = treatment
    root.dataset.motion = reduceMotion ? 'reduce' : 'full'
    root.style.setProperty('--t', String(timeScale))
  }, [treatment, reduceMotion, timeScale])

  const value = useMemo(
    () => ({ treatment, setTreatment, timeScale, setTimeScale, reducePref, setReducePref, reduceMotion }),
    [treatment, timeScale, reducePref, reduceMotion],
  )
  return <LabContext.Provider value={value}>{children}</LabContext.Provider>
}

export function useLab() {
  const ctx = useContext(LabContext)
  if (!ctx) throw new Error('useLab must be used inside <LabProvider>')
  return ctx
}
