# 01 · Sōl: guest selector and date picker

**Live:** [sol-booking-controls.vercel.app](https://sol-booking-controls.vercel.app)

The Casa Oliva booking panel had a static "Oct 16 - Oct 20 | 2 guests" bar. This
exploration turns both halves into working controls without redesigning the panel.

- **Desktop:** each control opens an anchored popover that grows out of the button you pressed.
- **Mobile:** the same controls open a bottom sheet with swipe-to-dismiss.
- **One state:** the presentation changes at 768px; the selection doesn't. Resize in the middle of a pick and it's still there.
- **Invalid states are prevented, not reported:** at most 4 guests (infants don't count), at least 1 adult, stays of 2–14 nights, no stay across a booked night. Pressing an unavailable control explains why.
- **Keyboard:** Tab, Enter/Space and Escape throughout. Focus returns to the control on close. The calendar uses the standard ARIA date-grid keys.
- **Reduced motion:** no travel, slides or rolling numbers. Changes become short fades, so nothing is lost.

The full interaction spec — states, timings, easing, interruption — is in [SPEC.md](SPEC.md).

Add `?debug` to the URL for the motion lab controls (Subtle vs Expressive treatment,
5× slow-mo, forced reduced motion), a live state readout and a stress-test checklist.

## Stack
React, TypeScript, Vite, [Base UI](https://base-ui.com) (Popover, Drawer) for
accessible primitives, and [Motion](https://motion.dev) for the number and month
transitions. Everything else is CSS transitions.

## Run it
```bash
npm install
npm run dev
```
