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
      services: 'hll-button--services',
      industries: 'hll-button--industries',
      engagement: 'hll-button--engagement',
      about: 'hll-button--about',
      contact: 'hll-button--contact',
      'hll-ai': 'hll-button--hll-ai',
      'hll-trust': 'hll-button--hll-trust',
      'hll-foundation': 'hll-button--hll-foundation',
      'hll-ontology': 'hll-button--hll-ontology',
      'hll-people': 'hll-button--hll-people',
      'hll-application': 'hll-button--hll-application',
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
    variant: 'services',
    size: 'md',
  },
});

/*
 * Each variant's fill/glow gradient (2–3 stops) plus the label it defaults
 * to and a short description of its intended usage (also the source for the
 * README's variant table — see scripts/print-hll-button-variants.mjs).
 *
 * `services` / `industries` / `engagement` / `about` / `contact` are the top
 * nav menu's own 3-stop gradients (the design spec), shared verbatim with
 * shader-variants.js and bottom-shader-variants.js so the button and both
 * shader effects always match for the same menu item.
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
  // Per-service variants: one fixed 2-color gradient per service, shared by
  // every page/component for that service (e.g. hll-ai everywhere hll-ai
  // shows up), sourced verbatim from the HLL Button services color spec.
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

export const HLL_BUTTON_VARIANT_NAMES = Object.keys(VARIANT_GRADIENTS);

export const SIZE_SCALE = { sm: 0.8, md: 1, lg: 1.25 };

/* glowColor follows the same convention Studio's own preset uses: the
   gradient's first stop, for both base and hover. */
export function resolveVariantColors(variant) {
  const gradient = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS.services;
  return { colors: gradient.colors, glowColor: gradient.colors[0] };
}
