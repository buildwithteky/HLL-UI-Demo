---
name: user-flows
description: Navigation/interaction flows actually evidenced in the Figma file and React code — kept deliberately short given this is a component library, not an assembled site.
metadata:
  type: reference
---

# User Flows

This project has one clearly evidenced navigation pattern; beyond it, page-
to-page flows are `Not specified in the provided project sources` — the
Figma file lays out individual pages, but no click-through prototype links
or flow diagrams were found connecting them during this analysis.

## Nav bar → mega-menu (confirmed from Figma "Services Menu" frame, node `1341:15764`)

1. The nav bar shows five items: **services / industries / engagement /
   about / contact**, each rendered as an `HLLButton`-style pill (the
   active item — `services` in this frame — is highlighted).
2. Selecting a nav item opens a mega-menu panel below the bar containing:
   - A left column of sub-links to that section's service pages (in the
     Services menu: "HLL Kinetic," "HLL Momentum," "HLL Governance & Trust,"
     "HLL Foundation," "HLL Motion," "HLL Foundation" again — see
     [[known-gaps]] for the naming inconsistency and duplicate entry), each
     with its own small snowflake-style icon.
   - A right-hand "In the News" panel listing recent company news items
     (e.g. "Fresh Recruit: John Doe joins HLL," "HLL to showcase work at
     SFCON2026").
   - The active nav item's own button re-rendered with its full gradient
     blur/glow, matching `HLLButton`'s hover treatment.
3. Each of the other four nav items (Industries Menu, Engagement Menu,
   About Menu, Contact Menu) is a separate Figma frame — not individually
   inspected this pass, but structurally implied to follow the same
   pattern (nav bar + sub-link column + possibly a right panel).
4. A separate **Menu Mobile** frame exists for the equivalent mobile
   interaction — not inspected this pass.

`Not specified`: what happens on click for each sub-link (do they route to
the per-service page, e.g. HLL AI? Presumed yes but not confirmed against a
prototype link), keyboard/touch interaction details beyond hover, or how the
mega-menu closes.

## Scroll-driven interactions (confirmed from React code, not Figma prototyping)

- **OurPromise**: crossing a fixed scroll-pixel threshold (`SCROLL_TRIGGER_PX`) fades/scales the hero text out and an image in, while the background ripple palette lerps from a colorful pre-scroll state to a cooler post-scroll state.
- **ServicesScrollDemo**: crossing "near the true bottom of the document" crossfades the `BottomShader` effect from a blended (`mix-blend-mode: hard-light`) look to a plain, unblended one.

These are React-side interaction decisions documented in the components'
own code comments; whether Figma specifies the same thresholds/triggers was
not independently verified (Figma is a static design tool and would not
show scroll-position triggers directly).

## What NOT to claim

Do not describe a full site journey (e.g. "user lands on Home, browses
Services, files a Contact form") as an implemented flow — only the nav→menu
interaction above is evidenced. Anything beyond it should be marked
`Not specified in the provided project sources.`
