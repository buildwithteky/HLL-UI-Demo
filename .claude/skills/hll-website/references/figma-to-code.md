---
name: figma-to-code
description: Mapping between Figma frames/components and their React implementations, including explicit gaps in both directions.
metadata:
  type: reference
---

# Figma → Code Mapping

| Figma element | React component | File | Variants covered | Notes |
|---|---|---|---|---|
| Nav Bar "Button" instances (services/industries/engagement/about/contact) | `HLLButton` | `src/components/hll-button/HLLButton.jsx` | All 5 menu-item + 6 service variants | Exact gradient match confirmed against nav bar's own `Button` node in "Services Menu" frame |
| Nav Bar outline/CTA button usage | `HLLOutlineButton` | `src/components/hll-outline-button/HLLOutlineButton.jsx` | Same 11 variants (per README/App.jsx usage) | Not independently re-verified against a specific outline instance in Figma this pass |
| Full-bleed background effect behind Home hero / service pages | `Shader` | `src/components/shader/Shader.jsx` | 11 variants | `MenuTriggerOverlay.jsx` is an explicit placeholder for a menu-trigger visual not yet finalized in Figma |
| Bottom-anchored background crop (seen in `ServicesScrollDemo`) | `BottomShader` | `src/components/bottom-shader/BottomShader.jsx` | 11 variants | — |
| Per-service ripple/mesh background | `Ripple` / `CornerRipple` | `src/components/ripple/`, `src/components/cornerripple/` | 6 service variants, keyed differently than HLLButton (see [[known-gaps]]) | — |
| Filter chip UI (Engagement Filter Expanded's expanded filter row) | `Tag` | `src/components/tag/Tag.jsx` | `warm`/`cool` only | Figma's filter chips were not individually inspected for exact variant-per-chip mapping this pass — treat as a plausible match, not confirmed pixel-for-pixel |
| H1/headline reveal-on-scroll motion (implied by Figma's type sheet + section structure) | `GradientRevealTextNormal`, `GradientRevealTextSlow` | `src/components/heading-anim-normal/`, `src/components/heading-anim-slow/` | 6 service variants | Figma is static; the reveal *motion* itself is not verifiable from Figma frames alone — it's a React-side interaction decision, not extracted from Figma |
| "Typography styles" reference frame | — | — | — | Documentation-only Figma frame; consumed directly for [[design-system]], no React equivalent needed |
| "Industry Colours" reference frame | — | — | — | Documentation-only Figma frame; no React "industry variant" system exists yet (see [[known-gaps]]) |
| "Our Promise" narrative hero section | `OurPromise` | `src/components/our-promise/OurPromise.jsx` | — | Concept/copy origin in Figma not independently located this pass — likely maps to a Home-page or About-page hero section, not confirmed |

## Figma pages/frames with NO React implementation

The large majority of Figma pages have no assembled page-level React
component today — only the primitives that would compose them exist. Not
yet implemented as pages: **Home** (only its component primitives exist),
**Services**, **Industries**, **Industry**, **Engagement Main**,
**Engagement Filter Expanded**, **Engagement Story Template**, **Case Study
Template**, **Team**, **Careers**, **JD**, **About_01**, **About_02**,
**Contact**, and all six per-service pages (**HLL AI/TG/F/O/P/App**), plus
every mobile (402px) frame. See [[known-gaps]] for how to phrase this in a
deliverable — never claim these are "built."

## React components with no confirmed Figma-side counterpart node

- None found this pass — every component's visual language traces to either the shared 11-gradient system (confirmed against the nav bar/menu instance) or a documented LightFX Studio preset origin (stated in each component's own header comment, not verified against a specific Figma node since Studio itself isn't in this Figma file).

## Variants present in Figma but not (yet) in React

- **Per-industry color tokens** ("Industry Colours" frame) — 16 named industries, each with its own swatch — have no corresponding `variant` set in any component today.

## Variants present in React but not obviously in Figma

- `Tag`'s `warm`/`cool` split traces to LightFX Studio presets per its own header comment, not to a Figma frame found this pass.
