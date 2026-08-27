// cornerripple-definition.js — the shared, non-color parts of the
// corner-ripple sketch: everything except the palette (which comes from a
// variant, see cornerripple-variants.js). Copied verbatim from the exported
// sketch.js's baked slider values — this is the "corner" layout (origin
// pinned to a corner of the frame, tighter ripple spacing), distinct from
// the centered `ripple` component. Shared by every variant unchanged.
export const MAX_RIPPLES = 32;

export const BASE_PARAMS = {
  bands: 5,
  speed: 0.9,
  flow: 0.2,
  shear: 0.3,
  shape: 0,
  rippleNoise: 0,
  rippleSpacing: 1.01,
  ox: 1,
  oy: 0,
  motion: 1,
  soft: 4,
  scale: 5.5,
  rot: 0,
  wobble: 0.08,
  saturation: 0.16,
  vibrancy: 0.5,
  contrast: 1.15,
};

// tap-ripple state (baked from export time, still interactive if tap mode
// was on)
export const TAP_RIPPLE_MODE = false;
