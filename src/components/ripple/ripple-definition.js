// ripple-definition.js — the shared, non-color parts of the ripple sketch:
// everything except the palette (which comes from a variant, see
// ripple-variants.js). Copied verbatim from the exported sketch.js's baked
// slider values — this is the "centered" ripple layout (origin near the
// middle of the frame). Shared by every variant unchanged, same convention
// as hll-button-definition.js.
export const MAX_RIPPLES = 32;

export const BASE_PARAMS = {
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

// tap-ripple state (baked from export time, still interactive if tap mode
// was on)
export const TAP_RIPPLE_MODE = false;
