import type { PanelKey } from '../BookingSection'
import type { DateState } from '../dates/dateState'
import type { Guests } from '../guests/guestState'
import type { Presentation } from '../panel/ResponsivePanel'
import { DEBUG } from './debug'
import { useLab, type ReducePref, type Treatment } from './LabContext'

type Props = { guests: Guests; dates: DateState; openPanel: PanelKey | null; presentation: Presentation }


const STRESS = [
  '1 adult → mash minus',
  '4 guests → mash plus',
  'Rapid + − + − + −',
  'Open → close → open rapidly',
  'Dates: try to span Oct 22–24 (booked)',
  'Dates: pick check-in, resize, pick check-out',
  'Dates: pick check-in only, close → range reverts',
  'Dates: arrows, PageDown across months, mash next',
  'Open Dates → click Guests (only one open)',
  'Open → Escape (focus back on Guests)',
  'Open → click outside',
  'Keyboard only: Tab, Enter/Space, Esc',
  'Resize desktop → mobile while open',
  'Change count on mobile → resize to desktop',
  '320px wide — no horizontal scroll',
  'Reduced motion on',
]

export function LabPanel({ guests, dates, openPanel, presentation }: Props) {
  const lab = useLab()
  return (
    <section className="lab" aria-label="Motion lab controls">
      <div className="lab-head">
        <p className="kicker">Motion Lab — Sōl · 01</p>
        <h1 className="lab-title">Guest selector and date picker</h1>
      </div>

      {DEBUG && (
        <div className="lab-controls">
          <Segmented<Treatment>
            label="Treatment"
            value={lab.treatment}
            onChange={lab.setTreatment}
            options={[
              ['subtle', 'Subtle'],
              ['expressive', 'Expressive'],
            ]}
          />
          <Segmented<'1' | '5'>
            label="Speed"
            value={String(lab.timeScale) as '1' | '5'}
            onChange={(v) => lab.setTimeScale(Number(v) as 1 | 5)}
            options={[
              ['1', '1×'],
              ['5', '5× slow'],
            ]}
          />
          <Segmented<ReducePref>
            label="Reduced motion"
            value={lab.reducePref}
            onChange={lab.setReducePref}
            options={[
              ['system', lab.reduceMotion && lab.reducePref === 'system' ? 'System (on)' : 'System'],
              ['on', 'Force on'],
            ]}
          />
        </div>
      )}

      {DEBUG && (
        <div className="lab-state" aria-label="Live state">
          <code>
            <span>adults: {guests.adults}</span>
            <span>children: {guests.children}</span>
            <span>infants: {guests.infants}</span>
          </code>
          <code>
            <span>start: {dates.start}</span>
            <span>end: {dates.end}</span>
            <span>pending: {dates.pending ?? 'null'}</span>
            <span>view: {dates.view}</span>
          </code>
          <code>
            <span>open: {openPanel ?? 'null'}</span>
            <span>presentation: {presentation}</span>
          </code>
        </div>
      )}

      {DEBUG && (
        <details className="lab-stress">
          <summary>Stress test checklist</summary>
          <ul>
            {STRESS.map((s) => (
              <li key={s}>
                <label>
                  <input type="checkbox" /> {s}
                </label>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}

function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: [T, string][]
}) {
  return (
    <fieldset className="segmented">
      <legend>{label}</legend>
      <div className="segmented-track">
        {options.map(([v, text]) => (
          <label key={v} data-checked={v === value || undefined}>
            <input type="radio" name={label} value={v} checked={v === value} onChange={() => onChange(v)} />
            {text}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
