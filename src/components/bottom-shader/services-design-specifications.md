# Services Page – Design Specifications

Source: `Services.png` (4536 × 24588 px).

## 0. How to read this document

**Scale.** The PNG is a **3× export of a 1512 px-wide desktop frame**. The CSS-pixel page is **1512 × 8196 px** (4536/3, 24588/3). Every value below is in CSS px at 1×, i.e. image px ÷ 3.

**Confidence tags**
- **[M]** Measured. Read from the 1× resampled image, ±1–2 px. Colors were sampled from pixels.
- **[E]** Estimated. Typography sizes, weights, letter-spacing and radii are inferred from glyph metrics and are not directly readable.
- **[A]** Assumption.

**Limits of this analysis**
- The image is a single static desktop frame. Nothing is known about hover, active or focus states, animation, or other breakpoints.
- Fonts were not embedded in the PNG. The typeface is a neo-grotesque (similar to *Neue Haas Grotesk Display / Aeonik / Inter Display*) and a monospace for labels. Both are [A].
- Absolute Y values are page coordinates in 1× px from the top of the page.
- The page has a **12-column-like structure** that was not verified. Use the pixel columns in §2 instead.

> **Update (validated against project docs):** the project's Figma typography reference (`.claude/skills/hll-website/references/design-system.md`) documents Aeonik / Sometype Mono, H1 64/100 %, Paragraph 20/25, Paragraph Large 24/30, Title 36 and Section Heading 12 px with 25 % tracking. Where the type table below estimates 18 px (stat/engagement/author text) or 32 px (engagement titles), **use 20 px and 36 px**. Measured line pitches (25, 30, 42) are unaffected. The sibling pages and cross-page comparison are in `/design-specs/design-system-specifications.md`.

---

## 1. Design tokens

### 1.1 Colors

| Token | Value | Source | Use |
|---|---|---|---|
| `--bg` | `#fafafa` | [M] | Page bg, cards, tags, chips |
| `--ink` | `#000000` / ≈`#111` | [M] black on body copy; headings look slightly softer [E] | Primary text |
| `--ink-soft` | `#1a1a1a` | [M] (CTA bg) | Dark section bg |
| `--muted-nav` | `#818181` | [M] | Top nav links |
| `--muted-text` | `#888888` | [M] | Sub-service list, footer sub-labels |
| `--muted-role` | `#858585` | [M] | Author role |
| `--muted-crumb` | `#999999` | [M] | Breadcrumb "SERVICES" |
| `--accent` | `#ff3e27` (≈ `#ff3c24`) | [M] | Breadcrumb current, counters `01/04`, active sidebar item |
| `--hairline` | `#a1a1a1` | [M] | 1 px rules |
| `--btn-bg` | `#e6e6e6` | [M] | Dropdown, "Write to us", Email/LinkedIn |
| `--placeholder` | `#d9d9d9` | [M] | Image placeholder |
| `--brand-blue` | `#24477f` | [M] | McKinsey card |
| `--brand-orange` | `#f27620` | [M] | KTM card |
| `--tab-border` | `#fb924a` → `#fec864` → `#fe7159` | [M] | Active tab gradient border (orange → yellow → coral) |
| Default tab / chip border | ≈ `#e0e0e0`, 1 px | [E] | Inactive tabs |
| Hero gradient | TL `#ff3e00`, BL `#18ccb9`, BR `#0a8fe8` | [M] | Shader gradient (orange → teal/cyan → blue) |
| Related Services bg | `#fafafa` (top) → `#d9d9d9` (mid) → `#b3b3b3` (bottom) | [M] | Vertical linear gradient |

### 1.2 Typography families
- **Sans**: neo-grotesque, light weight for display, regular for body. [A]
- **Mono**: used for `SERVICES / HLL FOUNDATION` breadcrumbs, `01/04` counters, left sidebar nav. [A]
- **Serif**: only inside the McKinsey logo graphic.
- Light weight (≈300) is used for large headings (H1, section titles, stat numbers, CTA). Regular (≈400) is used for everything else. [E]

