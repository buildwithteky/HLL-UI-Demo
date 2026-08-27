// ripple-definition.js — the non-color ripple/gradient parameters used by
// the sketch. Originally these were a single BASE_PARAMS object shared by
// every variant (only the palette varied); the HLL service pages each ship
// their own tuned ripple/gradient values (see VARIANT_PARAMS below), so this
// now resolves per variant, falling back to the original baked values for
// the design system's original three variants (enterprise/services/
// industries), which keep sharing one set unchanged.
export const MAX_RIPPLES = 32;

const DEFAULT_PARAMS = {
  bands: 5,
  speed: 0.9,
  flow: 0.2,
  shear: 0.3,
  shape: 0,
  rippleNoise: 0,
  rippleSpacing: 0.96,
  ox: 0.5,
  oy: 0.47,
  motion: 1,
  soft: 4,
  scale: 5.5,
  rot: 0,
  wobble: 0.08,
  saturation: 0,
  vibrancy: 0.66,
  contrast: 1.15,
};

export const BASE_PARAMS = DEFAULT_PARAMS;

// Per-variant tuning for the HLL service pages, exported from the same
// design tool's control panel. Each page's "Gradient Set" value isn't
// included here — the shader has no uGradientSet uniform, so it isn't a
// value the sketch can act on.
export const VARIANT_PARAMS = {
  enterprise: DEFAULT_PARAMS,
  services: DEFAULT_PARAMS,
  industries: DEFAULT_PARAMS,
  'hll-application': {
    bands: 12.8,
    speed: 0.31,
    flow: 0.2,
    shear: 0.3,
    shape: 0,
    rippleNoise: 0,
    rippleSpacing: 0.3,
    ox: 1,
    oy: 0,
    motion: 1,
    soft: 4,
    scale: 5.5,
    rot: 0,
    wobble: 0.3,
    saturation: 0.37,
    vibrancy: 0.54,
    contrast: 1.65,
  },
  'hll-foundation': {
    bands: 5.7,
    speed: 0.9,
    flow: 0.2,
    shear: 0.3,
    shape: 0,
    rippleNoise: 0,
    rippleSpacing: 1.16,
    ox: 1,
    oy: 0,
    motion: 0.94,
    soft: 4,
    scale: 5.5,
    rot: 1.81,
    wobble: 0.039,
    saturation: 0.08,
    vibrancy: 0.13,
    contrast: 1.31,
  },
  'hll-trust-and-governance': {
    bands: 5.7,
    speed: 0.9,
    flow: 0.2,
    shear: 0.3,
    shape: 0,
    rippleNoise: 0,
    rippleSpacing: 1.16,
    ox: 1,
    oy: 0,
    motion: 0.94,
    soft: 4,
    scale: 5.5,
    rot: 4.58,
    wobble: 0.039,
    saturation: 0,
    vibrancy: 0.09,
    contrast: 2,
  },
  'hll-people-and-policy': {
    bands: 5.7,
    speed: 0.9,
    flow: 0.2,
    shear: 0.3,
    shape: 0,
    rippleNoise: 0,
    rippleSpacing: 1.16,
    ox: 1,
    oy: 0,
    motion: 0.94,
    soft: 4,
    scale: 5.5,
    rot: 4.16,
    wobble: 0.039,
    saturation: 0,
    vibrancy: 0.68,
    contrast: 1.26,
  },
  'hll-ontology': {
    bands: 5.7,
    speed: 0.9,
    flow: 0.2,
    shear: 0.3,
    shape: 0,
    rippleNoise: 0,
    rippleSpacing: 1.16,
    ox: 1,
    oy: 0,
    motion: 0.94,
    soft: 4,
    scale: 5.5,
    rot: 0,
    wobble: 0.039,
    saturation: 0,
    vibrancy: 0.67,
    contrast: 0.97,
  },
  'hll-ai': {
    bands: 5.7,
    speed: 0.9,
    flow: 0.2,
    shear: 0.3,
    shape: 0,
    rippleNoise: 0,
    rippleSpacing: 1.16,
    ox: 1,
    oy: 0,
    motion: 0.94,
    soft: 4,
    scale: 5.5,
    rot: 0,
    wobble: 0.039,
    saturation: 0,
    vibrancy: 0.31,
    contrast: 1.27,
  },
};

export function resolveVariantParams(variant) {
  return VARIANT_PARAMS[variant] || DEFAULT_PARAMS;
}

// tap-ripple state (baked from export time, still interactive if tap mode
// was on)
export const TAP_RIPPLE_MODE = false;
