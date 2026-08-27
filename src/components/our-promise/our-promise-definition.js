// our-promise-definition.js — the shared, non-React parts of the "Our
// Promise" sketch: palettes, look settings, and the scroll-driven ripple
// band/speed/text/image timing. Copied verbatim from the exported sketch.js's
// baked constants, same convention as ripple-definition.js.

export const MAX_RIPPLES = 32;
export const TAP_RIPPLE_MODE = false;

// Pre-scroll: colourful palette, full vibrancy. As you scroll, both the
// palette stops AND the saturation/vibrancy/contrast settings lerp toward
// the grey/neutral state, on the same eased timing as the ripple bands.
export const COLOR_PALETTE = [
  [0.00, 0.78, 0.82],
  [0.16, 0.62, 0.92],
  [0.98, 0.80, 0.30],
  [0.99, 0.54, 0.62],
  [1.00, 0.36, 0.64],
  [1.00, 0.78, 0.42],
];

// Blue-green palette for the scroll-end state.
//
// Index -> blob position: uPalette[0]/[1] land on the mesh's top-left/
// top-right blobs, [2]/[3] on the two center blobs, and [4]/[5] on the
// bottom-left/bottom-right blobs. Green sits in [0]/[1] to read at the top,
// blue in [4]/[5] to read at the bottom, with teal/cyan bridging the
// middle — one continuous flow from green at the top down to blue at the
// bottom, rather than two separate patches.
export const GRAY_PALETTE = [
  [0.168, 0.632, 0.323], // green (top-left blob)
  [0.392, 0.808, 0.635], // mint green (top-right blob)
  [0.202, 0.758, 0.712], // teal (center-left blob)
  [0.316, 0.706, 0.784], // cyan (center-right blob)
  [0.171, 0.275, 0.589], // blue (bottom-left blob)
  [0.225, 0.546, 0.775], // sky blue (bottom-right blob)
];

// Look settings tied to each palette state — the colour state gets a
// vibrancy/saturation lift so it reads at full brightness pre-scroll; the
// grey state keeps the original neutral values.
export const COLOR_LOOK = { saturation: 1.6, vibrancy: 0.8, contrast: 1.15 };
export const GRAY_LOOK = { saturation: 1.05, vibrancy: 0.5, contrast: 1.15 };

// Fixed look (previously exposed as sliders — locked to their nicest
// defaults).
export const BASE_PARAMS = {
  speed: 0.9,
  flow: 0.3, // radial displacement strength — draws the rings; direction
             // is locked radial (see shader.frag) so it has no
             // independent motion of its own
  shear: 0.0, // independent shear/swirl distortion — off
  shape: 0.0,
  rippleNoise: 0.0,
  rippleGap: 1.0,
  motion: 1.0,
  softness: 4.0,
  scale: 1.2,
  rotation: 0.0,
  wobble: 0.08,
};

// origin is locked to dead center. Ripple band count is locked to
// BANDS_AT_TOP at the top of the scroll range, dropping to BANDS_AT_BOTTOM
// within SCROLL_TRIGGER_PX of scroll — not tied to the page's/container's
// full scroll range, so it settles well before the real bottom (avoids
// rubber-band / overscroll bounce feeding back into it). Direction + speed
// ride the same scroll progress as one signed value: positive drives the
// ripple inward (top), negative drives it outward (bottom) — lerping
// linearly through zero means it naturally eases to a stop and reverses.
export const LOCKED_ORIGIN = [0.5, 0.5];
export const BANDS_AT_TOP = 8;
export const BANDS_AT_BOTTOM = 2;

export const SPEED_AT_TOP = 0.9; // inward (positive = inward, see shader.frag)
export const SPEED_AT_BOTTOM = -0.15; // outward, and slower in magnitude

// Spread over a full, normal scroll (roughly a screen and a half) instead
// of a single wheel-flick, so the band count is clearly seen reducing.
export const SCROLL_TRIGGER_PX = 1100;
export const BANDS_EASING = 0.2; // low alpha = slow, smooth convergence
                                  // each frame

// Text finishes fading out at 55% of the scroll transition; the image
// starts fading in at 55%, so there's a short overlap instead of a hard
// cut, and by 100% (the same point the ripple bands finish settling) the
// image is fully scaled in and opaque.
export const TEXT_FADE_END = 0.55;
export const TEXT_SCALE_END = 0.25;

export const IMAGE_FADE_START = 0.55;
export const IMAGE_FADE_END = 1.0;
export const IMAGE_SCALE_START = 0.82;

// Height of the scroll spacer beneath the fixed canvas — gives the page
// something to actually scroll through.
export const SCROLL_SPACER_VH = 260;
