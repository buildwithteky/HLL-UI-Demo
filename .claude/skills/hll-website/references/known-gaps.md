---
name: known-gaps
description: Every Figma↔code discrepancy, missing implementation, and unresolved naming inconsistency found during analysis. Surface these explicitly in deliverables rather than resolving them silently.
metadata:
  type: reference
---

# Known Gaps & Conflicts

## Pages designed in Figma with no assembled React implementation

The vast majority of the site: Home, Services, Industries, Industry,
Engagement Main, Engagement Filter Expanded, Engagement Story Template,
Case Study Template, Team, Careers, JD, About_01, About_02, Contact, and all
six per-service pages (HLL AI/TG/F/O/P/App), plus every mobile (402px)
frame. Only the reusable visual *primitives* these pages would be built
from exist in `src/components/`. **Never describe these as "implemented"
pages** — describe them as "designed in Figma; composable from existing
components; not yet assembled" if asked.

## Variant-key naming inconsistency across components

`hll-button-variants.js` (and everything copied from it — Shader,
BottomShader, the two heading-reveal components) uses:
`hll-trust`, `hll-people`.

`ripple-variants.js` / `cornerripple-variants.js` instead use:
`hll-trust-and-governance`, `hll-people-and-policy`.

These refer to the same two service lines but are **not interchangeable
strings** — passing `variant="hll-trust"` to `Ripple` or
`variant="hll-trust-and-governance"` to `HLLButton` will not resolve. Flag
this explicitly if asked to document the variant API across components, or
if implementing something that needs to pass one `variant` value to
multiple component types.

## Duplicate/inconsistent sub-link in the Services mega-menu

The "Services Menu" Figma frame (node `1341:15764`) lists six sub-links,
but "HLL Foundation" appears **twice** in the list (once between "HLL
Governance & Trust" and "HLL Motion," and again at the end), and the six
listed names (HLL Kinetic, HLL Momentum, HLL Governance & Trust, HLL
Foundation, HLL Motion, HLL Foundation) don't cleanly map 1:1 onto the six
`hll-*` service variants used elsewhere (AI/Trust/Foundation/Ontology/
People/Application) — e.g. "HLL Kinetic" and "HLL Motion" don't appear as
variant names anywhere in the component code. Treat this menu's exact
sub-link copy as **draft/unreconciled**, not final IA, until confirmed.

## Placeholder/draft copy visible in Figma

A few text layers read as unfinished prompts rather than approved copy,
e.g. a Home-page layer literally named *"what is the one-line promise? a
single sentence bridging the stack to proof."* and a Careers-page layer
named *"why work at hll?"*. Do not quote these as finished marketing copy in
a deliverable — flag them as draft/TBD if referenced at all.

## MenuTriggerOverlay is an explicit placeholder

`src/components/shader/MenuTriggerOverlay.jsx`'s own header comment states
it uses `Services.png` as "a placeholder background — swap `servicesImg`
for the actual menu-trigger UI once that's ready." Do not present this
component's current visual as the final menu-trigger design.

## Headline font-size drift

Figma's H1 style is 64px (desktop); `GradientRevealTextNormal`/`…Slow`
default their own `fontSize` prop to `"67px"`. Minor, but worth reconciling
if a pixel-perfect implementation is requested — don't silently pick one
without noting the discrepancy.

## No React "industry" variant system

Figma's "Industry Colours" reference frame defines a per-industry color
token for 16 named industries; no component in `src/components/` currently
exposes an industry-keyed variant set. If asked to implement an Industry
page, this token set would need to be added as new variant data — say so
rather than reusing the existing 11-variant system, which doesn't cover it.

## Not independently verified this pass

- Exact per-sub-link routing behavior in any mega-menu.
- Whether the other four mega-menus (Industries/Engagement/About/Contact)
  share the Services menu's exact "sub-links + In the News panel" layout,
  or differ.
- Pixel-for-pixel confirmation of `Tag`'s Figma counterpart (treated as a
  plausible match to the Engagement filter-chip UI, not confirmed node-by-
  node).
- Full body copy for any page beyond the fragments read during this
  analysis.

Anything not listed above as confirmed, and not covered by another
reference file, should be answered with:
`Not specified in the provided project sources.`
