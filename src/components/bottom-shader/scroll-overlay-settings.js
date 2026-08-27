// scroll-overlay-settings.js — the dedicated shatter/vignette/sine/bokeh
// preset for BottomShader's "scroll overlay" usage (see the `atEnd` prop on
// BottomShader.jsx): a page-bottom refraction effect meant to sit over
// scrollable content (see ServicesScrollDemo.jsx) rather than the plain
// service-page glow BASE_SETTINGS (shader-definition.js) is tuned for. Only
// the fields shader-runtime.js's draw calls actually read are kept —
// `resolution`/`blueNoiseResolution` in the original captured preset are
// vestigial (state.resolution is always recomputed from the canvas's own
// size in shader-runtime.js's resize(), never read from `settings`).
//
// SCROLL_OVERLAY_SETTINGS is the resting state while there's still more
// page to scroll; SCROLL_OVERLAY_END_SHATTER is the only thing that
// changes at the very end (see BottomShader.jsx's `atEnd` prop) — a
// stronger shatter scale/amount, smoothly interpolated in per-frame rather
// than swapped in place.
export const SCROLL_OVERLAY_SETTINGS = {
  // `transparent: true` (read by shader-runtime.js's createShaderFX —
  // see its `transparentBg`) — this overlay sits over Services.png, not a
  // page of its own, so the canvas must only paint the effect chain
  // itself and let the image show through everywhere else, instead of the
  // opaque `color` plate every other Shader/BottomShader preset draws.
  background: { color: '#ffffff', transparent: true },
  vignette: { radius: 0.53, falloff: 2.6, skew: 0.0, angle: 0 },
  sine: { frequency: 0.32, amplitude: 7.4, rotation: 0, mixRadius: 0.8, trackMouse: 1 },
  shatter: { scale: 0.2, amount: 1.0, angle: 10, skew: 0.9, mixRadius: 1, trackMouse: 1 },
  bokeh: { radius: 0.82, tilt: 0.5, mixRadius: 1, trackMouse: 0 },
  output: { color: '#ffffff', aberration: 0.006, blendStrength: 0.85 },
};

// Only shatter.scale/amount differ at the scrolled-to-the-end state — every
// other field (vignette/sine/bokeh/output/background) stays exactly as
// SCROLL_OVERLAY_SETTINGS already has it.
export const SCROLL_OVERLAY_END_SHATTER = { scale: 0.5, amount: 2.5 };
