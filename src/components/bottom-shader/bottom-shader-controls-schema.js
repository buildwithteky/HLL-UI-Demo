// Schema for BottomShaderControls: EVERY value the bottom shader reads.
// path roots: `s.` = the live settings object (mutated in place, read each
// frame by shader-runtime.js), `s.tune.` = formerly-hardcoded shader constants
// (defaults = original values, see DEFAULT_TUNE), `c.` = component-level
// config (colors, layout, opacity...). No min/max/clamp exists anywhere.
import { DEFAULT_TUNE } from '../shader/shader-runtime.js';

export const LENGTH_UNITS = ['vh', 'px', '%', 'vw', 'rem', 'em', 'svh', 'dvh'];

export const BLEND_MODES = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn',
  'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color',
  'luminosity', 'plus-darker', 'plus-lighter',
];

const n = (label, path, step = 0.01) => ({ type: 'num', label, path, step });
// label is REQUIRED so no input is ever anonymous.
const t = (key, label, step) => ({ type: 'num', label, path: `s.tune.${key}`, step: step ?? stepFor(DEFAULT_TUNE[key]), key });
function stepFor(v) {
  if (v == null || v === 0) return 0.01;
  const a = Math.abs(v);
  return a >= 100 ? 1 : a >= 10 ? 0.5 : a >= 1 ? 0.1 : a >= 0.1 ? 0.01 : 0.001;
}

export const GROUPS = [
  {
    title: 'Shape & Geometry',
    fields: [
      n('Vignette radius', 's.vignette.radius'), n('Vignette skew', 's.vignette.skew'),
      n('Vignette angle (turns)', 's.vignette.angle'),
      t('vignetteHalfFactor', 'Vignette radius → half-radius factor'),
      t('shatterCellScale', 'Shatter cell density'), n('Shatter scale', 's.shatter.scale'),
      n('Shatter angle (deg)', 's.shatter.angle', 1), n('Shatter skew', 's.shatter.skew'),
      t('shatterTurns', 'Shatter rotation turns multiplier'),
      n('Host (visible strip) height', 'c.hostHeight', 1),
      { type: 'select', label: 'Host height unit', path: 'c.hostHeightUnit', options: LENGTH_UNITS },
      n('Canvas (render) height', 'c.canvasHeight', 1),
      { type: 'select', label: 'Canvas height unit', path: 'c.canvasHeightUnit', options: LENGTH_UNITS },
      n('Fade start (% of strip, fully hidden above)', 'c.fadeStart', 1),
      n('Fade end (% of strip, fully shown below)', 'c.fadeEnd', 1),
      n('Fade min opacity (top)', 'c.fadeMinAlpha'), n('Fade max opacity (bottom)', 'c.fadeMaxAlpha'),
      n('Fade curve (1 = linear, >1 = slower start)', 'c.fadeCurve'),
      { type: 'bool', label: 'Use manual fade stops instead', path: 'c.manualStops' },
      { type: 'stops', label: 'Manual fade stops', path: 'c.maskStops' },
    ],
  },
  {
    title: 'Spread & Position',
    fields: [
      n('Shatter spread amount', 's.shatter.amount', 0.1),
      t('shatterOffsetScale', 'Shatter offset scale'), t('shatterMinDist', 'Shatter initial min distance'),
      t('vignetteX', 'Vignette center X'), t('vignetteY', 'Vignette center Y'),
      t('vignetteFollow', 'Vignette pointer-follow mix'),
      t('sineX', 'Sine center X'), t('sineY', 'Sine center Y'),
      t('shatterX', 'Shatter center X'), t('shatterY', 'Shatter center Y'),
      t('bokehX', 'Bokeh center X'), t('bokehY', 'Bokeh center Y'),
      n('Sine mix radius', 's.sine.mixRadius'), n('Shatter mix radius', 's.shatter.mixRadius'),
      n('Bokeh mix radius', 's.bokeh.mixRadius'),
      t('sineDistScale', 'Sine mix-distance scale'), t('shatterDistScale', 'Shatter mix-distance scale'),
    ],
  },
  {
    title: 'Softness & Blur',
    fields: [
      t('softness', 'Softness (bokeh blur-size multiplier)'),
      n('Vignette falloff (edge softness)', 's.vignette.falloff'),
      t('vignetteFalloffFactor', 'Vignette falloff factor'),
      n('Bokeh spread (disc size)', 's.bokeh.spread'),
      t('bokehBaseSize', 'Bokeh base disc size', 0.0005),
      t('bokehRadiusMix', 'Bokeh radius/tilt → blur size mix (0 = original look, 1 = fully applied)'),
      n('Bokeh radius (0 = bokeh off)', 's.bokeh.radius'), n('Bokeh tilt', 's.bokeh.tilt'),
      t('bokehTiltScale', 'Bokeh tilt distance scale'),
      t('bokehIterations', 'Bokeh sample count', 1), t('bokehGoldenAngle', 'Bokeh golden angle'),
    ],
  },
  {
    title: 'Color & Intensity',
    fields: [
      { type: 'colors', label: 'Gradient stop', path: 'c.colors' },
      { type: 'color', label: 'Background color', path: 's.background.color' },
      { type: 'bool', label: 'Background transparent', path: 's.background.transparent' },
      { type: 'color', label: 'Output color', path: 's.output.color' },
      n('Blend strength', 's.output.blendStrength'), n('Cap amount (solid plate mix)', 's.output.capAmount'),
      n('Aberration', 's.output.aberration', 0.001), t('aberrationScale', 'Aberration scale'),
      t('outputAlpha', 'Output alpha'), n('Host opacity', 'c.opacity'),
      { type: 'color', label: 'Top fade color', path: 'c.fadeColor' },
      { type: 'select', label: 'Blend mode (mix-blend-mode)', path: 'c.blendMode', options: BLEND_MODES },
      t('bokehWeightBase', 'Bokeh weight base'), t('bokehWeightPow', 'Bokeh weight power'),
      t('bokehWeightScale', 'Bokeh weight scale', 1),
    ],
  },
  {
    title: 'Noise & Distortion',
    fields: [
      n('Sine frequency', 's.sine.frequency'), n('Sine amplitude', 's.sine.amplitude', 0.1),
      n('Sine rotation (X/Y mix)', 's.sine.rotation'),
      t('sineFrequencyScale', 'Sine frequency scale'), t('sineAmplitudeScale', 'Sine amplitude scale'),
      t('shatterSeedPhase', 'Shatter seed phase'),
      t('shatterRandA', 'Shatter hash constant A'), t('shatterRandB', 'Shatter hash constant B'),
      t('shatterRandC', 'Shatter hash constant C'), t('shatterRandD', 'Shatter hash constant D'),
      t('shatterRandMul', 'Shatter hash multiplier', 1),
      t('bokehNoiseScale', 'Bokeh blue-noise rotation'), t('bokehJitter', 'Bokeh jitter amount'),
      t('bokehJitterFreqA', 'Bokeh jitter frequency A'), t('bokehJitterFreqB', 'Bokeh jitter frequency B'),
    ],
  },
  {
    title: 'Animation & Motion',
    fields: [
      t('timeScale', 'Global time speed'), t('gradientSpinSpeed', 'Gradient spin speed'),
      t('sineTimeScale', 'Sine time scale'), t('sinePhase', 'Sine phase multiplier'),
      t('shatterTimeScale', 'Shatter time scale'),
    ],
  },
  {
    title: 'Mouse & Pointer Interaction',
    fields: [
      n('Sine track mouse', 's.sine.trackMouse'), n('Shatter track mouse', 's.shatter.trackMouse'),
      n('Bokeh track mouse', 's.bokeh.trackMouse'),
      t('pointerSmoothing', 'Pointer smoothing'),
      t('pointerMaxY', 'Pointer max Y (blank = layout default)'),
    ],
  },
  {
    title: 'Rendering & Performance',
    fields: [
      { type: 'num', label: 'Render scale (blank = default)', path: 's.tune.renderScale', step: 0.05, nullable: true },
      t('dprCap', 'Device-pixel-ratio cap', 0.5),
    ],
  },
];

