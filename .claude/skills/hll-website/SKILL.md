---
name: hll-website
description: Authoritative project knowledge for the HLL (Hyper Lychee Labs) website — an approved Figma design plus the "HLL UI Demo" React component library that implements its visual-effects design system. Use for generating presentations, documentation, user guides, specs, PRDs, QA scenarios, release notes, handover docs, or for implementing/modifying the site's React UI.
---

# HLL Website — Project Skill

## What this project is

"HLL UI Demo" (this repo) is **not** a multi-page product with app modules —
it is a **design-system component library** (React + Vite) that implements
the visual-effects language of the approved **HLL Website** Figma file
(`HLL Website Design`, file key `4aTBww339Nxg5OsyvRR5Y2`). The Figma file is
the full marketing website (Home, Services, Industries, Engagement, About,
Careers, Contact, per-service pages, mobile variants). This repo currently
implements the **reusable visual primitives** that site is built from —
buttons, background shaders, ripples, tags, gradient-reveal headings — not
the assembled pages themselves. `src/App.jsx` is a scratch demo harness for
trying variants of these components, not a page of the real site.

Every component is built the same way: **one implementation, many
`variant`s**. A `variant` prop selects a predefined, named color gradient;
shape, blur/glow behavior, interaction, and typography are identical across
every variant and defined once per component. There are 11 shared variant
names used across most components: 5 top-nav menu items
(`services`, `industries`, `engagement`, `about`, `contact`) and 6 HLL
service lines (`hll-ai`, `hll-trust`, `hll-foundation`, `hll-ontology`,
`hll-people`, `hll-application`). See [[design-system]] for the exact
values and which components use which variant set.

## Source-of-truth hierarchy

When information conflicts, resolve in this order:

1. **Approved Figma file** (`HLL Website Design`, `4aTBww339Nxg5OsyvRR5Y2`) — the actual page layouts, copy, and structure.
2. **Explicit Figma annotations** — text found directly on the canvas that reads as a designer instruction or business rule (there are very few in this file; see [[known-gaps]] for what was actually found).
3. **Existing React implementation** (`src/components/**`) — the real, working component behavior, props, and variant data. Each component folder's own `README.md` / `*-definition.js` / `*-variants.js` comments are unusually thorough and are treated as first-class documentation, not just code.
4. **Existing project documentation** (component READMEs, this skill).
5. **Inference** — last resort, and must be labeled as such.

**If something cannot be determined from the above, say so explicitly:**
`Not specified in the provided project sources.` Never invent a feature,
page, business rule, or component that isn't backed by one of the four
sources above.

## Project terminology (use these terms, not synonyms)

- **Variant** — the named gradient a component renders (never call it a "theme" or "color scheme").
- **HLL service** / **service line** — one of the six `hll-*` variants (AI, Trust, Foundation, Ontology, People, Application) — these are HLL's practice areas, not app "features."
- **Menu item variant** — one of the five nav gradients (`services`/`industries`/`engagement`/`about`/`contact`), shared verbatim by the nav bar, `HLLButton`, `HLLOutlineButton`, `Shader`, and `BottomShader`.
- **LightFX Studio** — the external design tool these components' shader presets were exported from. Referenced in component headers as the origin of `*-definition.js` files; this repo does not contain Studio itself.
- **Definition file** (`*-definition.js`) — the frozen, non-color preset (shape/effects/interaction/typography) for a component, meant to be re-copied from Studio, not hand-edited.
- **Variants file** (`*-variants.js`) — the CVA class composer plus the `VARIANT_GRADIENTS`/`VARIANT_PARAMS` map (the color/tuning data), the single source of truth for a component's per-variant look.
- Use "HLL AI / HLL Trust / HLL Foundation / HLL Ontology / HLL People / HLL Application" verbatim for the six services — do not paraphrase them into invented product names.

See [[terminology]] for the full glossary.

## References — read before generating a deliverable

