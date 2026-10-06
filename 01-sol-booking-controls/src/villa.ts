/**
 * Facts about Casa Oliva. The details table, the guest rules and the
 * price breakdown all read from here, so "Guests 4" on the page and the
 * guest selector's limit can never disagree.
 */
export const VILLA = {
  name: 'Casa Oliva',
  location: 'Valle de Guadalupe, Mexico',
  architect: 'EStudio Norte',
  /** Adults + children. Infants don't count. */
  capacity: 4,
  /** Cribs available. */
  maxInfants: 2,
  bedrooms: 2,
  beds: 2,
  baths: 2.5,
  rating: 4.96,
  reviews: 128,
  nightly: 680,
  cleaning: 180,
  servicePerNight: 60,
} as const

export const AMENITIES = [
  { kicker: 'Land', name: 'Private vineyard' },
  { kicker: 'Evening', name: 'Fireplace' },
  { kicker: 'Outlook', name: 'Mountain views' },
  { kicker: 'Connectivity', name: 'Wi-Fi' },
  { kicker: 'Water', name: 'Heated infinity pool' },
  { kicker: 'Cellar', name: 'Estate wine cellar' },
  { kicker: 'Morning', name: 'Outdoor shower' },
  { kicker: 'Care', name: 'Daily housekeeping' },
] as const

/** The price breakdown for a stay. The booking panel and the mobile booking bar both use it. */
export function quote(nights: number) {
  const subtotal = VILLA.nightly * nights
  const service = VILLA.servicePerNight * nights
  return { subtotal, cleaning: VILLA.cleaning, service, total: subtotal + VILLA.cleaning + service }
}

export const usd = (n: number) => `$${n.toLocaleString('en-US')}`
