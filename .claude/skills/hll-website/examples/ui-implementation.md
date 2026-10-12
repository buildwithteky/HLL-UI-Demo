---
name: ui-implementation
description: Worked example of implementing/modifying UI from Figma using this skill's references.
metadata:
  type: example
---

# Example: UI Implementation

**Input:** "Implement the Services page based on Figma."

**Expected process:**

1. Look up "Services" in [[figma-to-code]] — it's in the "no React
   implementation" list. Say so plainly rather than pretending a page
   component already exists.
2. Identify which existing primitives it would assemble from: per
   [[pages-and-features]] the Services page is one of the 1512px desktop
   pages; per [[component-library]] the available primitives for a
   services-style page are `HLLButton`/`HLLOutlineButton` (service CTAs),
   `Shader`/`BottomShader` (background effects), `GradientRevealTextNormal/
   Slow` (headings), `Tag` (filter chips), `Ripple`/`CornerRipple`
   (per-service backgrounds).
3. Before writing code, pull real layout/copy for the Services frame via
   the connected Figma file (`get_design_context` on the Services frame's
   node id) rather than guessing a layout — this skill's [[known-gaps]]
   notes that most page copy wasn't deep-read during the initial analysis
   pass, so a fresh pull is needed for pixel-accurate work.
4. Apply [[implementation-patterns]]'s "Reuse-only page building": read the
   actual component source and `App.jsx` usage first, compose existing
   primitives, add no dependency. Only if the new-component gate there is
   met (unlikely), follow its wrapping conventions, and pull exact colors/type from [[design-system]] instead
   of eyeballing the screenshot.
5. If the layout needs a variant not yet defined anywhere (e.g. an
   industry-specific accent), flag it per [[known-gaps]]'s "No React
   industry variant system" note rather than inventing one silently.

**Input:** "Add a `pricing` variant to HLLButton and Shader so they can be
used on a future pricing page."

**Expected process:**

1. This is exactly [[implementation-patterns]]'s documented recipe — one
   `VARIANT_GRADIENTS` entry + one CVA class key in each file, no new
   component.
2. Since no Figma "pricing" page/color exists in the sources, the color
   choice itself has no source-of-truth backing — say so, and either ask
   the user for the intended gradient or use a clearly-marked placeholder,
   never present a self-invented color as if it came from an approved
   design.

**What NOT to do:** silently invent a full "Services page" component from
the screenshot alone without pulling live Figma design context first, and
never claim in a PR description or handover note that a page is "matches
Figma exactly" without having actually pulled that page's `get_design_context`
in the same session.
