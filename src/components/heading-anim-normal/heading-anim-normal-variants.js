// heading-anim-normal-variants.js — the "normal" speed gradient-reveal
// heading's CVA variant system (duration 600, the white -> color -> black
// "sweep" look — see GradientRevealTextNormal.jsx). heading-anim/ already
// covers the "slow" speed (duration 1200, the multi-band "leak" sweep), so
// this folder only needs to carry this one. Same split as
// heading-anim-variants.js: CVA composes only the static structural class
// name, the per-service 2-color gradient lives in VARIANT_GRADIENTS below —
// copied verbatim from hll-button-variants.js so every design-system
// component stays keyed by the same variant names and colors.
import { cva } from 'class-variance-authority';

export const gradientRevealTextNormalVariants = cva('gradient-reveal-text-normal', {
  variants: {
    variant: {
      'hll-ai': 'gradient-reveal-text-normal--hll-ai',
      'hll-trust': 'gradient-reveal-text-normal--hll-trust',
      'hll-foundation': 'gradient-reveal-text-normal--hll-foundation',
      'hll-ontology': 'gradient-reveal-text-normal--hll-ontology',
      'hll-people': 'gradient-reveal-text-normal--hll-people',
      'hll-application': 'gradient-reveal-text-normal--hll-application',
    },
  },
  defaultVariants: {
    variant: 'hll-ai',
  },
});

/*
 * Same gradients as VARIANT_GRADIENTS in heading-anim/heading-anim-variants.js
 * — kept as a literal copy so this folder stays self-contained and can be
 * copied into another project on its own.
 */
export const VARIANT_GRADIENTS = {
  'hll-ai': {
    colors: ['#3773FF', '#BCA6D6'],
    usage: 'hll-ai service',
  },
  'hll-trust': {
    colors: ['#129562', '#7CBAAA'],
    usage: 'hll-trust service',
  },
  'hll-foundation': {
    colors: ['#FF5A1E', '#CC8B93'],
    usage: 'hll-foundation service',
  },
  'hll-ontology': {
    colors: ['#7455FF', '#FFB26A'],
    usage: 'hll-ontology service',
  },
  'hll-people': {
    colors: ['#FF9042', '#FFEEC7'],
    usage: 'hll-people service',
  },
  'hll-application': {
    colors: ['#FF1F1F', '#72AAFF'],
    usage: 'hll-application service',
  },
};

export const HEADING_ANIM_NORMAL_VARIANT_NAMES = Object.keys(VARIANT_GRADIENTS);

export function resolveVariantColors(variant) {
  const gradient = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS['hll-ai'];
  return gradient.colors;
}

export function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