### 1.3 Type scale (all [E] unless noted)

| Role | Size | Line-height | Letter-spacing | Weight | Case |
|---|---|---|---|---|---|
| Top nav link | 11–12 | n/a | ≈ +0.2em (very wide) | 400 | UPPERCASE |
| Logo wordmark "Hyper Lychee Labs" | 18 | – | 0 | 400 | Title |
| Page title "HLL Foundation" | 36 | – | -0.01em | 500 | Title |
| H1 "Data your business can finally trust" | 64 | ≈ 1.1 | -0.02em | 300 | Sentence |
| Tab / tag / chip / button label | 12 | – | ≈ +0.2em | 400 | UPPERCASE |
| Breadcrumb | 12 | – | +0.02em | 400 mono | UPPERCASE |
| Section title (Capabilities, Outcome, Engagement, Expert Voice) | 48 | ≈ 1.1 | -0.01em | 300 | Title |
| Capability title | 36 | 42 [M: 2-line pitch] | -0.01em | 400 | Title |
| Capability body | 20 | **25** [M] | 0 | 400 | Sentence |
| Sub-service list item | 15 | pitch **28** [M] | 0 | 400 | Sentence |
| Sidebar nav item | 12 | pitch **24** [M] | +0.04em | 400 mono | UPPERCASE |
| Stat number | 96 | ≈ 1 | -0.02em | 300 | – |
| Stat unit "%" | ≈ 48 | – | – | 300 | – |
| Stat body | 18 | **25** [M] | 0 | 400 | Sentence |
| Engagement card title | 32 | – | 0 | 400 | Title |
| Engagement/industry description | 18 | **25** [M] | 0 | 400 | Sentence |
| Quote | 36 | **42** [M] | -0.01em | 400 | Sentence |
| Author name / role | 18 | 25 | 0 | 400 | Title |
| "Related Services" | 36 | – | 0 | 400 | Title |
| CTA "Let's start a conversation" | 64 | – | -0.02em | 300 | Sentence |
| Footer column label | 12 | pitch **28** [M] | +0.2em | 400 | UPPERCASE |
| Footer wordmark | 28 | – | 0 | 300 | Title |

Measured anchors: text line pitches (25, 28, 24, 42) are measured. Font sizes are derived from x-height/cap height and are ±2 px.

### 1.4 Spacing & shape

| Token | Value |
|---|---|
| Page gutter (side margin) | **30 px** [M] (hero, nav, titles, footer logo all start at x = 30; right edge 1482) |
| Content width | **1452 px** (30 → 1482) [M] |
| Standard gap (tabs, chips, buttons) | **8 px** [M] |
| Standard control height | **36 px** (chips, buttons, tags) [M]; tabs 38 px [M] |
| Card/stat gap | **10 px** [M] |
| Engagement card gap | **14 px** [M] |
| Radius – hero & window | ≈ 8 px [E] |
| Radius – cards/stat/images | ≈ 8 px [E] |
| Radius – chips/buttons/tags | ≈ 3–4 px [E] |
| Hairline | 1 px solid `#a1a1a1` |
| Shadows | **None visible** [M]. Elevation comes only from color/contrast. |

---

## 2. Overall layout

- Viewport/frame: **1512 px**, single column, full-bleed sections stacked vertically. No max-width container; sections use the 30 px gutter.
- Background: `#fafafa` throughout except gradient bands (Hero frame, Outcome, Related Services) and the dark CTA.
- Alignment: left-aligned content on x = 30; a secondary **content column starting at x = 511** (Capabilities rule/title, cards at 509); Related Services is centered; CTA content is inset to x = 171.

### Section map (page Y, 1× px)

