---
name: implementation-patterns
description: Repo conventions for folder structure, adding variants, and the two effect-wrapping patterns (WebGL2 canvas vs. p5.js instance mode) used throughout the library.
metadata:
  type: reference
---

# Implementation Patterns

## Folder structure convention

Every component lives in its own folder under `src/components/`, fully
self-contained:

```
component-name/
├── ComponentName.jsx          the component
├── component-name-variants.js CVA classes + VARIANT_GRADIENTS/VARIANT_PARAMS
├── component-name-definition.js  shared non-color preset (shape/effects/interaction/typography)
├── component-name-runtime.js  the effect engine (WebGL2 or p5, where applicable)
├── component-name.css
├── index.js                   barrel export
└── README.md                  (present for hll-button; not universal)
```

Copying the whole folder into another project is documented as sufficient
and self-contained — no file outside the folder is required.

## Adding a new variant — the canonical recipe (from `hll-button/README.md`)

**Never create a new component for a new page or service.** Add one entry
to that component's `VARIANT_GRADIENTS` (or `VARIANT_PARAMS`/palette map for
Ripple-style components), plus a matching CVA class key:

```js
// hll-button-variants.js
export const VARIANT_GRADIENTS = {
  // ...existing entries
  pricing: { colors: ['#a78bfa', '#7dd3fc'], usage: 'Pricing menu item' },
};
```
```js
variant: {
  // ...existing keys
  pricing: 'hll-button--pricing',
},
```

That's it — `<HLLButton variant="pricing">Pricing</HLLButton>` now works
with the same shape/blur/glow/hover/typography as every other variant. Apply
the same recipe to any sibling component (`Shader`, `BottomShader`,
`GradientRevealTextNormal/Slow`) if the new variant needs to appear there
too — keep the color entries byte-identical across components per
[[design-system]]'s note on the shared 11-variant system.

## Reuse-only page building

Detailed procedure behind `SKILL.md`'s "Reuse-only rule". Applies to every
page, section, or layout built or modified in this repo.

**1. Discover.** Read `package.json` (its dependencies are the only
libraries allowed), the `src/` tree, `main.jsx`/`App.jsx` (canonical usage
and how things are mounted), `index.css` (fonts, tokens, globals), and each
component folder's README/`*-definition.js`/`*-variants.js` comments.

**2. Inventory.** From the real source of each candidate component, note:
import path (folder barrel `index.js`), purpose, props and `children`,
allowed `variant` values, behavior (canvas/WebGL/p5, refs, cleanup), layout
contract (sizing, absolute/fixed positioning, needs a positioned parent or
explicit height), styling files, and performance limits (e.g. avoid many
GPU-heavy shader components mounted at once). Show the user a compact
version before building if the page is non-trivial.

**3. Map and compose.** Match each page element to an existing component and
the semantically right variant. If nothing fits one-to-one, compose
(nesting, wrappers, different props/variants). Use plain semantic HTML with
existing classes/tokens only as layout glue. List elements with no match as
gaps; do not fill them silently.

**4. Implement.** Follow neighbor conventions (file/folder naming, barrel
imports, JSX style, comment density). Copy how `App.jsx` wires components.
Use existing tokens/variants, never hard-coded colors, fonts, or spacing.
Register the page with the smallest possible change to existing files.
Don't edit shared components or `*-definition.js` for one page's needs.

**5. New component gate.** Allowed only if all hold: no component, variant,
or composition can satisfy the need (name what you checked); the need is
reusable, not a one-off tweak; the user is told (ask if unsure). Then it must
use the folder structure above, be built from existing components/tokens,
follow the one-implementation-many-`variant`s convention, add no dependency,
and be called out in your summary. A new `variant` entry (recipe above) is
preferred over a new component, but its color must be source-backed per
[[design-system]].

**6. Verify.** `package.json` unchanged; no duplicate components; imports
resolve; `npm run build` passes (and dev server renders without console
errors when feasible); diff limited to the page, its wiring, and any
approved new component. Finish with: files changed, components + variants
used, gaps/new components (or "None"), assumptions.

## The two effect-wrapping patterns

**1. WebGL2 canvas + factory runtime** — used by `HLLButton`,
`HLLOutlineButton`, `Tag`, `Shader`, `BottomShader`:
- A `*-runtime.js` module exports a factory (`createShaderFX(canvas,
  options)` for Shader; `LightComponent`/`cloneDefinition` for
  HLLButton/Tag/HLLOutlineButton) that owns the actual WebGL render loop.
- The `.jsx` component only owns lifecycle: `useRef` for the canvas,
  `useEffect` to construct/destroy the engine instance on mount/unmount, and
  passes `BASE_DEFINITION`/`BASE_SETTINGS` cloned + variant colors merged in.
- Hover/click are handled by the engine's own `pointerenter`/`pointerleave`/
  `pointermove`/`pointerdown` listeners — **not** React state — so hovering
  never triggers a React re-render.

**2. p5.js instance mode + `?raw` shader imports** — used by `Ripple`,
`CornerRipple`, `OurPromise`:
- Original sketches were p5 *global-mode* scripts (`preload`/`setup`/`draw`
  as window-level functions, `loadShader()` fetching `.vert`/`.frag` over
  the network) — incompatible with a mountable/unmountable component and a
  non-global namespace.
- Converted to p5 **instance mode**: a `sketch(p, ...)` function passed to
  `new p5(sketch, container)`, torn down on unmount.
- Shader source loads via Vite's `?raw` import (`import vertSrc from
  './shader.vert?raw'`) instead of a network fetch — already the exact GLSL
  text at build time, no runtime loading state to manage.

When implementing a new effect component, match whichever of these two
patterns fits the effect's origin (WebGL2 canvas engine vs. p5.js sketch)
rather than inventing a third approach.

## Reproducing images/icons pulled from Figma

Per the connected Figma MCP's own instructions (also load `figma-design-
to-code` skill before calling `get_design_context` again in a future
session): render every icon/image from its exported Figma asset URL, never
hand-author an inline `<svg>` path or invent a placeholder graphic. Asset
URLs from `get_design_context`/`get_screenshot` expire in ~7 days — download
and commit the actual bytes for anything going into a real PR, don't leave
a live `figma.com/api/mcp/asset/...` URL in shipped code.

## Do not hand-edit definition files piecemeal

`*-definition.js` files carry an explicit "re-copy this file from Studio
whenever the base preset changes" instruction in their own header comments.
Treat them as generated/frozen — if a shape/effect/typography change is
needed, get the new export from LightFX Studio rather than editing
individual fields in place (the one exception each file allows: swapping
`params.base`/`params.hover` *colors*, which the corresponding
`*-variants.js` file already does per-variant at mount time — don't
duplicate that logic inside the definition file itself).
