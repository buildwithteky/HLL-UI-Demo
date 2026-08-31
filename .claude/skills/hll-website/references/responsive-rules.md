---
name: responsive-rules
description: Figma's desktop/mobile artboard split vs. the React components' actual (lack of) responsive breakpoint implementation.
metadata:
  type: reference
---

# Responsive Behavior

## Figma side

Figma models responsiveness as **separate fixed-width artboards**, not
fluid breakpoints: desktop frames are **1512px** wide, mobile frames are
**402px** wide. Most desktop pages have a named mobile counterpart (see
[[pages-and-features]]). No tablet-width (e.g. ~768–1024px) frames were
found — `Not specified in the provided project sources` whether an
intermediate breakpoint is intended.

## React side

None of the component CSS files implement a desktop/mobile breakpoint
switch. A repo-wide search for `@media` found exactly two matches, both
`@media (prefers-reduced-motion: reduce)` guards in the two heading-reveal
components (accessibility motion preference, not a layout breakpoint).

**This means:** every component in `src/components/*` currently renders at
one fixed visual treatment regardless of viewport width — there is no
existing 402px/1512px switch, fluid scaling, or container-query logic to
reuse. `HLLButton`/`HLLOutlineButton` do have a `size` prop (`sm`/`md`/`lg`)
but that is an explicit per-usage choice, not a responsive breakpoint.

## Implication for implementation requests

If asked to "implement the mobile version" of a page or component:
1. State plainly that no responsive breakpoint system exists in the code
   today — this is new work, not a lookup.
2. Use the Figma mobile (402px) frame's own values (font sizes, spacing)
   from [[design-system]]/[[pages-and-features]] as the target, not a guess.
3. Do not invent a breakpoint value (e.g. "768px") without it being either
   in the Figma frame naming/sizing or explicitly requested by the user.

`BottomShader`'s canvas sizing has one adjacent, unrelated technical detail
worth knowing: it deliberately renders its WebGL canvas at a fixed `100vh`
regardless of how much of it is visually cropped, specifically because an
earlier version that sized the canvas as "a multiple of the host's own
height" broke once the host's height stopped being a simple viewport
fraction (e.g. inside the Studio docs Playground's preview box) — this is a
canvas-sizing robustness fix, not a responsive breakpoint, and shouldn't be
conflated with one.
