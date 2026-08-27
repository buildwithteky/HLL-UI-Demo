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
// `services`/`industries`/`engagement`/`about`/`contact` and their colors
// are hll-button-variants.js's own VARIANT_GRADIENTS, verbatim — the same
// five menu-item gradients as HLLButton/BottomShader, so the jewel matches
// whichever menu item it's dropped into instead of carrying its own
// separate palette.
import { cva } from 'class-variance-authority';

export const shaderVariants = cva('shader', {
  variants: {
    variant: {
      services: 'shader--services',
      industries: 'shader--industries',
      engagement: 'shader--engagement',
      about: 'shader--about',
      contact: 'shader--contact',
      'hll-ai': 'shader--hll-ai',
      'hll-trust': 'shader--hll-trust',
      'hll-foundation': 'shader--hll-foundation',
      'hll-ontology': 'shader--hll-ontology',
      'hll-people': 'shader--hll-people',
      'hll-application': 'shader--hll-application',
    },
    disabled: {
      true: 'shader--disabled',
    },
  },
  defaultVariants: {
    variant: 'services',
  },
});

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
  // Per-service variants: same fixed 2-color gradients as
  // hll-button-variants.js's VARIANT_GRADIENTS, so the shader matches
  // HLLButton/Ripple/CornerRipple for each service.
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

export const SHADER_VARIANT_NAMES = Object.keys(VARIANT_GRADIENTS);

export function resolveVariantColors(variant) {
  const gradient = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS.services;
  return gradient.colors;
}
