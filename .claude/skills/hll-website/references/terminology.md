---
name: terminology
description: Project glossary — use these exact terms in generated deliverables.
metadata:
  type: reference
---

# Terminology

| Term | Meaning |
|---|---|
| **HLL** | The company/brand ("Hyper Lychee Labs" per the nav logo text) whose marketing site this is. |
| **Variant** | The named prop value (`variant="services"`, `variant="hll-ai"`, etc.) that selects a component's color/gradient. Never call this a "theme," "skin," or "color scheme." |
| **Menu item variant** | One of `services` / `industries` / `engagement` / `about` / `contact` — the top nav's five sections, each with its own 3-stop gradient shared across every component. |
| **HLL service / service line** | One of `hll-ai` / `hll-trust` / `hll-foundation` / `hll-ontology` / `hll-people` / `hll-application` — HLL's six practice areas, each with its own 2-stop (or, for Ripple, 6-stop) gradient. |
| **Definition file** (`*-definition.js`) | The frozen, non-color structural preset for a component (shape, effects toggles, interaction/cursor-lens tuning, typography, render mode) — copied verbatim from LightFX Studio, re-copied wholesale on change, never hand-edited piecemeal. |
| **Variants file** (`*-variants.js`) | The CVA (`class-variance-authority`) class composer plus the `VARIANT_GRADIENTS`/`VARIANT_PARAMS` map — the single source of truth for a component's per-variant color/tuning data. |
| **LightFX Studio** | The external design tool a component's shader preset was originally authored/exported from (referenced in file headers). Not part of this repo. |
| **Cursor-lens** | The hover interaction model on `HLLButton`/`HLLOutlineButton` where a soft radial "lens" follows the pointer (`cursorFocusRadius`, `cursorRadius`, etc. in the definition file) rather than a flat hover state. |
| **Click-pulse** | The expanding ring animation `HLLButton` starts on `pointerdown`. |
| **Mega-menu** | The nav-bar dropdown panel opened by a nav item (e.g. "Services Menu" Figma frame) — sub-links plus, in the Services case, an "In the News" panel. |
| **BlockGL — jewel refraction** | The name (per code comments) of the WebGL2 multi-pass effect powering `Shader`/`BottomShader` (vignette, sine warp, voronoi shatter, bokeh). |
| **HLL Ripples** | The name (per code comments) of the p5.js sketch powering `Ripple`/`CornerRipple`. |
| **Studio Export panel** | LightFX Studio's own zip-export feature for a single component preset — the origin convention every `*-definition.js` file's header comment describes; not present in this repo. |

Use the six service names verbatim and in full where user-facing: **HLL
AI**, **HLL Trust** (nav copy also shows "HLL Governance & Trust" — see
[[known-gaps]]), **HLL Foundation**, **HLL Ontology**, **HLL People**, **HLL
Application**. Do not shorten, pluralize, or rebrand these.
