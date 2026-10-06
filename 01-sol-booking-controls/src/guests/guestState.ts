/**
 * The single source of truth for guest counts.
 *
 * Every rule lives here as a pure function. The popover, the sheet, the
 * trigger summary and the counter buttons all read from these — none of
 * them re-implement a limit. The reducer refuses invalid transitions, so
 * rapid input (or a stale click) can never push the state out of bounds.
 */
import { VILLA } from '../villa'

export type GuestKey = 'adults' | 'children' | 'infants'
export type Guests = Record<GuestKey, number>

/** Adults + children. Infants don't count toward occupancy. */
export const CAPACITY = VILLA.capacity
/** One infant per crib. */
export const MAX_INFANTS = VILLA.maxInfants

const MIN: Guests = { adults: 1, children: 0, infants: 0 }

export const initialGuests: Guests = { adults: 2, children: 0, infants: 0 }

export const occupancy = (g: Guests) => g.adults + g.children

export function canIncrement(g: Guests, key: GuestKey) {
  if (key === 'infants') return g.infants < MAX_INFANTS
  return occupancy(g) < CAPACITY
}

export function canDecrement(g: Guests, key: GuestKey) {
  return g[key] > MIN[key]
}

/** Why a blocked press was blocked — used for the explanatory note. */
export type BlockReason = 'capacity' | 'infants' | 'adult-min' | 'min'

export function blockReason(key: GuestKey, dir: 1 | -1): BlockReason {
  if (dir === -1) return key === 'adults' ? 'adult-min' : 'min'
  return key === 'infants' ? 'infants' : 'capacity'
}

export type GuestAction = { type: 'increment' | 'decrement'; key: GuestKey }

export function guestsReducer(state: Guests, action: GuestAction): Guests {
  const { key } = action
  if (action.type === 'increment') {
    return canIncrement(state, key) ? { ...state, [key]: state[key] + 1 } : state
  }
  return canDecrement(state, key) ? { ...state, [key]: state[key] - 1 } : state
}

/** "2 guests" · "4 guests, 1 infant" — compact enough for the booking bar. */
export function summarize(g: Guests) {
  const n = occupancy(g)
  let s = `${n} guest${n === 1 ? '' : 's'}`
  if (g.infants > 0) s += `, ${g.infants} infant${g.infants === 1 ? '' : 's'}`
  return s
}
