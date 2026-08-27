# HLL Button

A single, reusable button component driven by [CVA](https://cva.style/docs)
(`class-variance-authority`). One implementation renders every page's button
— a `variant` prop selects a predefined 2–3 color gradient; shape, blur,
glow, hover/click behavior, and typography are shared and identical across
every variant.

Visually and behaviorally, this is the exact "HLL Button" preset from LightFX
Studio: a soft rounded-rect shader effect (not a CSS gradient) that's
invisible at rest but for its label, and blooms into a blurred colored glow
on hover, with a `click`/`pointerdown` pulse ring.

## Installation / Setup

Copy this whole folder — `src/components/hll-button/` — into your project.
It's self-contained: every file it needs is inside it.

```text
components/
└── hll-button/
    ├── HLLButton.jsx            the component
    ├── hll-button-variants.js   CVA class composition + per-variant gradients
    ├── hll-button-definition.js shared shape/effects/interaction/typography
    ├── hll-button-runtime.js    the LightFX shader engine
    ├── hll-button.css           reset, focus/disabled/loading states
    ├── index.js                 barrel export
    └── README.md                this file
```

**Dependencies** — install these two in the host project if it doesn't
already have them:

```bash
npm install three class-variance-authority
```

`react` / `react-dom` are peer dependencies (any project already has them).
Nothing else is required — no Tailwind config, no Studio import, no build
plugin.

## Basic Usage

```tsx
import { HLLButton } from "./components/hll-button";

export default function Example() {
  return <HLLButton variant="services">Services</HLLButton>;
}
```

The label is just `children`, like any other button — there's no separate
"text" prop.

## Variants

Each variant is a predefined 2–3 color gradient; you never pass colors
yourself.

| Variant | Usage | Gradient |
| --- | --- | --- |
| `services` | Services menu item | #F7A567 → #E05A35 → #EB3B3E |
| `industries` | Industries menu item | #0352B2 → #037A9F → #6460D5 |
| `engagement` | Engagement menu item | #F9B535 → #FF9126 → #FF6302 |
| `about` | About menu item | #9AB4D3 → #A28DD7 → #AD7ECF |
| `contact` | Contact menu item | #ABBFFF → #2BB4EB → #076EB8 |
| `hll-ai` | hll-ai service | #3773FF → #BCA6D6 |
| `hll-trust` | hll-trust service | #129562 → #7CBAAA |
| `hll-foundation` | hll-foundation service | #FF5A1E → #CC8B93 |
| `hll-ontology` | hll-ontology service | #7455FF → #FFB26A |
| `hll-people` | hll-people service | #FF9042 → #FFEEC7 |
| `hll-application` | hll-application service | #FF1F1F → #72AAFF |

This table is generated from `VARIANT_GRADIENTS` in `hll-button-variants.js`
— the single source of truth for variant data — via
`node scripts/print-hll-button-variants.mjs` (dev-only, not part of this
folder). Re-run it after adding a variant instead of hand-editing this table.

`services`/`industries`/`engagement`/`about`/`contact` are the top nav
menu's own 3-stop gradients (the design spec), shared verbatim with
`shader-variants.js` and `bottom-shader-variants.js` so the button and both
shader effects always match for the same menu item. The `hll-*` variants are
one fixed 2-color gradient per service, shared the same way across every
component for that service.

```tsx
<HLLButton variant="services">Services</HLLButton>
<HLLButton variant="industries">Industries</HLLButton>
<HLLButton variant="engagement">Engagement</HLLButton>
<HLLButton variant="about">About</HLLButton>
<HLLButton variant="contact">Contact</HLLButton>
```

## Interaction States

| State | How it works |
| --- | --- |
| Default | `params.base` — invisible fill, muted gray label. |
| Hover | Handled entirely inside the shader engine via its own `pointerenter`/`pointerleave`/`pointermove` listeners (`hll-button-runtime.js`) — **not** React state, so hovering never triggers a re-render. Blurs into the variant's gradient glow; the label crossfades to white via a plain CSS `:hover` rule. |
| Active (click) | A `pointerdown` listener starts an expanding ring pulse — also inside the shader engine, not React state. |
| Focus | A `:focus-visible` outline (keyboard navigation), defined in `hll-button.css`. The canvas itself doesn't respond to focus. |
| Disabled | Pass `disabled`. Sets the native `disabled` attribute (or `aria-disabled` on non-`<button>` tags), fades opacity, and sets `pointer-events: none` so the canvas never sees hover/click. |
| Loading | Pass `isLoading`. Same inert behavior as disabled, plus a small CSS spinner appended after the label and `aria-busy="true"`. |

```tsx
<HLLButton variant="services" disabled>Services</HLLButton>
<HLLButton variant="services" isLoading>Services</HLLButton>
```

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `"services" \| "industries" \| "engagement" \| "about" \| "contact" \| "hll-ai" \| "hll-trust" \| "hll-foundation" \| "hll-ontology" \| "hll-people" \| "hll-application"` | `"services"` | Selects the predefined gradient. |
| `children` | `ReactNode` | — | The button's label. |
| `as` | `ElementType` | `"button"` | Render as a different tag, e.g. `as="a"`. |
| `gradient` | `string[]` (2–3 hex) | — | One-off override of the variant's colors. |
| `direction` | `number` (degrees) | variant's own | Overrides the gradient angle. |
| `radius` | `number` (0–0.5) | variant's own | Overrides the shape's corner radius. |
| `glow` | `number` (0–3) | variant's own | Overrides the hover fill's blur/glow amount. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Scales the button's box. |
| `animated` | `boolean` | `true` | Set `false` to disable the hover transition. |
| `disabled` | `boolean` | `false` | Native disabled state; blocks pointer events. |
| `isLoading` | `boolean` | `false` | Inert state plus a small spinner. |
| `className`, `style` | — | — | Merged onto the host element — use for layout, not visual overrides. |

## Customization

**Safe to pass:**

- `variant` — `"services" | "industries" | "engagement" | "about" | "contact"` (or any per-service/other variant you add).
- `as` — render as a different tag (e.g. `as="a"` for a link that looks like this button). Defaults to `"button"`.
- `size`, `disabled`, `isLoading`.
- `className`, `style` — merged onto the host element; use these for layout (margins, grid placement), not for visual overrides.
- Any other native prop for the tag you chose (`href`, `onClick`, `type`, `aria-*`, ...) — spread straight through.

**Not meant to be overridden per-usage:**

- Colors/gradients — go through a `variant` for everyday use. `gradient`/`direction`/`radius`/`glow` exist as explicit one-off overrides (they power Studio's Docs playground, where developers experiment before deciding whether a configuration deserves a real variant) — not a substitute for adding one. If a custom configuration you land on matches an existing variant exactly, use that variant instead.
- Shape, cursor-lens tuning, typography — these live in `hll-button-definition.js` and are shared by every variant on purpose; there's no per-usage prop for them.

```tsx
<HLLButton
  variant="services"
  gradient={["#00B894", "#00C6FF", "#4D7CFE"]}
  direction={45}
>
  Services
</HLLButton>
```

## Adding a New Variant

Add one entry to `VARIANT_GRADIENTS` in `hll-button-variants.js` — nothing
else needs a new component:

```js
export const VARIANT_GRADIENTS = {
  services: { colors: ['#F7A567', '#E05A35', '#EB3B3E'], usage: 'Services menu item' },
  industries: { colors: ['#0352B2', '#037A9F', '#6460D5'], usage: 'Industries menu item' },
  engagement: { colors: ['#F9B535', '#FF9126', '#FF6302'], usage: 'Engagement menu item' },
  about: { colors: ['#9AB4D3', '#A28DD7', '#AD7ECF'], usage: 'About menu item' },
  contact: { colors: ['#ABBFFF', '#2BB4EB', '#076EB8'], usage: 'Contact menu item' },
  pricing: { colors: ['#a78bfa', '#7dd3fc'], usage: 'Pricing menu item' }, // new
};
```

Also add its class key to `hllButtonVariants`'s `variant` map (a CSS hook,
not what drives the color):

```js
variant: {
  services: 'hll-button--services',
  industries: 'hll-button--industries',
  engagement: 'hll-button--engagement',
  about: 'hll-button--about',
  contact: 'hll-button--contact',
  pricing: 'hll-button--pricing', // new
},
```

That's it — `<HLLButton variant="pricing">Pricing</HLLButton>` now works,
using the same shape/blur/glow/hover/typography as every other variant.
Never create a new button component for a new page; a new page is a new
gradient entry, not new code.

## Exported Component

LightFX Studio's own Export panel (React/Next.js) downloads a `.zip`
containing just `<Name>/{<Name>.jsx, hll-button-runtime.js →
lightfx-runtime.js, definition.js, index.js}` for whichever single preset is
currently selected there — no `package.json`, vite config, `index.html`,
`src/main.*`, or other Studio/Demo files. That's the right tool for grabbing
one preset as one component.

This folder is the same idea taken one level further: it's the multi-variant
component built from that same preset data (`hll-button-definition.js` is
copied verbatim from Studio's Export panel, the same way). To move it into
another project, copy the whole `hll-button/` folder as-is — every file
inside it is required, nothing inside it references anything outside it.

## Keeping this in sync with Studio

Studio has its own copy of this component
(`HLL UI Studio/src/lightfx/hll-button/`), used live by Studio's interactive
**Docs** page (top nav → Docs → Playground) — the real component, wired to
Studio's live "HLL Button" preset data, with controls for every prop above
and a generated-code panel. That page is the best place to explore the API
hands-on.

The two copies are kept identical **by hand, not by shared code** — Studio
and this exported package are separate projects/repos, and an exported
component must work fully offline (no Firebase/Studio access), so they
can't literally share a module. The convention:

- `hll-button-runtime.js`, `HLLButton.jsx`, `hll-button-variants.js`'s
  `cva()`/CSS-class shape, and `hll-button.css` should stay byte-for-byte
  identical between the two copies (module-system differences aside —
  Studio's imports the shared `../runtime.js` instead of bundling its own
  copy, since it's already right there).
- `hll-button-variants.js`'s `VARIANT_GRADIENTS` entries (`services`,
  `industries`, `engagement`, `about`, `contact`, and any new ones) should
  match too.
- `hll-button-definition.js` here is a frozen snapshot of Studio's live
  preset — re-copy it from Studio's Export panel whenever that preset
  changes (see `hll-button-definition.js`'s own header comment).

If you change the component's behavior in one place, change it in the
other.