| # | Section | Y start | Y end | Height |
|---|---|---|---|---|
| 1 | Top nav + page title | 0 | ~140 | ~140 [E] |
| 2 | Hero (H1 + tabs + shader frame) | ~400 | 1578 | – |
| 3 | Capabilities | ~1741 (breadcrumb) | 3497 | – |
| 4 | Outcome (gradient band) | **3497** | **4479** | **982** [M] |
| 5 | Engagement | ~4640 | ~5900 | – |
| – | Hairline divider | 6001 | 6001 | 1 |
| 6 | Expert Voice | ~6093 | ~6700 | – |
| 7 | Related Services (gradient) | ~6700 | 7214 | ~514 |
| 8 | CTA (dark) | **7214** | **7451** | **237** [M] |
| 9 | Footer | 7451 | 8196 | 745 |

---

## 3. Section details

### 3.1 Top nav (y 0–60)
- Logo mark: red hourglass glyph, x 30–54, y ≈ 22–52 [M]. Wordmark "Hyper Lychee Labs" starts at x = 65, vertically centered at y = 36 [M].
- Links right-aligned, all centered at y = 37: SERVICES (x 916–991), INDUSTRIES (1033–1125), ENGAGEMENT (1167–1273), ABOUT (1315–1367), CONTACT (1409–1482) [M].
- Gap between links ≈ **42 px** [M]. Last link ends at the right gutter (1482).
- Color `#818181`, uppercase, very wide tracking.

### 3.2 Page title row
- Icon tile: **x 30–66, y 84–120 (36 × 36)**, orange→pink gradient, radius ≈ 4, with a white snowflake glyph [M].
- Title "HLL Foundation": x = 81 (**15 px gap** from icon) [M], vertically centered at y ≈ 102.

### 3.3 Hero heading + tabs
- Large empty space between title row (ends y 120) and H1: **~300 px** [M, H1 cap top ≈ 430].
- H1: x = 30, spans x 30–996 (966 px wide) on one line, baseline ≈ y 478 [M]. Glyph cap height ≈ 48 px → 64 px font [E].
- Tabs row: **y 525–563 (38 px high)**, 47 px below H1 baseline [M].
  - Tab 1 DATA ENGINEERING x 30–225 (195 w) – active, gradient border (orange → yellow).
  - Tab 2 DATA ANALYTICS x 233–409 (176 w).
  - Tab 3 DATA AUDIT x 417–553 (136 w).
  - Tab 4 DATA INFRASTRUCTURE ASSESSMENT x 561–899 (338 w).
  - Gap **8 px**; horizontal padding ≈ **21–22 px** (text starts 21 px from left edge) [M]; bg `#fafafa`, 1 px border; text `#000` 12 px uppercase, tracking ≈ 0.2em.
  - Active tab: 1 px gradient border `#fb924a → #fec864 → #fe7159`.

### 3.4 Hero shader frame
- Outer: **x 30–1482 (1452 w), y 596–1578 (982 h)** [M]; radius ≈ 8 [E].
- Gradient: orange-red at top (`#ff3e00`), transitioning down to teal (`#18ccb9`, bottom-left) and blue (`#0a8fe8`, bottom-right). Soft curved arc "light-streak" overlays (shader).
- Gap tabs → frame: **33 px** (563 → 596) [M].
- Inner "demo window": **x 125–1387 (1262 w), y 732–1442 (710 h)**; fill `#fafafa`; radius ≈ 8 [M].
  - Inset from frame: left **95**, right **95**, top **136**, bottom **136** [M] (symmetrical).
- Dropdown button "HLL FOUNDATION ⌄": x 656–856 (200 w), y 910–946 (36 h), centered horizontally at x = 756 [M]; fill `#e6e6e6`; radius ≈ 4; label 12 px uppercase, caret at x ≈ 830.
  - 178 px below window top [M].
- "DEMO WINDOW" label: centered x ≈ 753, y ≈ 1086 (vertical center of window) [M]; 12 px uppercase tracking ≈ 0.2em; black.

