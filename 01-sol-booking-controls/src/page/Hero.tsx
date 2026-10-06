import type { Ref } from 'react'
import hero from '../assets/hero.jpg'
import logomark from '../assets/sol-logomark.svg'
import { VILLA } from '../villa'

type Props = {
  ref?: Ref<HTMLElement>
  /** Scrolls to the booking panel and opens the date picker. */
  onReserve: () => void
}

export function Hero({ ref, onReserve }: Props) {
  return (
    <header ref={ref} className="hero">
      <img
        className="hero-img"
        src={hero}
        alt="Casa Oliva at dusk: a stone pavilion with lit bedroom glass above an infinity pool"
        fetchPriority="high"
      />

      <nav className="nav" aria-label="Main">
        <a className="nav-logo" href="/" aria-label="Sōl home">
          <img src={logomark} width="24" height="22" alt="" />
          <span>sol</span>
        </a>
        <ul className="nav-links">
          {/* Not part of this prototype — shown, but not links. */}
          <li>
            <span>Stays</span>
          </li>
          <li>
            <span>Journal</span>
          </li>
          <li>
            <button type="button" className="nav-reserve" onClick={onReserve}>
              Reserve
            </button>
          </li>
        </ul>
      </nav>

      <p className="caption">{VILLA.location}</p>
    </header>
  )
}
