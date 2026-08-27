// cornerripple-variants.js — the corner-ripple background's CVA variant
// system. Same split as ripple-variants.js / hll-button-variants.js: CVA
// composes only the static structural class name; each variant's 2-3 color
// gradient lives in the VARIANT_GRADIENTS map below, copied verbatim from
// the button's so every design-system component stays keyed by the same
// variant names and colors.
import { cva } from 'class-variance-authority';

export const cornerRippleVariants = cva('corner-ripple', {
  variants: {
    variant: {
      enterprise: 'corner-ripple--enterprise',
      services: 'corner-ripple--services',
      industries: 'corner-ripple--industries',
    },
  },
  defaultVariants: {
    variant: 'enterprise',
  },
});

/*
 * Same gradients as VARIANT_GRADIENTS in hll-button/hll-button-variants.js
 * (and ripple/ripple-variants.js) — kept as a literal copy so this folder
 * stays self-contained and can be copied into another project on its own.
 */
export const VARIANT_GRADIENTS = {
  enterprise: {
    colors: ['#10b981', '#3b82f6'],
    usage: 'Enterprise page/navigation',
  },
  services: {
    colors: ['#ff80ca', '#8786e6', '#007fd2'],
    usage: 'Services page/navigation',
  },
  industries: {
    colors: ['#fa4288', '#ff836b', '#fee253'],
    usage: 'Industries page/navigation',
  },
};

export const CORNER_RIPPLE_VARIANT_NAMES = Object.keys(VARIANT_GRADIENTS);

function hexToRgbFloat(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

// The ripple shader wants a fixed-size (uPalette is a 6-color uniform)
// smooth gradient, while a variant's gradient is only 2-3 hex stops — so
// this resamples the variant's stops into an evenly-spaced 6-color ramp by
// linear interpolation.
export function buildPalette(hexColors, stops = 6) {
  const rgb = hexColors.map(hexToRgbFloat);
  if (rgb.length === 1) return Array(stops).fill(rgb[0]);

  const segments = rgb.length - 1;
  const result = [];
  for (let i = 0; i < stops; i++) {
    const t = (i / (stops - 1)) * segments;
    const seg = Math.min(Math.floor(t), segments - 1);
    const localT = t - seg;
    result.push(lerpColor(rgb[seg], rgb[seg + 1], localT));
  }
  return result;
}

export function resolveVariantPalette(variant, stops = 6) {
  const gradient = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS.enterprise;
  return buildPalette(gradient.colors, stops);
}
