---
name: product-overview
description: What the HLL website project is, who it's for, and what this repo covers vs. does not.
metadata:
  type: reference
---

# Product Overview

## What "HLL" is

HLL ("Hyper Lychee Labs" per the Figma nav logo text) is a company whose
marketing/portfolio website is designed in the Figma file **"HLL Website
Design"** (`4aTBww339Nxg5OsyvRR5Y2`). The site organizes HLL's work into six
service lines, each with its own brand gradient and dedicated page:

- **HLL AI**
- **HLL Trust** (also "HLL Governance & Trust" in nav copy — see [[known-gaps]])
- **HLL Foundation**
- **HLL Ontology**
- **HLL People**
- **HLL Application**

The top nav additionally organizes the site around 5 sections: **Services,
Industries, Engagement, About, Contact** — each with its own brand gradient,
shared by the nav bar, buttons, and background shader effects for visual
consistency across the whole site.

`Not specified in the provided project sources`: HLL's actual line of
business, target customers, or company background beyond what the page/nav
structure implies.

## What this repo is

`HLL UI Demo` is the **design-system component library** for that website —
a Vite + React app whose real deliverable is a set of copy-paste-able,
self-contained component folders (`src/components/*`), each implementing one
recurring visual element of the Figma design as a production-ready React
component. `src/App.jsx` is a scratch/demo file for exercising these
components' variants during development — it is commented out almost
entirely and is not a page of the actual site.

**What exists here:** reusable primitives — a button, an outline button, a
full-bleed background shader effect, a bottom-anchored shader crop, two
ripple effects (p5.js/WebGL), a tag/chip, two gradient text-reveal
animations, and one bespoke scroll-driven hero section ("Our Promise").

**What does not exist here:** assembled page-level React components for
Home, Services, Industries, Engagement, About, Careers, Contact, or any
per-service page. Those exist only as Figma frames today. See
[[figma-to-code]] and [[known-gaps]] for the exact gap list.

## Intended audience for this skill's deliverables

`Not specified in the provided project sources` beyond what's inferable:
component folders are written for **developers integrating this library
into the real website codebase** (see each README's "Installation / Setup"
and "Keeping this in sync with Studio" sections) — treat that as the
default audience for documentation/user-guide requests unless told
otherwise.
