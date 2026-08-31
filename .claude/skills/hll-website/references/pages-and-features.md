---
name: pages-and-features
description: Inventory of the Figma file's actual pages/frames (desktop and mobile), extracted from the live Figma file via get_metadata.
metadata:
  type: reference
---

# Pages & Features (from Figma)

Source: Figma file `HLL Website Design` (`4aTBww339Nxg5OsyvRR5Y2`), page
"Final" (node `1068:4146`), section "Desktop" (node `1302:11316`). Extracted
via the Figma MCP `get_metadata` tool on 2026-08-31.

## Desktop pages (1512px artboards)

| Page (Figma frame name) | Notes |
|---|---|
| Home | Hero, "What we do" services teaser, "Our Impact"/momentum section, logo section |
| Services | Overview of all six HLL service lines |
| Industries | Industry-sector landing (see "Industry Colours" reference frame in [[design-system]]) |
| Industry | Per-industry detail page |
| Engagement Main | Engagement/case-study listing |
| Engagement Filter Expanded | Same listing with filter UI expanded |
| Engagement Story Template | Template for one engagement's story |
| Case Study Template | Template for one case study |
| Team | Team roster |
| Careers | Careers landing |
| JD | Job description detail page |
| About_01, About_02 | Two About-page variants/sections |
| Contact | Contact page (includes a "How can we help?" / "How did you hear about us?" form pattern) |
| HLL AI, HLL TG, HLL F, HLL O, HLL P, HLL App | The six per-service detail pages (TG = Trust & Governance, F = Foundation, O = Ontology, P = People, App = Application) |

Nav overlays (rendered above these pages, not standalone pages):

| Overlay | Notes |
|---|---|
| Services Menu / Industries Menu / Engagement Menu / About Menu / Contact Menu | The five top-nav mega-menus, one per nav item — see [[user-flows]] for the Services Menu's structure |
| Menu Mobile | Mobile nav menu (two instances found) |

## Mobile pages (402px artboards)

A parallel, narrower (402px) frame exists for most desktop pages: Home,
Hero, Industry, Engagements, Case Study, About, Team, Services, Careers, JD
(x2), Engagement Study, Artifact Expanded View. Content parity with the
desktop version was not verified frame-by-frame — treat mobile frames as
"exists in Figma," not "content-audited here."

## Design-system reference frames (not site pages)

- **Typography styles** — the type scale documentation frame (see [[design-system]]).
- **Industry Colours** — the industry color-token documentation frame, including one real designer annotation (see [[design-system]] and [[known-gaps]]).

## What's NOT specified

- Exact copy for most body sections beyond the fragments pulled during this
  analysis (only a handful of frames' text was read in full — see
  [[known-gaps]] for what layers still read as placeholder/draft text).
- Any content-management, search, or backend behavior — this is a static
  marketing site design; no CMS/data-layer notes were found on the canvas.
- Analytics, SEO, or performance requirements — `Not specified in the
  provided project sources.`
