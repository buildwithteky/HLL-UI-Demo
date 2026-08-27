// bottom-shader-variants.js — the bottom-anchored shader's CVA variant
// system.
//
// Same split as shader-variants.js: CVA (class-variance-authority) composes
// the *static structural* class names below — it never computes anything at
// runtime and never sees a color. The glow's gradient ring is a WebGL
// texture (see ../shader/shader-runtime.js — BottomShader reuses Shader's
// engine as-is), not a CSS background, so each
// variant's color stops live in the plain, static VARIANT_GRADIENTS map
// right below the class composer instead of being invented at render time:
// both are keyed by the same `variant` name, defined once, in this one
// file, so a class and its colors can never drift apart from each other.
//
// The `services`/`industries`/`engagement`/`about`/`contact` menu-item
// palettes and the per-service palettes are the same fixed gradients as
// hll-button-variants.js's / shader-variants.js's VARIANT_GRADIENTS, so this
// glow matches HLLButton/Shader/Ripple/CornerRipple for each menu item and
// each service.
import { cva } from 'class-variance-authority';

export const bottomShaderVariants = cva('bottom-shader', {
  variants: {
    variant: {
      services: 'bottom-shader--services',
      industries: 'bottom-shader--industries',
      engagement: 'bottom-shader--engagement',
      about: 'bottom-shader--about',
      contact: 'bottom-shader--contact',
      'hll-ai': 'bottom-shader--hll-ai',
      'hll-trust': 'bottom-shader--hll-trust',
      'hll-foundation': 'bottom-shader--hll-foundation',
      'hll-ontology': 'bottom-shader--hll-ontology',
      'hll-people': 'bottom-shader--hll-people',
      'hll-application': 'bottom-shader--hll-application',
    },
    disabled: {
      true: 'bottom-shader--disabled',
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

export const BOTTOM_SHADER_VARIANT_NAMES = Object.keys(VARIANT_GRADIENTS);

export function resolveVariantColors(variant) {
  const gradient = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS.services;
  return gradient.colors;
}
