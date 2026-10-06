# Sōl Motion Lab 01 — Guest selector and date picker spec

## Trigger
The "2 guests" half of the booking panel's dates/guests bar. It's one `<button>`
for both layouts (`BarTrigger`). It summarises the selection, for example
`2 guests` or `4 guests, 1 infant`.

## Rules (`guestState.ts`, the single source of truth)
| Rule | Value |
|---|---|
| Occupancy | adults + children ≤ **4** |
| Infants | don't count toward occupancy; max **2** (two cribs) |
| Minimum | **1 adult** |
| Pets | **left out.** Casa Oliva has a vineyard and an unfenced infinity pool. A row that's always disabled is noise. |

The reducer refuses invalid transitions. A button's disabled state comes from the
same `canIncrement` / `canDecrement` functions, so the UI and the state can't disagree.

## States
| State | Treatment |
|---|---|
| Closed | Default bar segment |
| Trigger hover | `rgb(255 255 255 / .05)` fill, 150ms `ease`, only on hover-capable pointers |
| Trigger focus | 2px white ring, inset |
| Opening / Open | Trigger stays lit (`.08` fill) and the chevron turns 180° |
| Counter hover / focus | Border goes from .22 to .55 / 2px ring, offset 2 |
| Counter pressed | `scale(.92)`, 100ms ease-out press, 160ms release |
| Limit reached | Button dims to .07 border / .22 icon. The note under the rows becomes **"At capacity — Casa Oliva sleeps 4."** |
| Pressing an unavailable button | Nothing changes. The note explains the reason and flashes brighter once (color only). |
| Closing | Fade only, quicker than the entrance |

Unavailable buttons use `aria-disabled`, not `disabled`. A native `disabled` button
drops keyboard focus to `<body>` at the moment you reach the limit.

## Motion
Easing tokens: `--ease-out: cubic-bezier(.23,1,.32,1)` and `--ease-drawer: cubic-bezier(.32,.72,0,1)`.

| Element | Job | Subtle | Expressive | Exit |
|---|---|---|---|---|
| Popover | Spatial: "came from Guests" | 160ms, opacity + `translateY(-4px)` | 260ms, `translateY(-8px) scale(.96)` + clip reveal from 55%, growing out of the trigger's x. Rows staggered 40ms. | 120ms fade (subtle) / 150ms fade + `scale(.98)` (expressive) |
| Sheet | Spatial: comes up from the thumb zone | 320ms `translateY(100%)→0`, drawer curve | 440ms, rows staggered | 220ms × swipe strength |
| Count 2→3 | Feedback + direction | 180ms roll: up for +, down for −, 10px, clipped | same | — |
| Chevron | State | 200ms rotate | same | — |

Nothing overshoots and nothing springs.

**Interruption:** everything is a CSS transition or a Motion tween, never keyframes,
so open→close→open picks up from the current value. Each number change is its own
short enter/exit pair (`AnimatePresence mode="popLayout"`), so mashing + doesn't
queue animations.

## Reduced motion
`prefers-reduced-motion` OR the lab's "Force on" sets `html[data-motion=reduce]`.
- Popover: no travel, scale or clip. 120ms opacity fade.
- Sheet: no slide. 160ms opacity fade. Swipe-to-dismiss still follows the finger, because that movement is user-driven.
- Numbers: no roll. 100ms crossfade.
- No press scale, no chevron rotation, no stagger.
- The open/close and limit states are still visible, so the change is never a pop.

## Responsive
At ≥768px it's a Base UI `Popover`, aligned to the whole bar (`--anchor-width`) so it
reads as part of the panel. Below that it's a Base UI `Drawer` (bottom sheet) with
40px controls and a Done button. Below 400px the bar stacks, so the summary never
truncates.

`guests`, `dates` and `openPanel` all live in `App`. Crossing the breakpoint swaps only the container.

## Keyboard
Tab to Guests → Enter/Space opens → focus moves to the first counter → Tab through
−/+ → Enter/Space changes the count → Escape closes and focus returns to Guests.
On an outside click, focus stays where you clicked.

---

# Date picker

## Architecture
Dates and Guests share one container, `ResponsivePanel` (popover ↔ sheet), and one
trigger component, `BarTrigger`. Each field brings only its own content (`DateFields`,
`GuestFields`) and its own reducer. Only one panel can be open at a time
(`openPanel: 'dates' | 'guests' | null` in `App`).

## Rules (`dateState.ts`)
| Rule | Value |
|---|---|
| Minimum stay | **2 nights** |
| Maximum stay | **14 nights** |
| Booked nights | Oct 22–24 and Nov 6–8. A stay can't include one, but you can check out on the morning a booked night starts. |
| Window | 12 months from today (prototype clock fixed to Oct 6 2026) |

State is `{ start, end, pending, view }`. `start`/`end` is always a valid, bookable
stay, and prices and the "four nights at" eyebrow read only from it. Picking a check-in
sets `pending`. Picking a valid check-out commits the stay. Closing with only a check-in
discards it, so the previous stay stays put. `pending` and `view` are part of the shared
state, so a resize in the middle of a pick keeps the half-finished selection.

## Day states
| State | Treatment |
|---|---|
| Available | White numeral; hover fills `.1` (no animation — it fires constantly) |
| Check-in / check-out | Solid white circle, dark numeral |
| In range | Continuous `.08` band, half-width at the ends |
| Choosing check-out | Hovering previews the stay as a quieter `.045` band |
| Unavailable (past, too short, too long, gap) | Numeral at `.24` |
| Booked | Same dim + strikethrough, so you can see why |
| Pressing an unavailable day | The note explains the reason ("Your stay can't include a booked night.") and flashes once |
| Today | 3px dot |

## Motion
| Element | Job | Treatment | Reduced |
|---|---|---|---|
| Popover / sheet | Spatial | Same Subtle/Expressive tokens as Guests; grows from the Dates button | Same as Guests |
| Month change | Direction | 220ms, 20px slide in the direction of travel + fade. The leaving month goes `inert`. Six rows always, so the height never jumps. | 120ms crossfade |
| Endpoint select | State | 120ms background colour | Instant |

Mashing next month never stacks grids: each month is one short enter/exit pair, and
it stops at the 12-month limit.

## Keyboard (standard ARIA date grid)
Tab reaches the dates control. Enter or Space opens it, and focus lands on the check-in
day. Arrows move by day and week; Home/End go to the start or end of the week;
PageUp/PageDown change month. Enter or Space selects a day. Escape closes and returns
focus to the dates control. Only one day is tabbable (roving tabindex), so Tab moves on
past the calendar.
