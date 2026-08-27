// heading-anim-slow-variants.js — the "slow" speed gradient-reveal heading's
// CVA variant system (duration 1200, the multi-band "leak" sweep — see
// GradientRevealTextSlow.jsx). Its counterpart, the "normal" speed (duration
// 600, the white -> color -> black sweep), lives in
// heading-anim-normal/GradientRevealTextNormal.jsx. Same split as every
// other design-system component: CVA composes only the static structural
// class name; each variant's 2-3 color gradient lives in the
// VARIANT_GRADIENTS map below, copied verbatim from hll-button-variants.js
// so every design-system component stays keyed by the same variant names
// and colors.
import { cva } from 'class-variance-authority';

export const gradientRevealTextSlowVariants = cva('gradient-reveal-text-slow', {
  variants: {
    variant: {
      'hll-ai': 'gradient-reveal-text-slow--hll-ai',
      'hll-trust': 'gradient-reveal-text-slow--hll-trust',
      'hll-foundation': 'gradient-reveal-text-slow--hll-foundation',
      'hll-ontology': 'gradient-reveal-text-slow--hll-ontology',
      'hll-people': 'gradient-reveal-text-slow--hll-people',
      'hll-application': 'gradient-reveal-text-slow--hll-application',
    },
  },
  defaultVariants: {
    variant: 'hll-ai',
  },
});

/*
 * Same gradients as VARIANT_GRADIENTS in hll-button/hll-button-variants.js
 * — kept as a literal copy so this folder stays self-contained and can be
 * copied into another project on its own.
 */
export const VARIANT_GRADIENTS = {
  // Per-service variants: same fixed 2-color gradients as
  // hll-button-variants.js's / shader-variants.js's VARIANT_GRADIENTS, so
  // this heading matches HLLButton/Shader/BottomShader/Ripple/CornerRipple
  // for each service.
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

export const HEADING_ANIM_SLOW_VARIANT_NAMES = Object.keys(VARIANT_GRADIENTS);

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
