---
name: design-system
description: Typography, color/gradient variants, shape, and interaction tokens — sourced from Figma's Typography styles/Industry Colours frames and each component's -definition.js/-variants.js.
metadata:
  type: reference
---

# Design System

## Typography (from Figma's "Typography styles" frame, node `1531:2813`)

Two typefaces: **Aeonik TRIAL** (headlines/body/titles/section headings) and
**Sometype Mono** (functional UI text). Desktop / Mobile pairs:

| Style | Desktop | Mobile |
|---|---|---|
| Headline 1 (H1) | Aeonik Light, 64px, line-height 100% | Aeonik Light, 30px |
| Paragraph | Aeonik Regular, 20px, line-height 125% | Aeonik Regular, 14px |
| Paragraph Large (Case Study / content-heavy pages) | Aeonik Regular, 24px, line-height 125% | Aeonik Regular, 14px (same paragraph mobile style) |
| Title Regular | Aeonik Regular, 36px | Aeonik Regular, 24px |
| Title Medium | Aeonik Medium, 36px | Aeonik Medium, 24px |
| Section Heading | Aeonik Regular, 12px, uppercase, tracking 25% | Aeonik Regular, 10px, uppercase, tracking 25% |
| Functional UI Text | Sometype Mono Regular, 12px, uppercase | Sometype Mono Regular, 10px |

Colors used in type: Dark Grey `#1A1A1A` (primary text), Mid Grey `#949494`
(secondary/caption text), label grey `#818181` (spec-sheet annotations,
not final UI).

React component headline animations (`heading-anim-normal`,
`heading-anim-slow`) use `fontSize="67px"` as their own default — close to
but not identical to the Figma H1's 64px; treat the Figma value as
authoritative for new work and flag the ~3px drift if asked to reconcile
(see [[known-gaps]]).

## Color variants — the 11 shared gradient variants

Every interactive/effect component (`HLLButton`, `HLLOutlineButton`,
`Shader`, `BottomShader`, `GradientRevealTextNormal`,
`GradientRevealTextSlow`) shares this exact set, defined once in
`hll-button-variants.js`'s `VARIANT_GRADIENTS` and copied verbatim into each
other component's own variants file so they can never visually drift apart:

**Top-nav menu items** (3-stop gradients):

| Variant | Gradient |
|---|---|
| `services` | `#F7A567 → #E05A35 → #EB3B3E` |
| `industries` | `#0352B2 → #037A9F → #6460D5` |
| `engagement` | `#F9B535 → #FF9126 → #FF6302` |
| `about` | `#9AB4D3 → #A28DD7 → #AD7ECF` |
| `contact` | `#ABBFFF → #2BB4EB → #076EB8` |

**HLL service lines** (2-stop gradients):

| Variant | Gradient |
|---|---|
| `hll-ai` | `#3773FF → #BCA6D6` |
| `hll-trust` | `#129562 → #7CBAAA` |
| `hll-foundation` | `#FF5A1E → #CC8B93` |
| `hll-ontology` | `#7455FF → #FFB26A` |
| `hll-people` | `#FF9042 → #FFEEC7` |
| `hll-application` | `#FF1F1F → #72AAFF` |

Regenerate this table from code with
`node scripts/print-hll-button-variants.mjs` — `VARIANT_GRADIENTS` in
`src/components/hll-button/hll-button-variants.js` is the single source of
truth; never hand-edit a color into a deliverable without checking it there.

**`Tag` uses a separate, smaller palette** (not the 11 above): `warm` and
`cool`, from LightFX Studio's own "Tag — Warm"/"Tag — Cool" presets — see
`src/components/tag/tag-variants.js` for exact stops.

**`Ripple`/`CornerRipple` use a different naming scheme and richer
6-stop-per-variant palettes** for the same six services — e.g. `ripple`'s
`hll-application` is `#387dd6, #7887e6, #a182bf, #bf7dc7, #f28a85, #f7262b`
(6 stops) vs. `hll-button`'s 2-stop `hll-application` (`#FF1F1F → #72AAFF`).
The variant *keys* also differ (`hll-trust-and-governance`,
`hll-people-and-policy` vs. `hll-trust`, `hll-people` elsewhere) — this is a
real naming inconsistency across the library, not a stylistic choice; see
[[known-gaps]].

