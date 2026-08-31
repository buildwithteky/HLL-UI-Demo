---
name: documentation-generation
description: Worked example of generating documentation/PRD/QA deliverables from this skill's references.
metadata:
  type: example
---

# Example: Documentation Generation

**Input:** "Write component documentation for the Ripple and CornerRipple
components, aimed at a developer integrating them into the real website."

**Expected process:**

1. Pull the factual base from [[component-library]]: purpose, prop list
   (`variant`, `palette`), file set, the p5.js dependency.
2. Pull the wrapping pattern from [[implementation-patterns]] (p5 instance
   mode + `?raw` shader imports) so the doc correctly explains *why* these
   components are structured the way they are, not just *what* the props do.
3. Pull the exact variant keys and palettes from [[design-system]] —
   including the naming mismatch against `HLLButton`'s keys — and state it
   as a known inconsistency in a "Gotchas" section rather than normalizing
   the names.
4. Follow the existing `hll-button/README.md`'s structure/tone as the
   project's own documentation convention (Installation, Basic Usage,
   Variants table, Interaction States, API table, Customization,
   "Adding a New Variant") since Ripple/CornerRipple don't yet have their
   own README — this keeps new docs consistent with the one that exists.

**Input:** "Write QA test scenarios for HLLButton."

**Expected process:**

1. Pull the full prop/state list from [[component-library]] and
   [[design-system]]'s States section: default/hover/active/focus/disabled/
   loading, plus override props (`gradient`, `direction`, `radius`, `glow`).
2. Write scenarios only for behavior actually documented: e.g. "hovering
   should not trigger a React re-render (verify via render-count probe,
   since hover is handled by the shader engine's own pointer listeners, not
   React state)," "disabled sets `pointer-events: none` so the canvas
   should not visually respond to a hover/click attempt," "`isLoading` adds
   `aria-busy=\"true\"` and a spinner, and remains inert like disabled."
3. Do not invent scenarios about behavior not in the sources (e.g. any
   server-side validation, since this is a pure client-side visual
   component with no data layer).

**What NOT to do:** treat this generated documentation itself as a new
source of truth in a later request — always re-derive from the references,
not from a previously generated doc.