### 3.5 Capabilities
- Breadcrumb: y = 1741, x = 30. "SERVICES" `#999` + 14 px gap + "HLL FOUNDATION" `#ff3e27` (x 100–197); mono 12 px [M].
- Title "Capabilities": x = 30, spans to x ≈ 348; vertical center ≈ y 1790 [M] (≈ 48–56 px font [E]).
- **Left sticky sidebar** (x 22–240): items at y = 1918, 1942, 1966, 1990 (**pitch 24**) [M]; text x = 31; active item `#ff3c24` preceded by a 4 × 4 black square at x = 22; inactive `#8b8b8b`; mono 12 px uppercase.
- **Rows (4 total)**, pitch **376 px** [M]: rule y = 1917, 2293, 2669, 3045.
  - Counter "01/04": x 466–501, right-aligned to 501, y centered on the rule; mono 11–12 px, `#ff3e27`.
  - Rule: **x 511–1377 (866 w), 1 px `#a1a1a1`**, begins 10 px after the counter.
  - Title: x = 511; first-line center ≈ rule + 58 (y 1975 for row 1); 2-line titles have line pitch 42 [M] (Data Infrastructure Assessment wraps at ≈ 812 px).
  - Title column ≈ 500 px wide (511–1011); body column starts at **x = 1011**, width **366** (1011–1377) [M].
  - Body: first line center ≈ rule + 50 (y 1967); 5 lines × 25 px.
  - Sub-services: first item center ≈ rule + 200; **pitch 28**; bullet "•" at x = 1011–1015 (`#888`), text starts x = 1024 (≈ 13 px indent); 15 px, `#888`.
  - Space after the last list item to next rule: ≈ 92 px; last row's bottom → Outcome band: ≈ 150 px (3497 − 3345) [M].

### 3.6 Outcome (gradient band)
- Band: full-bleed, **y 3497–4479 (982 h)**, same shader gradient as hero (orange top → teal → blue bottom); no radius, no side margins.
- Breadcrumb at y 3588 (white text variant: "SERVICES" lighter, "HLL FOUNDATION" white). Title "Outcome" white, x = 30, y center ≈ 3645, light weight.
- **Cards (4 columns), top y = 3763**: x 10–376, 386–751, 761–1127, 1137–1502.
  - Width **≈ 366 each**, gap **10 px**; side margin **10 px** (not 30!) [M].
  - Heights: card 1 = 419 (163–582 in crop), card 2 = 266, card 3 = 544, card 4 = 423 → cards are top-aligned, heights are content-driven.
  - Fill `#fafafa`; radius ≈ 8; no shadow.
  - Padding ≈ **20 px** left/right (text x = card x + 20) [M]; top padding ≈ 20 (number cap top at +34 incl. line box).
  - Stat number: 96 px light; top of digits ≈ +34, baseline ≈ +116 from card top; "%" smaller (≈ 48 px), baseline-aligned.
  - Gap number → body: ≈ **48 px** (baseline 116 → first text line center 175) [M].
  - Body: 18 px / 25; card 1 = 8 lines, card 2 = 3 lines, card 3 = 5 lines, card 4 = 8 lines; bottom padding ≈ 30 (last line center → card bottom 43) [M].
  - Card 3 placeholder image: x 784–1104 (320 w), y 311–545 in crop (**234 h**), `#d9d9d9`, radius ≈ 4 [M]; inset 23 px from card edges; text 30 px below.
- Band bottom padding: the tallest card (card 3) ends at y 4307 and the band ends at y 4479, so there is **172 px** of gradient below it [M].

### 3.7 Engagement
- Breadcrumb y = 4640; title "Engagement" x = 30, center y ≈ 4697; intro paragraph x = 28, 3 lines at y 4771, 4796, 4821 (18 px/25), max width ≈ 360 px [M].
- Cards start x = **509**, y = **4910** [M] (≈ 90 px below paragraph).
  - Row 1: McKinsey x 509–999 (**490 w**), KTM x 1013–1503 (490 w); **gap 14**; right edge 1503 → note: ≈ 9 px *past* the 1482 gutter [M].
  - Image: **490 × 308**, radius ≈ 8; McKinsey `#24477f`, KTM `#f27620`; logo centered.
  - Tag "CLIENT WORK": x 517–684 (167 w), y 5174–5210 (36 h), inset **8 px** from image left/bottom; `#fafafa`; 12 px uppercase.
  - Arrow button (McKinsey only): 36 × 36 at x 955–991, y 4918–4954 (inset 8 px top/right), white with ↗ glyph, radius ≈ 4.
  - Title: ≈ **30 px below image bottom** center (y ≈ 5248), 32 px; left x = card x.
  - Description: 3 lines, y 5293/5318/5343 (18/25); width ≈ 440 (wraps).
  - Gap image → title ≈ 12 px, title → desc ≈ 20 px [E].