## Industry color tokens (Figma "Industry Colours" frame, node `1341:19019`)

Each industry-category page gets its own single primary color (a literal
designer annotation on this frame, verbatim):

> "EACH INDUSTRY PAGE HAS IT'S own primary colour assigned, the overhead
> gradient palettes are just to bucket the categories, and may be used if
> required."

Category buckets and their swatches, as laid out on the canvas: Financial
Services (Banking `#06d58c`, Payments `#ffda52`, Insurance `#2eb8f6`),
Commerce and Consumer (Retail Commerce & Brands `#fb500c`, Travel &
Hospitality `#798cf6`, Pet Tech `#f8af7e`), Government & Public Institutions
(Public Sector – Tax & Commerce `#ffda52`, Public Sector – External Affairs
`#ffba6e`, International Organization `#2eb8f6`), Health & Life Sciences
(Healthcare `#09c1b6`, Pharmaceuticals `#086ee8`), Professional Services
(Consulting Firms `#5cb3de`), Built Environment & Industry (Logistics
`#3894f2`, Real Estate `#6e6bdf`, Manufacturing `#c27153`). These are
Figma-only reference tokens today — no React component currently reads an
"industry" variant set (see [[known-gaps]]).

## Shape / interaction tokens (per component, from `*-definition.js`)

- **HLLButton**: `roundRect` shape, corner radius 0.17 (relative), box 136×36 (`md`), invisible base fill with muted-gray uppercase label (`ENTERPRISE`-style, `letterSpacing: 2`, `fontSize: 14`), hover blooms into the variant gradient with `blur: 1.75`, `pointerdown` starts a click-pulse ring, `cursorFocusRadius: 1.4` cursor-lens tuning.
- **HLLOutlineButton**: same box/typography, but `strokeWidth: 0.06` — a hollow gradient border, not a fill; base is a plain gray hairline, hover fades in the gradient border.
- **Tag**: box auto-sized 32px tall (`~90px` default width), no hover/active state at all (`hover: false`), always fully blurred/static — a color "blob," not an interactive control.
- **Shader / BottomShader**: WebGL2 multi-pass effect ("BlockGL — jewel refraction"): vignette (radius 0.6, skew 0.54), sine warp (frequency 0.35, amplitude 3.18), voronoi shatter, bokeh, composited output. `BottomShader` reuses the identical engine, just cropped/positioned to the bottom of the viewport via `bottom-shader-definition.js`'s layout math (fixed `100vh` canvas height regardless of visible crop, so the pattern itself never distorts).
- **Ripple / CornerRipple**: p5.js instance-mode WebGL sketches, per-service tuned params (`bands`, `speed`, `flow`, `shear`, `scale`, `wobble`, `saturation`, `vibrancy`, `contrast`, up to `MAX_RIPPLES: 32` simultaneous ripples). `CornerRipple` pins the origin to a frame corner; `Ripple` centers it.
- **GradientRevealTextNormal / …Slow**: text-reveal animations, not shapes — "normal" is a 600ms white→variant-color→ink sweep; "slow" is a 1200ms multi-band "leak" sweep. Respect `prefers-reduced-motion: reduce` (only components with this guard).

## States

Documented, real interaction states (from component docs, not inferred):
Default / Hover / Active(click-pulse) / Focus (`:focus-visible` outline) /
Disabled (native `disabled` + `pointer-events: none`) / Loading
(`isLoading`, adds a CSS spinner + `aria-busy`) — all on `HLLButton`;
`HLLOutlineButton` shares the same state model. `Tag` has only
Default/Disabled (no hover/active — see above). Shader/Ripple/CornerRipple
have no discrete "states," only continuous cursor-driven effects.
