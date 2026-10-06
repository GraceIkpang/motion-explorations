# 01 · Sōl: Casa Oliva, with a working guest selector and date picker

**Live:** [sol-booking-controls.vercel.app](https://sol-booking-controls.vercel.app)

The full Casa Oliva page, built from the Figma design, with the static
"Oct 16 - Oct 20 | 2 guests" bar turned into working controls. The rest of the page
is as designed. On top of that:

- **Nav "Reserve"** scrolls to the booking panel, then opens the date picker.
- **"Reserve"** in the panel gives a quiet confirmation of the dates, guests and total. Change either and it goes back to "Reserve".
- **Amenities** scroll sideways with no arrows: the cut-off fifth card and a fade on the edge with more content are the hint. "Show all 8" lays them out as a grid.
- **On phones, a booking bar** ("$3,140 total · Oct 16 – 20 · 2 guests · Reserve") slides up once the hero has scrolled away and leaves when the real booking panel comes into view or a sheet opens. Its Reserve scrolls to the panel. It only appears or disappears — it never moves with the scroll.
- **The details table** ("Guests 4", bedrooms, baths) and the guest selector's limit read from the same file, [villa.ts](src/villa.ts), so they can't disagree.

The booking controls:

- **Desktop:** each control opens an anchored popover that grows out of the button you pressed.
- **Mobile:** the same controls open a bottom sheet with swipe-to-dismiss.
- **One state:** the presentation changes at 768px; the selection doesn't. Resize in the middle of a pick and it's still there.
- **Invalid states are prevented, not reported:** at most 4 guests (infants don't count), at least 1 adult, stays of 2–14 nights, no stay across a booked night. Pressing an unavailable control explains why.
- **Keyboard:** Tab, Enter/Space and Escape throughout. Focus returns to the control on close. The calendar uses the standard ARIA date-grid keys.
- **Reduced motion:** no travel, slides or rolling numbers. Changes become short fades, so nothing is lost.

The full interaction spec — states, timings, easing, interruption — is in [SPEC.md](SPEC.md).

Add `?debug` to the URL for the motion lab controls (Subtle vs Expressive treatment,
5× slow-mo, forced reduced motion), a live state readout and a stress-test checklist.

Design source: Figma (Playground › DAY 4 - SOL). Original exports are in
[design/casa-oliva/](design/casa-oliva); the app ships compressed copies from `src/assets/`.

## Stack
React, TypeScript, Vite, [Base UI](https://base-ui.com) (Popover, Drawer) for
accessible primitives, and [Motion](https://motion.dev) for the number and month
transitions. Everything else is CSS transitions.

## Run it
```bash
npm install
npm run dev
```
