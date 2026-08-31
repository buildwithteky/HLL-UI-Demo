---
name: user-guide-generation
description: Worked example of generating a user guide from this skill's references.
metadata:
  type: example
---

# Example: User Guide Generation

**Input:** "Create a user guide for adding a new HLL service to the design
system (e.g. a seventh service line)."

**Expected process:**

1. This is fundamentally an [[implementation-patterns]] task, not a
   feature-usage guide — there's no end-user-facing "guide" for a site
   visitor here (this repo has no assembled, navigable site to write an
   end-user guide for; see [[product-overview]]).
2. Write the guide around the actual documented recipe: add one entry to
   each relevant component's `VARIANT_GRADIENTS`/`VARIANT_PARAMS` map
   (`hll-button-variants.js` is the canonical source others copy from) plus
   a matching CVA class key — no new component file.
3. Explicitly list every file that needs the new entry if the variant
   should be available everywhere: `hll-button-variants.js`,
   `hll-outline-button-variants.js`, `shader-variants.js`,
   `bottom-shader-variants.js`, `heading-anim-normal-variants.js`,
   `heading-anim-slow-variants.js`, and, if a ripple background is wanted
   too, `ripple-variants.js`/`cornerripple-variants.js` — noting these last
   two use a different key-naming convention (see [[known-gaps]]), so the
   guide should recommend picking one consistent key and using it
   everywhere for the *new* variant, rather than perpetuating the existing
   drift.
4. Point out that a new service would also need: its own Figma page (not
   yet existing for a hypothetical 7th service), and, if industry-style
   theming is wanted, a new entry in the Figma-only "Industry Colours"-
   style token set (which has no code equivalent yet — see
   [[known-gaps]]).

**What NOT to do:** write this as if it's a guide for a website *visitor*
("go to the Services menu and click...") — that's not what was asked, and
conflating "developer guide" with "end-user guide" would misrepresent this
repo's actual audience (see [[product-overview]]).
