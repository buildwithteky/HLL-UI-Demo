// heading-anim-variants.js — the gradient-reveal heading's CVA variant
// system. Same split as the HLL Button / ripple components: CVA composes
// only the static structural class name; each variant's 2-3 color gradient
// lives in the VARIANT_GRADIENTS map below, copied verbatim from
// hll-button-variants.js so every design-system component stays keyed by
// the same variant names and colors.
import { cva } from 'class-variance-authority';

export const headingAnimVariants = cva('gradient-reveal-text', {
  variants: {
    variant: {
      enterprise: 'gradient-reveal-text--enterprise',
      services: 'gradient-reveal-text--services',
      industries: 'gradient-reveal-text--industries',
    },
  },
  defaultVariants: {
    variant: 'enterprise',
  },
});

/*
 * Same gradients as VARIANT_GRADIENTS in hll-button/hll-button-variants.js
 * — kept as a literal copy so this folder stays self-contained and can be
 * copied into another project on its own.
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

export const HEADING_ANIM_VARIANT_NAMES = Object.keys(VARIANT_GRADIENTS);

export function resolveVariantColors(variant) {
  const gradient = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS.enterprise;
  return gradient.colors;
}

export function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
