import { VILLA } from '../villa'

const FACTS: [string, string][] = [
  ['Architect', VILLA.architect],
  ['Guests', String(VILLA.capacity)],
  ['Bedrooms', `${VILLA.bedrooms} · ${VILLA.beds} beds`],
  ['Baths', String(VILLA.baths)],
]

export function Details() {
  return (
    <section className="details" aria-label="About Casa Oliva">
      <div>
        <dl className="facts">
          {FACTS.map(([k, v]) => (
            <div className="fact" key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="rating">
          <span className="rating-star" aria-hidden="true">
            ⭐️
          </span>
          <span>
            <span className="sr-only">Rated </span>
            {VILLA.rating} · {VILLA.reviews} reviews
          </span>
        </p>
      </div>
      <p className="intro">
        A quiet study in concrete, light and landscape — Casa Oliva sits among the vineyards, framing the mountains
        through open-air living spaces.
      </p>
    </section>
  )
}
