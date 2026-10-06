import { useEffect, useId, useRef, useState } from 'react'
import { useLab } from '../lab/LabContext'
import { AMENITIES } from '../villa'

/**
 * A native horizontal scroll with no arrows. What tells you there's more:
 * the fifth card is cut off, and the edge with more content softly fades.
 * Trackpads and touch scroll it natively, arrow keys work once it's focused,
 * and a mouse can drag it. "Show all 8" lays everything out as a grid.
 */
export function Amenities() {
  const [expanded, setExpanded] = useState(false)
  const stripId = useId()
  const stripRef = useEdgeFades(expanded)
  useDragScroll(stripRef, !expanded)

  return (
    <section className="amenities" aria-labelledby={`${stripId}-title`}>
      <div className="amenities-head">
        <h2 className="amenities-title" id={`${stripId}-title`}>
          What the villa offers
        </h2>
        <button
          type="button"
          className="amenities-toggle"
          aria-expanded={expanded}
          aria-controls={stripId}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? 'Show less' : `Show all ${AMENITIES.length}`}
        </button>
      </div>
      <ul
        ref={stripRef}
        id={stripId}
        className="amenity-strip"
        data-expanded={expanded || undefined}
        // Focusable only while it scrolls, so keyboard users can use arrow keys.
        tabIndex={expanded ? undefined : 0}
        aria-label={expanded ? undefined : 'Amenities, scrolls sideways'}
      >
        {AMENITIES.map((a) => (
          <li className="amenity" key={a.name}>
            <span className="amenity-kicker">{a.kicker}</span>
            <span className="amenity-name">{a.name}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Sets data-more-start / data-more-end so CSS can fade the edge that has more. */
function useEdgeFades(expanded: boolean) {
  const ref = useRef<HTMLUListElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      el.toggleAttribute('data-more-start', !expanded && el.scrollLeft > 2)
      el.toggleAttribute('data-more-end', !expanded && el.scrollLeft < max - 2)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [expanded])
  return ref
}

/**
 * Mouse drag-to-scroll with a short glide on release. Touch and trackpads
 * are left to the browser — they already scroll natively and better.
 */
function useDragScroll(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const { reduceMotion } = useLab()
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    let startX = 0
    let startScroll = 0
    let lastX = 0
    let lastT = 0
    let velocity = 0
    let moved = false
    let glide = 0

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      cancelAnimationFrame(glide)
      startX = lastX = e.clientX
      startScroll = el.scrollLeft
      lastT = performance.now()
      velocity = 0
      moved = false
      el.setPointerCapture(e.pointerId)
      el.dataset.dragging = ''
    }
    const onMove = (e: PointerEvent) => {
      if (!el.hasPointerCapture(e.pointerId)) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 3) moved = true
      el.scrollLeft = startScroll - dx
      const now = performance.now()
      velocity = (lastX - e.clientX) / Math.max(1, now - lastT) // px per ms
      lastX = e.clientX
      lastT = now
    }
    const onUp = (e: PointerEvent) => {
      if (!el.hasPointerCapture(e.pointerId)) return
      el.releasePointerCapture(e.pointerId)
      delete el.dataset.dragging
      if (reduceMotion) return
      // Glide: carry the release velocity, decaying each frame.
      let v = velocity * 16
      const step = () => {
        if (Math.abs(v) < 0.4) return
        el.scrollLeft += v
        v *= 0.92
        glide = requestAnimationFrame(step)
      }
      glide = requestAnimationFrame(step)
    }
    // A drag shouldn't also count as a click on whatever is under the pointer.
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault()
        e.stopPropagation()
        moved = false
      }
    }
    // Any new input (wheel, touch) cancels a glide in progress.
    const stop = () => cancelAnimationFrame(glide)

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('click', onClick, true)
    el.addEventListener('wheel', stop, { passive: true })
    el.addEventListener('touchstart', stop, { passive: true })
    return () => {
      cancelAnimationFrame(glide)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('click', onClick, true)
      el.removeEventListener('wheel', stop)
      el.removeEventListener('touchstart', stop)
    }
  }, [ref, enabled, reduceMotion])
}
