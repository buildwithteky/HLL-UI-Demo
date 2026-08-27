// tag-variants.js — the tag's CVA variant system.
//
// Same split as hll-button-variants.js: CVA (class-variance-authority)
// composes the *static structural* class names below — it never computes
// anything at runtime and never sees a color. The tag's fill is a WebGL
// shader (see tag-runtime.js), not a CSS background, so each variant's
// color stops live in the plain, static VARIANT_GRADIENTS map right below
// the class composer, keyed by the same `variant` name so a class and its
// colors can never drift apart.
//
// `warm` / `cool` are LightFX Studio's own "Tag — Warm" / "Tag — Cool"
// presets (presets.js's WARM / COOL gradient constants), verbatim — the
// design system's only two tag looks today. To add a new one, add an entry
// to VARIANT_GRADIENTS (and, optionally, a matching class in tag.css).
import { cva } from 'class-variance-authority';

export const tagVariants = cva('tag', {
  variants: {
    variant: {
      warm: 'tag--warm',
      cool: 'tag--cool',
    },
    size: {
      sm: 'tag--sm',
      md: 'tag--md',
      lg: 'tag--lg',
    },
    disabled: {
      true: 'tag--disabled',
    },
  },
  defaultVariants: {
    variant: 'warm',
    size: 'md',
  },
});

/*
 * Each variant's fill gradient (2–4 stops), the label it defaults to, and a
 * short usage description — the source for a variant table the same way
 * hll-button-variants.js's VARIANT_GRADIENTS documents the button.
 *
 * Both are LightFX Studio's `WARM` / `COOL` gradient-sheet constants
 * (presets.js), used as-is — until Studio grows per-page tag presets, these
 * are the design system's only two tag looks.
 */
export const VARIANT_GRADIENTS = {
  warm: {
    colors: ['#fa4288', '#fb8e97', '#ff836b', '#fee253'],
    label: 'Warm',
    usage: 'Warm-toned filter/status tag',
  },
  cool: {
    colors: ['#ff80ca', '#8786e6', '#007fd2', '#59a3e9'],
    label: 'Cool',
    usage: 'Cool-toned filter/status tag',
  },
};

export const TAG_VARIANT_NAMES = Object.keys(VARIANT_GRADIENTS);

export const SIZE_SCALE = { sm: 0.85, md: 1, lg: 1.2 };

/* glowColor follows the same convention as hll-button-variants.js's
   resolveVariantColors, but tagBlurred() (presets.js) biases toward the
   gradient's later stops — index min(2, length-1) — instead of the first,
   so the glow reads as the warmer/cooler tail color, not the leading one. */
export function resolveVariantColors(variant) {
  const gradient = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS.warm;
  return {
    colors: gradient.colors,
    glowColor: gradient.colors[Math.min(2, gradient.colors.length - 1)],
  };
}
