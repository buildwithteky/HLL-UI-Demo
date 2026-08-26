// hll-button-variants.js — the button's CVA variant system.
//
// CVA (class-variance-authority) composes the *static structural* class
// names below (layout, reset, state hooks) — it never computes anything at
// runtime and never sees a color. The button's fill/glow, however, is a
// WebGL shader (see hll-button-runtime.js), not a CSS background — CVA has
// no vocabulary for "the second stop of a canvas gradient". So each
// variant's 2–3 color gradient lives in the plain, static VARIANT_GRADIENTS
// map right below the class composer instead of being invented at render
// time: both are keyed by the same `variant` name, defined once, in this one
// file, so a class and its colors can never drift apart from each other.
//
// To add a new page variant, add one entry to VARIANT_GRADIENTS (and,
// optionally, a matching class in hll-button.css if you want a CSS hook) —
// see the README's "Adding a new variant" section.
import { cva } from 'class-variance-authority';

export const hllButtonVariants = cva('hll-button', {
  variants: {
    variant: {
      enterprise: 'hll-button--enterprise',
      services: 'hll-button--services',
      industries: 'hll-button--industries',
    },
    size: {
      sm: 'hll-button--sm',
      md: 'hll-button--md',
      lg: 'hll-button--lg',
    },
    disabled: {
      true: 'hll-button--disabled',
    },
    loading: {
      true: 'hll-button--loading',
    },
  },
  defaultVariants: {
    variant: 'enterprise',
    size: 'md',
  },
});

/*
 * Each variant's fill/glow gradient (2–3 stops) plus the label it defaults
 * to and a short description of its intended usage (also the source for the
 * README's variant table — see scripts/print-hll-button-variants.mjs).
 *
 * - `enterprise` is Studio's own saved "HLL Button" preset colors, verbatim
 *   — the single source of truth, unchanged from hll-button-definition.js.
 * - `services` / `industries` reuse existing LightFX Studio design tokens
 *   (the COOL / WARM gradient constants in
 *   HLL UI Studio/src/lightfx/presets.js), trimmed to 3 stops, rather than
 *   inventing new colors — until Studio grows dedicated per-page presets,
 *   this is the closest match to "the existing Studio/Figma designs".
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

export const HLL_BUTTON_VARIANT_NAMES = Object.keys(VARIANT_GRADIENTS);

export const SIZE_SCALE = { sm: 0.8, md: 1, lg: 1.25 };

/* glowColor follows the same convention Studio's own preset uses: the
   gradient's first stop, for both base and hover. */
export function resolveVariantColors(variant) {
  const gradient = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS.enterprise;
  return { colors: gradient.colors, glowColor: gradient.colors[0] };
}
