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
  background: { color: "#ffffff", transparent: true },
  vignette: { radius: 1, falloff: 1, displace: 0, mix: 1, angle: 0, skew: 0.54 },
  sine: {
    frequency: 0.35, amplitude: 3.18, falloff: 0.5, rotation: 0,
    phase: 0, speed: 0.1, mixRadius: 1, trackMouse: 0,
  },
  shatter: { scale: 1, amount: 0.4, angle: 44, skew: 1.25, mixRadius: 1, trackMouse: 1 },
  bokeh: { mixRadius: 1, trackMouse: 0, radius: 69, tilt: 0.5, spread: 1.2 },
  output: { color: "#ffffff", aberration: 0.006, blendStrength: 0.95, capAmount: 0 },
  // Formerly-hardcoded shader constants (see DEFAULT_TUNE in shader-runtime.js).
  tune: {
    shatterOffsetScale: 0.2, shatterMinDist: 15, vignetteX: 0.5, sineX: 0.5,
    shatterTurns: 2, shatterCellScale: 50, softness: 1.3, vignetteFalloffFactor: 0.8,
    bokehWeightBase: 5, bokehWeightPow: 9, bokehWeightScale: 100,
    sineFrequencyScale: 27, sineAmplitudeScale: 0.19, bokehJitter: 0.05,
    shatterRandMul: 43758.5453, bokehNoiseScale: 0.01, bokehJitterFreqA: 0.1,
    bokehBaseSize: 0.003,
  },
};

const settings = {
  useFastBokeh: true,
  useBokeh: true,

  useVignette: true,
  useSine: true,
  useShatter: true,
  resolution: [window.innerWidth * MULTIPLIER, window.innerHeight * MULTIPLIER],
  samplingMethod: 1, // 0 = random | 1 = cosineWeighted
  blueNoiseSamplingMethod: 5, // 1 = random | 5 = BNDS | 6 = multi BTNDS textures
  useGammaCorrection: false,
  blueNoiseResolution: [256, 256],
  background: {
    color: "#FFAAA5",
  },
  vignette: {
    color: "#4a0035",
    radius: 0.354,
    falloff: 1,
    displace: 0,
    mix: 1,
    angle: 0,
    skew: 0.54,
    positionX: 0.603,
    positionY: 0.38,
  },
  // sine: {
  //   frequency: 0.35,
  //   amplitude: 1.18,
  //   falloff: 0.5,
  //   rotation: 0,
  //   phase: 0,
  //   speed: 0.1,
  //   mixRadius: 1,
  //   trackMouse: 0,
  // },
  shatter: {
    pos: [0.5, 0.5],
    scale: 0.534,
    amount: 1,
    angle: 44,
    radius: 1,
    skew: 0.84,
    mixRadius: 1,
    mixRadiusInvert: 0,
  },
  // bokeh: {
  //   mixRadius: 1,
  //   trackMouse: 0,
  //   radius: 0.754,
  //   tilt: 0.5,
  // },
  output: {
    color: "#FFD198",
  },
};