| Reference | Contains |
|---|---|
| [[product-overview]] | What HLL's website is, who it's for, what this repo covers vs. doesn't |
| [[pages-and-features]] | The Figma file's actual page/screen inventory (desktop + mobile), by section |
| [[design-system]] | Typography scale, color/gradient variants, per-component tuning, shapes, states |
| [[component-library]] | Every React component: path, props, variants, states, dependencies |
| [[figma-to-code]] | Figma frame/component ↔ React component mapping, with explicit gaps |
| [[user-flows]] | The only real navigation/interaction flow evidenced in sources (nav → mega-menu), and what's not evidenced |
| [[responsive-rules]] | Figma's desktop (1512px) vs. mobile (402px) artboards, and the React side's actual (lack of) breakpoint implementation |
| [[terminology]] | Full project glossary |
| [[implementation-patterns]] | Conventions for adding variants, folder structure, CVA usage, shader/p5 wrapping pattern |
| [[known-gaps]] | Every Figma↔code discrepancy, missing page, and unresolved item — do not silently paper over these |

Match the deliverable to the references it actually needs:

- **Presentation about the product** → `product-overview.md`, `pages-and-features.md`, `design-system.md`
- **Documentation / user guide for a component** → `component-library.md`, `implementation-patterns.md`
- **PRD / feature spec** → `product-overview.md`, `pages-and-features.md`, `known-gaps.md` (to scope what's already built vs. not)
- **QA / test scenarios** → `component-library.md` (states/props), `responsive-rules.md`, `known-gaps.md`
- **Release notes / handover doc** → `component-library.md`, `known-gaps.md`, `implementation-patterns.md`
- **Implementing or modifying UI** → `component-library.md`, `figma-to-code.md`, `design-system.md`, `implementation-patterns.md`

## How to act on a request

**"Create a presentation / doc / user guide about X"**
1. Identify whether X is a Figma *page* (e.g. "the Home page"), an HLL *service* (e.g. "HLL Trust"), or a *component* (e.g. "the button system").
2. Pull the relevant facts only from the references above — do not add features, copy, or flows the sources don't contain.
3. Use the project's own terminology ([[terminology]]).
4. Where Figma provides real visuals (via the connected Figma file) and the request benefits from them, reference the actual frame/screenshot rather than describing a generic layout.
5. If asked about something not covered by any reference (e.g. a business rule, a metric, a launch date), respond with `Not specified in the provided project sources.` rather than guessing.

**"Implement / build / modify the X page or component"**
1. Look up X in [[figma-to-code]] to find its Figma frame and, if it exists, its React counterpart.
2. If a React component already covers it, reuse it — add a `variant` entry rather than a new component (see [[implementation-patterns]]'s "adding a variant" recipe, e.g. `hll-button/README.md`'s own walkthrough).
3. Pull exact colors/typography from [[design-system]] — never invent a hex value or font size.
4. Follow the existing wrapper pattern for the effect type (WebGL2 canvas via `*-runtime.js`, or p5.js instance-mode via `?raw` shader imports) — see [[implementation-patterns]].
5. If X is a Figma page with no React implementation yet (most pages — see [[known-gaps]]), say so explicitly and propose which existing components it would assemble from, rather than fabricating a new page-level component.

## Anti-patterns — do not do these

- Do not invent product features, pages, business rules, or user flows beyond what Figma, its annotations, or the React code actually show.
- Do not create a new component for a new page/variant when an existing component's `variant` system already covers it — this violates the project's explicit "one implementation, many variants" convention (see every component README's "Adding a New Variant" section).
- Do not invent colors, gradient stops, font sizes, or spacing — use only values from [[design-system]] (sourced from `*-definition.js`/`*-variants.js` and the Figma "Typography styles"/"Industry Colours" reference frames).
- Do not treat the placeholder/draft copy visible in Figma (e.g. unfinished headline prompts) as final, approved product copy — flag it as draft where relevant.
- Do not silently resolve the known naming mismatches between components (e.g. `ripple`'s `hll-trust-and-governance` vs. `hll-button`'s `hll-trust`) — surface them, see [[known-gaps]].
- Do not claim a Figma page is "implemented" just because some of its visual components exist in React — most Figma pages have no assembled React page yet (see [[known-gaps]]).
- Do not modify `*-definition.js` files casually — they are documented as frozen exports from LightFX Studio, re-copied wholesale when Studio's preset changes, not hand-tuned in place.
- Do not treat a presentation, doc, or PRD you generate as a new source of truth for a future request — always re-derive from Figma/code/this skill.