// Same groups minus the BottomShader-only host/layout/mask fields.
const BOTTOM_ONLY = new Set(['c.hostHeight', 'c.hostHeightUnit', 'c.canvasHeight', 'c.canvasHeightUnit', 'c.fadeStart', 'c.fadeEnd', 'c.fadeMinAlpha', 'c.fadeMaxAlpha', 'c.fadeCurve', 'c.manualStops', 'c.opacity', 'c.blendMode', 'c.fadeColor', 'c.maskStops']);
export const SHADER_GROUPS = GROUPS.map((g) => ({
  ...g,
  fields: g.fields.filter((f) => !BOTTOM_ONLY.has(f.path)),
}));

export const DEFAULT_MASK_STOPS = [
  [0, 0], [5, 0], [15, 0.15], [30, 0.5], [50, 1], [100, 1],
];

export function getPath(root, path) {
  return path.split('.').slice(1).reduce((o, k) => (o == null ? undefined : o[k]), root[path[0]]);
}
export function setPath(root, path, value) {
  const parts = path.split('.');
  let o = root[parts[0]];
  for (let i = 1; i < parts.length - 1; i++) {
    if (o[parts[i]] == null) o[parts[i]] = {};
    o = o[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (value === undefined) delete o[last]; else o[last] = value;
}
export function defaultFor(path) {
  const m = path.match(/^s\.tune\.(.+)$/);
  return m ? DEFAULT_TUNE[m[1]] : undefined;
}
