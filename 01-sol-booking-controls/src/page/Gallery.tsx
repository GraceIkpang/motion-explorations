import livingRoom from '../assets/living-room.jpg'
import pool from '../assets/pool.jpg'

export function Gallery() {
  return (
    <section className="gallery" aria-label="Photos">
      <figure className="gallery-item">
        <img src={pool} alt="Infinity pool on the terrace, looking out over the sea" loading="lazy" />
        <figcaption className="caption">Infinity pool, facing west</figcaption>
      </figure>
      <figure className="gallery-item">
        <img src={livingRoom} alt="Open living room with a long linen sofa and floor-to-ceiling glass" loading="lazy" />
        <figcaption className="caption">Living room, poured concrete</figcaption>
      </figure>
    </section>
  )
}
