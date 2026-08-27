// bottom-shader-definition.js — layout tuning for BottomShader's own crop:
// how tall its host is by default, how much of Shader's full-viewport
// render the canvas shows (as a multiple of the host's own height), and
// where the soft top-edge fade holds solid vs. goes fully transparent.
// Pulled out of bottom-shader.css into its own file (unlike Shader, which
// this component otherwise reuses as-is via shader-runtime.js/
// shader-definition.js) so this crop's own look can be retuned here
// without hunting through CSS — this file is the source of truth;
// BottomShader.jsx feeds these values in as CSS custom properties (see
// bottom-shader.css), so editing them here is enough on its own.

// .bottom-shader's own height on a real page. Override per-usage via the
// `style`/`className` props — this is only the default.
export const HOST_HEIGHT = '25vh';

// The canvas renders at this many multiples of the host's own height (2 =
// twice as tall as the host), then gets cropped to the host's bottom edge —
// this is what makes the *bottom* slice of Shader's full-viewport render
// show through instead of the top.
export const CANVAS_HEIGHT_MULTIPLIER = 2;

// The soft top-edge fade, both as a percentage down the CANVAS's own height
// (0-100, matching CANVAS_HEIGHT_MULTIPLIER's scale, not the host's):
// solid FADE_COLOR from 0% to FADE_HOLD_END, fully transparent (the effect
// fully visible) from FADE_SOLID_START to 100%, linearly blending between.
export const FADE_HOLD_END = 50;
export const FADE_SOLID_START = 65;

// The color the top edge fades from — should match the host's own
// background so the blend reads as "fading into the page" rather than a
// visible seam.
export const FADE_COLOR = '#ffffff';
