---
name: component-library
description: Full inventory of React components in src/components — path, purpose, props, variants, dependencies.
metadata:
  type: reference
---

# Component Library (`src/components/*`)

Every folder is self-contained and copy-paste-portable (stated explicitly in
each README): copying the whole folder into another project is sufficient,
no shared code outside the folder is required.

## HLLButton — `src/components/hll-button/`

- **Purpose**: the single reusable button for every menu item / service CTA.
- **Files**: `HLLButton.jsx`, `hll-button-variants.js`, `hll-button-definition.js`, `hll-button-runtime.js` (WebGL2 shader engine), `hll-button.css`, `index.js`, `README.md`.
- **Props**: `variant` (11 values, default `services`), `children` (label), `as` (default `"button"`), `gradient` (string[] override), `direction` (deg override), `radius` (0–0.5 override), `glow` (0–3 override), `size` (`sm`/`md`/`lg`), `animated` (bool, default `true`), `disabled`, `isLoading`, `className`, `style`.
- **States**: default/hover/active(click-pulse)/focus/disabled/loading — see [[design-system]].
- **Dependencies**: `class-variance-authority`, `three`.
- **Adding a variant**: add one entry to `VARIANT_GRADIENTS` + one class key — no new component (README's own documented recipe).

## HLLOutlineButton — `src/components/hll-outline-button/`

- **Purpose**: outline/hollow-border counterpart to HLLButton, same box/typography/size system, gradient IS the border (`strokeWidth: 0.06`) rather than a fill.
- **Files**: mirrors HLLButton's file set (`HLLOutlineButton.jsx`, `hll-outline-button-variants.js`, `hll-outline-button-definition.js`, `hll-outline-button-runtime.js`, `hll-outline-button.css`, `index.js`).
- **Props/variants**: same shape as HLLButton (6 `hll-*` + 5 menu-item variants observed in `src/App.jsx` usage).

## Shader — `src/components/shader/`

- **Purpose**: fullscreen ("BlockGL — jewel refraction") WebGL2 background effect; only one instance should mount at a time (`position: fixed; inset: 0`).
- **Files**: `Shader.jsx`, `shader-definition.js` (settings: vignette/sine/shatter/bokeh), `shader-variants.js` (same 11 gradients), `shader-runtime.js` (`createShaderFX(canvas, options)` factory), `shader.css`.
- **Props**: `variant` (11 values), `colors` (override).
- **MenuTriggerOverlay** (`MenuTriggerOverlay.jsx`, same folder): wraps `Shader` with a placeholder `Services.png` fullscreen backdrop and `background.transparent: true` so the image shows through the effect. Explicitly documented as a placeholder — "swap `servicesImg` for the actual menu-trigger UI once that's ready."

## BottomShader — `src/components/bottom-shader/`

- **Purpose**: the same Shader engine, cropped/anchored to the bottom of the viewport instead of fullscreen; only one instance should mount at a time.
- **Files**: `BottomShader.jsx`, `bottom-shader-definition.js` (layout math: fixed `CANVAS_HEIGHT: '100vh'`, `FADE_FRACTION_OF_WINDOW: 0.3` top-edge fade), `bottom-shader-variants.js` (same 11 gradients), `bottom-shader.css`.
- **Props**: `variant`, `colors`, plus an `overlay` prop enabling `mix-blend-mode: hard-light` compositing (see `ServicesScrollDemo.jsx`).
- **ServicesScrollDemo.jsx** (same folder): a demo showing `Services.png` as page content with two crossfading `BottomShader` instances (one blended, one plain) to fake a smooth transition across a scroll threshold, since `mix-blend-mode` can't itself be CSS-transitioned.

## Ripple — `src/components/ripple/`

- **Purpose**: centered-origin p5.js/WebGL ripple background sketch, one 6-stop palette per HLL service.
- **Files**: `Ripple.jsx`, `ripple-definition.js` (`MAX_RIPPLES: 32`, per-variant `VARIANT_PARAMS`: bands/speed/flow/shear/scale/wobble/saturation/vibrancy/contrast), `ripple-variants.js` (6-stop `VARIANT_GRADIENTS`, keys: `hll-application`, `hll-foundation`, `hll-trust-and-governance`, `hll-people-and-policy`, `hll-ontology`, `hll-ai` — note the naming drift from HLLButton's keys, see [[known-gaps]]), `shader.vert`/`shader.frag`.
- **Props**: `variant`, `palette` (override).
- **Dependency**: `p5`.

## CornerRipple — `src/components/cornerripple/`

- **Purpose**: same ripple effect, origin pinned to a frame corner instead of centered.
- **Files/props**: mirrors Ripple's structure (`CornerRipple.jsx`, `cornerripple-definition.js`, `cornerripple-variants.js`, own `shader.vert`/`shader.frag`).

## Tag — `src/components/tag/`

- **Purpose**: static (no hover/active state) filter-chip/label with a leading removable-"x" icon; auto-sizes to content.
- **Files**: `Tag.jsx`, `tag-definition.js`, `tag-variants.js` (`warm`/`cool` only), `tag-runtime.js` (`LightComponent`, `cloneDefinition`), `tag.css`, `plus.svg`.
- **Props**: `variant` (`warm`/`cool`), `size` (`sm`/`md`/`lg`), `disabled`.

## GradientRevealTextNormal — `src/components/heading-anim-normal/`

- **Purpose**: headline reveal, 600ms white→variant-color→ink "sweep."
- **Props**: `text`, `variant` (6 `hll-*` values, default `hll-ai`), `autoPlay`, `replayKey`, `fontSize` (default `"67px"` — Figma H1 is 64px, see [[known-gaps]]), `letterSpacing`, `ink`, `duration` (600), `glow`, `lead`.
- Respects `prefers-reduced-motion: reduce`.

## GradientRevealTextSlow — `src/components/heading-anim-slow/`

- **Purpose**: headline reveal, 1200ms multi-band "leak" sweep across the variant's gradient stops.
- **Props**: same shape as Normal variant (`text`, `variant`, `replayKey`, etc.), `duration` defaults to 1200.

## OurPromise — `src/components/our-promise/`

- **Purpose**: bespoke scroll-driven hero section — fixed fullscreen p5.js ripple-mesh canvas backdrop, hero text overlay that fades/scales out, image reveal that fades/scales in, all keyed to a fixed-pixel scroll threshold (`SCROLL_TRIGGER_PX`) independent of total page length.
- **Files**: `OurPromise.jsx`, `our-promise-definition.js` (`COLOR_PALETTE` pre-scroll vs. `GRAY_PALETTE` post-scroll — palettes lerp together on scroll, not swap instantly), `shader.vert`/`shader.frag`.
- **Props**: content (eyebrow/headline/image) passed in, not hard-coded, "so this can be dropped into any page without carrying over the demo copy."
- **Note**: this is the one component tied to a specific narrative/copy concept ("Our Promise") rather than a generic per-service primitive — treat it as a hero-section pattern, not a reusable primitive like the others.

## Shared conventions across all components

- One component per visual effect; `variant` selects color, never invent a second component for a new page.
- `*-definition.js` = frozen non-color preset (re-copy from LightFX Studio, don't hand-edit).
- `*-variants.js` = CVA class composer + the color/tuning data map (source of truth for colors).
- Every folder ships its own `index.js` barrel export and is designed to be copied wholesale into another project.