- Row 2: Banking card x 509–999, y 5403–5711 (490 × 308); tag "INDUSTRY" x 517–636 (119 w) 36 h; title center y 5741; desc y 5786–5836. **Row gap**: desc row 1 bottom (≈ 5355) → row 2 image top (5403) ≈ **48 px** [M].
- Banking image: pastel multi-color aerial-city photo (raster).
- Divider: y = **6001**, x 30–1482, 1 px `#a1a1a1`; ≈ 165 px below Banking text [M].

### 3.8 Expert Voice
- Breadcrumb y 6093; title "Expert Voice" x 30, center ≈ 6150 [M].
- Counter "01/03" (red mono) x = 30, y = 6277; prev/next arrows "<  >" at y 6291 beneath it [M].
- Portrait: **x 76–376 (300 w), y 6270–6670 (400 h)**, radius ≈ 4 [M].
- Logo card: **x 386–501 (115 w), y 6270–6385 (115 h)**, `#24477f`, McKinsey wordmark (serif, white, ≈ 11 px); 10 px gap from portrait [M].
- Quote: x = **908**, first line center y ≈ 6288, line pitch 42; 5 lines; right edge ≈ 1462; 36 px / 42 [M]. Quote max width ≈ 554.
- Author: name center y 6624 (18 px, black), role y 6649 (`#858585`); 25 px pitch [M]; name sits 8 px below portrait's bottom-aligned… (aligned near portrait bottom 6670) [E].

### 3.9 Related Services
- Background gradient from `#fafafa` (≈ y 6700) to `#b3b3b3` (y 7200), progressively darker, rendered into the CTA's top edge.
- Title "Related Services": centered at x 756, y 6927, 36 px.
- Chips row 1 (y 6983–7019, **36 h**): HLL MOMENTUM x 467–634 (167), HLL GOVERNANCE & TRUST 642–899 (257), HLL KINETIC 907–1045 (138).
- Chips row 2 (y 7027–7063): HLL MOTION 603–740 (137), HLL ONTOLOGY 748–909 (161).
- Gap: **8 px horizontal, 8 px vertical** [M]. Rows centered. Chip fill `#fafafa`, radius ≈ 3–4, padding ≈ **21 px** horizontal; 12 px uppercase, tracking ≈ 0.2em.
- Title → chips: ≈ 56 px (center to chip top 43 + half height) [M]. Chips bottom 7063 → CTA 7214: **151 px** [M].

### 3.10 CTA band
- **y 7214–7451 (237 h)**, full-bleed `#1a1a1a`.
- Heading "Let's start a conversation" white, light weight, ≈ 64 px; x = **171** (141 px inset from gutter), spans 171–861; center y 7335 [M].
- Button "WRITE TO US": **x 1198–1342 (144 w), y 7319–7355 (36 h)**, `#e6e6e6`, radius ≈ 4; right edge 1342 = 170 px from right edge, mirroring the left inset 171 [M]. Label black 12 px uppercase.

