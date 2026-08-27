// shader-variants.js — the shader's CVA variant system.
//
// Same split as hll-button-variants.js: CVA (class-variance-authority)
// composes the *static structural* class names below — it never computes
// anything at runtime and never sees a color. The jewel's gradient ring is
// a WebGL texture (see shader-runtime.js), not a CSS background, so each
// variant's color stops live in the plain, static VARIANT_GRADIENTS map
// right below the class composer instead of being invented at render time:
// both are keyed by the same `variant` name, defined once, in this one
// file, so a class and its colors can never drift apart from each other.
//
// `enterprise`/`services`/`industries` and their colors are
// hll-button-variants.js's own VARIANT_GRADIENTS, verbatim — the same three
// page gradients as HLLButton/Ripple/CornerRipple, so the jewel matches
// whichever page it's dropped into instead of carrying its own separate
// warm/cool palette.
import { cva } from 'class-variance-authority';

export const shaderVariants = cva('shader', {
  variants: {
    variant: {
      enterprise: 'shader--enterprise',
      services: 'shader--services',
      industries: 'shader--industries',
    },
    disabled: {
      true: 'shader--disabled',
    },
  },
  defaultVariants: {
    variant: 'enterprise',
  },
});

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

export const SHADER_VARIANT_NAMES = Object.keys(VARIANT_GRADIENTS);

export function resolveVariantColors(variant) {
  const gradient = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS.enterprise;
  return gradient.colors;
}
