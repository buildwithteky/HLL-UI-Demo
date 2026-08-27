// shader-definition.js — the structural definition behind the Shader
// component: everything about the "BlockGL — jewel refraction" WebGL2
// multi-pass effect (vignette shape, sine warp, voronoi shatter, bokeh,
// output compositing) EXCEPT its gradient colors, which live in
// shader-variants.js instead (same split as hll-button-definition.js /
// tag-definition.js). Copied verbatim from the exported index.pen.html's
// `settings` object — re-copy this file from there if the base look
// changes.
export const MULTIPLIER = 0.6; // render resolution scale relative to the
                                // canvas's device-pixel size

export const BLUE_NOISE_SIZE = 256;

export const BASE_SETTINGS = {
  background: { color: '#ffffff' },
  vignette: { radius: 0.5, falloff: 0.9, skew: 0.54, angle: 0 },
  sine: { frequency: 0.32, amplitude: 7.4, rotation: 0, mixRadius: 0.8, trackMouse: 1 },
  shatter: { scale: 0.8, amount: 0.5, angle: 44, skew: 0.9, mixRadius: 1, trackMouse: 1 },
  bokeh: { radius: 0.42, tilt: 0.5, mixRadius: 1, trackMouse: 0 },
  output: { color: '#ffffff', aberration: 0.006, blendStrength: 0.85 },
};
