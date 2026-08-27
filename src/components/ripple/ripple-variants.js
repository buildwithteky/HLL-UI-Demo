// ripple-variants.js — the ripple background's CVA variant system.
//
// Same split as the HLL Button (see hll-button-variants.js): CVA composes
// only the static structural class name (a host-element hook) — it never
// computes anything at runtime and never sees a color. The ripple's colors
// are a WebGL shader uniform (6-stop palette), not a CSS background — CVA
// has no vocabulary for that, so each variant's gradient lives in the same
// VARIANT_GRADIENTS map used by the button, copied verbatim so every
// component in the design system stays keyed by the same variant names and
// colors.
//
// To add a new page variant, add one entry to VARIANT_GRADIENTS (and,
// optionally, a matching class below) — same recipe as the button's README.
import { cva } from 'class-variance-authority';

export const rippleVariants = cva('ripple', {
  variants: {
    variant: {
      'hll-application': 'ripple--hll-application',
      'hll-foundation': 'ripple--hll-foundation',
      'hll-trust-and-governance': 'ripple--hll-trust-and-governance',
      'hll-people-and-policy': 'ripple--hll-people-and-policy',
      'hll-ontology': 'ripple--hll-ontology',
      'hll-ai': 'ripple--hll-ai',
    },
  },
  defaultVariants: {
    variant: 'hll-application',
  },
});

export const VARIANT_GRADIENTS = {
  // Each HLL service page ships its own 6-stop palette — listed as all 6
  // stops rather than 2-3 so buildPalette passes them through unchanged
  // instead of resampling.
  'hll-application': {
    colors: ['#ddeac2', '#d8f3ee', '#9fade0', '#c7abe2', '#c7436a', '#322527'],
    usage: 'HLL application page',
  },
  'hll-foundation': {
    colors: ['#6fa5c3', '#b39cd8', '#bb3e91', '#2d1515', '#752424', '#981b1b'],
    usage: 'HLL Foundation page',
  },
  'hll-trust-and-governance': {
    colors: ['#cff7f0', '#9ae46c', '#93ee68', '#8fde2b', '#c57226', '#642626'],
    usage: 'HLL Trust and Governance page',
  },
  'hll-people-and-policy': {
    colors: ['#eb1414', '#f45d5d', '#ea3e3e', '#cc2424', '#e34f4f', '#6d1d1d'],
    usage: 'HLL People and Policy page',
  },
  'hll-ontology': {
    colors: ['#d37fe1', '#a67ecd', '#b591d9', '#c4a4e5', '#ffffff', '#ffffff'],
    usage: 'HLL Ontology page',
  },
  'hll-ai': {
    colors: ['#ad7cdf', '#adb7eb', '#d3eee3', '#e2f4f8', '#fbfefe', '#fcfefb'],
    usage: 'HLL AI page',
  },
};

export const RIPPLE_VARIANT_NAMES = Object.keys(VARIANT_GRADIENTS);

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
// linear interpolation. Every variant (2 or 3 stops) resolves to the same
// shape of data the shader expects.
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
  const gradient = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS['hll-application'];
  return buildPalette(gradient.colors, stops);
}
