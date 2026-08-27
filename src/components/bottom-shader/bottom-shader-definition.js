// bottom-shader-definition.js — layout tuning for BottomShader's own crop:
// how tall its host is by default, how much of Shader's full-viewport
// render the canvas shows, and where the soft top-edge fade holds solid vs.
// goes fully transparent. Pulled out of bottom-shader.css into its own file
// (unlike Shader, which this component otherwise reuses as-is via
// shader-runtime.js/shader-definition.js) so this crop's own look can be
// retuned here without hunting through CSS — this file is the source of
// truth; BottomShader.jsx feeds these values in as CSS custom properties
// (see bottom-shader.css), so editing them here is enough on its own.
//
// The canvas always renders at the true viewport height — matching
// Shader's own canvas size exactly — regardless of how much of it the host
// actually crops down to. That's what makes this "the same animation, just
// showing the bottom slice of it" rather than a differently-shaped one:
// every effect BottomShader shares with Shader (vignette shape, sine warp,
// shatter, bokeh) is computed from the canvas's own resolution/aspect
// ratio, so a canvas sized to anything other than Shader's own full size
// renders a visibly different pattern, not just a crop of the same one. (A
// previous version of this file sized the canvas as a multiple of the
// host's own height instead — 100 / hostHeightPercent — which works out to
// the same ratio on a real page, but breaks as soon as the host is scoped
// into something whose own height isn't itself a plain vh/vw fraction of a
// real viewport, e.g. the docs Playground's preview box: percentages
// compound through however many positioned ancestors sit in between, so "a
// multiple of the host" stopped meaning "the true viewport size" the
// moment the host's own sizing source changed. A fixed viewport unit has
// no such dependency.)
export const CANVAS_HEIGHT = '100vh';

// How far into the host's own VISIBLE WINDOW (the bottom hostHeightPercent%
// of the canvas) the soft top-edge fade runs before the effect is fully
// solid: 0.3 means the top 30% of the visible window fades, the remaining
// 70% is fully visible. The one actual tuning knob for the fade's look —
// every other exported value below is derived from it plus a given host
// height so they can't drift out of sync with either.
const FADE_FRACTION_OF_WINDOW = 0.3;

// Builds a complete, internally-consistent set of layout values for a given
// host height — every value bottom-shader.css/BottomShader.jsx need,
// derived from that one number so none of them can drift out of sync with
// each other the way separately hand-tuned constants could. Call this with
// a different `hostHeightPercent` for a usage that needs a different crop
// (e.g. ServicesScrollDemo's half-height footer strip) instead of hand-
// deriving FADE_HOLD_END/FADE_SOLID_START/POINTER_MAX_Y yourself — see
// HALF_HEIGHT_LAYOUT below for exactly that.
export function makeBottomShaderLayout(hostHeightPercent, { fadeColor = '#ffffff' } = {}) {
  const windowStartPercent = 100 - hostHeightPercent; // where the visible window begins within the canvas's own height
  return {
    HOST_HEIGHT: `${hostHeightPercent}vh`,
    CANVAS_HEIGHT,
    // Anything above FADE_HOLD_END is above the visible window anyway, so
    // its exact value doesn't otherwise matter.
    FADE_HOLD_END: windowStartPercent,
    FADE_SOLID_START: windowStartPercent + FADE_FRACTION_OF_WINDOW * hostHeightPercent,
    // The color the top edge fades from — should match whatever's behind
    // the host so the blend reads as "fading into the page" rather than a
    // visible seam.
    FADE_COLOR: fadeColor,
    // The visible window's own top edge, expressed in shader-runtime.js's
    // pointer-tracking space (0 = canvas bottom, 1 = canvas top — see its
    // `pointer`/`currPointer`). Passed to createShaderFX as `pointerMaxY`
    // so it can clamp the cursor-follow light to this line whenever the
    // real cursor is higher up the page than the visible strip, instead of
    // letting the light drift up out of view — see shader-runtime.js's
    // onPointerMove.
    POINTER_MAX_Y: hostHeightPercent / 100,
  };
}

// The default layout every plain `<BottomShader>` usage gets unless it
// overrides `layout` — a 50vh host, matching the original "Outline
// Rectangle" / index.pen.html reference export.
export const DEFAULT_LAYOUT = makeBottomShaderLayout(50);

export const { HOST_HEIGHT, FADE_HOLD_END, FADE_SOLID_START, FADE_COLOR, POINTER_MAX_Y } = DEFAULT_LAYOUT;

// Half the reference export's 50vh host — for usages like
// ServicesScrollDemo's footer strip, which wants the same feel as the
// index.pen.html reference (see its own `#bg-wrap { height: 50vh }`) but
// at half that height.
export const HALF_HEIGHT_LAYOUT = makeBottomShaderLayout(25, { fadeColor: 'transparent' });