### 3.11 Footer (bg `#fafafa`, y 7451–8196)
- Brand: logo mark **x 30–78 (48 w), y 7507–7571 (≈ 64 h)** grayscale hourglass; wordmark "Hyper Lychee Labs" x = 98 (20 px gap), center y 7537, 28 px, `#4d4d4d`-ish light [M/E].
- Link columns start at **x = 636, 896, 1176** (gutters 260 and 280) [M]. All links 12 px uppercase, tracking ≈ 0.2em; **line pitch 28 px** [M].
  - Column 1: HOME (y 7548); group label SERVICES (`#888`, y 7614); items HLL KINETIC … HLL FOUNDATION at y 7642, 7670, 7698, 7726, 7754, 7782; ENGAGEMENT y 8052.
  - Column 2: ABOUT (7548); INDUSTRY (7614, muted) → FINANCIAL SERVICES (7642, muted) → BANKING/INSURANCE/OTHER FINANCIAL SERVICES (7670–7726); COMMERCE & CONSUMER (7782 muted) → 3 items (7810–7866); HEALTH & LIFE SCIENCES (7922 muted) → HEALTHCARE, PHARMACEUTICALS (7950, 7978); CONTACT (8052).
  - Column 3: TEAM (7548); BUILT ENVIRONMENT & INDUSTRY (7642 muted) → 3 items; GOVERNMENT & PUBLIC INSTITUTIONS (7782 muted) → 3 items; PROFESSIONAL SERVICES (7922 muted) → CONSULTING FIRMS (7950).
  - Group spacing: one blank 28 px row between groups (i.e. 56 px label-to-label across a group gap incl. its items) [M]. Top-level label → first group: 66 px (7548 → 7614) [M].
  - Primary links: black; group labels: `#888`.
- Bottom bar: copyright "© HYPER LYCHEE LABS 2026" x = 24, center y 8165, 12 px uppercase, tracking ≈ 0.2em; buttons EMAIL **x 1273–1361 (88 w)** and LINKEDIN **x 1369–1482 (113 w)**, y 8141–8177 (36 h), gap **8**, fill `#e6e6e6`, radius ≈ 4; right edge flush with the gutter (1482); page ends 19 px below buttons (8196) [M].

---

## 4. Component specs (reusable)

**Chip / Tag / Button (uppercase label)**
- Height 36 (tab 38), padding-x ≈ 21, radius 3–4, font 12/1 uppercase, letter-spacing ≈ 0.2em, no shadow.
- Variants: *chip* `bg #fafafa` + 1 px light border; *solid* `bg #e6e6e6` (CTA, footer, dropdown); *tag on image* `bg #fafafa`, inset 8 px.
- Active tab: gradient border `#fb924a → #fec864 → #fe7159`.

**Row with rule (Capabilities)**: counter (mono, red, 35 w, right-aligned) + 10 px + 866 px 1 px rule; below, 2-col grid: 500 px title + 366 px body.

**Stat card**: 366 w, padding ≈ 20, radius 8, bg `#fafafa`, number 96 px light → 48 px gap → 18/25 body.

**Media card**: 490 w, image 490 × 308 (radius 8), title 32 px, description 18/25; overlay tag 8 px inset.

---

## 5. Responsive behavior

Only the 1512 px desktop layout is visible. Not identifiable from the image: breakpoints, wrapping of the 4-column stat row, the 2-column engagement grid, or nav collapse. Behaviors **inferred** for implementation [A]:
- Hero frame, nav and footer use `padding-inline: 30px` with width 100%.
- Stat row: `grid-template-columns: repeat(4, 1fr); gap: 10px; padding-inline: 10px; align-items: start`.
- Engagement grid: a left-offset 2-col grid starting at x = 509 (≈ 33.7 % of 1512) with `gap: 14px`, col width 490.
- Capabilities grid: 511 px offset, 866 px max width, inner split 500 / 366.

---

## 6. Notes on discrepancies / anomalies
- Stat row side margin is **10 px**, but the rest of the page uses **30 px**.
- Engagement cards' right edge is at x = 1503, **beyond** the 1482 gutter; this looks like a layout quirk in the demo, so keep it if pixel-matching.
- Footer lists "HLL FOUNDATION" twice (item 4 and 6) – content placeholder.
- Copyright text begins at x = 24, not 30 (the "©" glyph sits slightly left) [M].
- Sidebar active marker sits at x = 22, outside the 30 px gutter [M].
- The hero shader and the Outcome band use the same gradient/shader, with a 982 px height in both [M].
