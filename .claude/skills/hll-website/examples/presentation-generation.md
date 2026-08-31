---
name: presentation-generation
description: Worked example of generating a presentation deliverable from this skill's references.
metadata:
  type: example
---

# Example: Presentation Generation

**Input:** "Create a presentation explaining the HLL Trust service and its
brand system."

**Expected process:**

1. Confirm "HLL Trust" is one of the six service-line variants — check
   [[design-system]] for its gradient (`#129562 → #7CBAAA`) and [[terminology]]
   for the nav's alternate label ("HLL Governance & Trust") so both names
   are used correctly and the discrepancy is footnoted, not hidden.
2. Pull the service's Figma page from [[pages-and-features]] ("HLL TG" —
   Trust & Governance detail page) and note in the deck that its content
   was not deep-read in this analysis pass beyond structural existence —
   don't fabricate slide copy for it.
3. Pull which components render this variant from [[component-library]]:
   `HLLButton`, `HLLOutlineButton`, `Shader`, `BottomShader`,
   `GradientRevealTextNormal/Slow` all support `variant="hll-trust"`;
   `Ripple`/`CornerRipple` instead use `hll-trust-and-governance` — call
   this out as a build note if the deck is for an engineering audience.
4. Use a screenshot/color swatch from the live Figma connection (the
   "Industry Colours"/nav frames already pulled) rather than describing a
   generic hypothetical layout.
5. Structure slides around what's actually true: (1) what HLL Trust is per
   the nav/page inventory, (2) its brand gradient and where it's used
   system-wide, (3) which components already implement it and which
   Figma page it maps to, (4) open items from [[known-gaps]] if the
   audience is internal/technical.
6. Do not add a "user testimonials" or "results" slide — no such content
   exists in the sources.

**What NOT to do:** invent client logos, case-study metrics, or a founding
story for HLL — none of that exists in Figma, the notes, or the code.
