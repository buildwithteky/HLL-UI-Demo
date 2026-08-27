// bottom-shader-definition.js — layout tuning for BottomShader's own crop:
// how tall its host is by default, how much of Shader's full-viewport
// render the canvas shows, and where the soft top-edge fade holds solid vs.
// goes fully transparent. Pulled out of bottom-shader.css into its own file
// (unlike Shader, which this component otherwise reuses as-is via
// shader-runtime.js/shader-definition.js) so this crop's own look can be
// retuned here without hunting through CSS — this file is the source of
// truth; BottomShader.jsx feeds these values in as CSS custom properties
// (see bottom-shader.css), so editing them here is enough on its own.

// .bottom-shader's own height on a real page — the visible bottom slice.
// Override per-usage via the `style`/`className` props — this is only the
// default.
export const HOST_HEIGHT = '50vh';
const HOST_HEIGHT_PERCENT = parseFloat(HOST_HEIGHT); // 25

// The canvas always renders at the true viewport height — matching
// Shader's own canvas size exactly — regardless of how much of it
// HOST_HEIGHT actually crops down to. That's what makes this "the same
// animation, just showing the bottom slice of it" rather than a
// differently-shaped one: every effect BottomShader shares with Shader
// (vignette shape, sine warp, shatter, bokeh) is computed from the
// canvas's own resolution/aspect ratio, so a canvas sized to anything
// other than Shader's own full size renders a visibly different pattern,
// not just a crop of the same one. (A previous version of this file sized
// the canvas as a multiple of the HOST's own height instead — 100 /
// HOST_HEIGHT_PERCENT — which works out to the same ratio on a real page,
// but breaks as soon as the host is scoped into something whose own
// height isn't itself a plain vh/vw fraction of a real viewport, e.g. the
// docs Playground's preview box: percentages compound through however
// many positioned ancestors sit in between, so "a multiple of the host"
// stopped meaning "the true viewport size" the moment the host's own
// sizing source changed. A fixed viewport unit has no such dependency.)
export const CANVAS_HEIGHT = '100vh';

// The soft top-edge fade, expressed as how far into the host's own VISIBLE
// WINDOW (the bottom HOST_HEIGHT_PERCENT% of the canvas) it runs before the
// effect is fully solid: 0.3 means the top 30% of the visible window
// fades, the remaining 70% is fully visible. This fraction is the one
// actual tuning knob for the fade's look — the two exported percentages
// below (what bottom-shader.css actually needs, expressed against the
// canvas's own total 100vh height) are derived from it and from
// HOST_HEIGHT so they can't drift out of sync with either.
const FADE_FRACTION_OF_WINDOW = 0.3;
const WINDOW_START_PERCENT = 100 - HOST_HEIGHT_PERCENT; // where the visible window begins within the canvas's own height
export const FADE_HOLD_END = WINDOW_START_PERCENT; // anything above this is above the visible window anyway, so its exact value doesn't otherwise matter
export const FADE_SOLID_START = WINDOW_START_PERCENT + FADE_FRACTION_OF_WINDOW * HOST_HEIGHT_PERCENT;

// The color the top edge fades from — should match the host's own
// background so the blend reads as "fading into the page" rather than a
// visible seam.
export const FADE_COLOR = '#ffffff';
