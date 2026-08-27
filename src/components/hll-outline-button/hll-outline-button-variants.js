// hll-outline-button-variants.js — the outline button's CVA variant system.
//
// CVA (class-variance-authority) composes the *static structural* class
// names below (layout, reset, state hooks) — it never computes anything at
// runtime and never sees a color. The button's border gradient/glow,
// however, is a WebGL shader (see hll-outline-button-runtime.js), not a CSS
// background — CVA has no vocabulary for "the second stop of a canvas
// gradient". So each variant's 2-color gradient lives in the plain, static
// VARIANT_GRADIENTS map right below the class composer instead of being
// invented at render time: both are keyed by the same `variant` name,
// defined once, in this one file, so a class and its colors can never drift
// apart from each other.
//
// Like hll-button-variants.js, this button supports both the top nav menu's
// 5 gradients (services/industries/engagement/about/contact) and the 6
// per-service variants — colors copied verbatim from hll-button-variants.js's
// VARIANT_GRADIENTS.
import { cva } from 'class-variance-authority';

export const hllOutlineButtonVariants = cva('hll-outline-button', {
  variants: {
    variant: {
      services: 'hll-outline-button--services',
      industries: 'hll-outline-button--industries',
      engagement: 'hll-outline-button--engagement',
      about: 'hll-outline-button--about',
      contact: 'hll-outline-button--contact',
      'hll-ai': 'hll-outline-button--hll-ai',
      'hll-trust': 'hll-outline-button--hll-trust',
      'hll-foundation': 'hll-outline-button--hll-foundation',
      'hll-ontology': 'hll-outline-button--hll-ontology',
      'hll-people': 'hll-outline-button--hll-people',
      'hll-application': 'hll-outline-button--hll-application',
    },
    size: {
      sm: 'hll-outline-button--sm',
      md: 'hll-outline-button--md',
      lg: 'hll-outline-button--lg',
    },
    disabled: {
      true: 'hll-outline-button--disabled',
    },
    loading: {
      true: 'hll-outline-button--loading',
    },
  },
  defaultVariants: {
    variant: 'hll-ai',
    size: 'md',
  },
});

/*
 * Each variant's hover border gradient plus a short description of its
 * intended usage. The menu variants (services/industries/engagement/about/
 * contact) are the top nav menu's own 3-stop gradients, copied verbatim
 * from hll-button-variants.js's VARIANT_GRADIENTS so the outline button
 * matches the filled button for the same menu item. The per-service
 * variants are the same fixed 2-color gradient per service, shared by
 * every component for that service (e.g. hll-ai everywhere hll-ai shows
 * up).
 */
export const VARIANT_GRADIENTS = {
  services: {
    colors: ['#F7A567', '#E05A35', '#EB3B3E'],
    usage: 'Services menu item',
  },
  industries: {
    colors: ['#0352B2', '#037A9F', '#6460D5'],
    usage: 'Industries menu item',
  },
  engagement: {
    colors: ['#F9B535', '#FF9126', '#FF6302'],
    usage: 'Engagement menu item',
  },
  about: {
    colors: ['#9AB4D3', '#A28DD7', '#AD7ECF'],
    usage: 'About menu item',
  },
  contact: {
    colors: ['#ABBFFF', '#2BB4EB', '#076EB8'],
    usage: 'Contact menu item',
  },
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

export const HLL_OUTLINE_BUTTON_VARIANT_NAMES = Object.keys(VARIANT_GRADIENTS);

export const SIZE_SCALE = { sm: 0.8, md: 1, lg: 1.25 };

/* glowColor follows the same convention as hll-button-variants.js's own
   resolveVariantColors: the gradient's first stop, for both base and
   hover. */
export function resolveVariantColors(variant) {
  const gradient = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS['hll-ai'];
  return { colors: gradient.colors, glowColor: gradient.colors[0] };
}
