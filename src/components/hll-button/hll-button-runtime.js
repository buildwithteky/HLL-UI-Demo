// hll-button-runtime.js — LightFX runtime (procedural light/blur effect
// engine) that renders the HLL Button's shape, gradient, blur and cursor-lens
// glow. Self-contained: only dependency is `three`. Embedded verbatim from
// LightFX Studio (src/lightfx/runtime.js) so this file has no dependency on
// the Studio repo itself — re-copy it from there if the engine changes.
import * as THREE from 'three';

/*
 * LightFX runtime — self-contained procedural light component.
 *
 * Everything works in normalized UV space: shape sizes, blur radii, glow
 * falloffs and light positions are all fractions of the component's own
 * dimensions, never absolute pixels. A component only knows its shape,
 * shader params, preset and interaction config — layout is the host's job.
 *
 * This file must stay dependency-free apart from `three`: the exporters
 * embed its source verbatim into generated framework snippets.
 */

const LIGHTFX_VERTEX = /* glsl */ `
varying vec2 v_uv;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  v_uv = uv;
}`;

const LIGHTFX_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 v_uv;

uniform vec2  u_resolution;
uniform float u_bleed;
uniform float u_time;
uniform float u_hover;
uniform float u_pulse;
uniform vec2  u_lightPos;

uniform int   u_shapeType;   /* 0 circle, 1 roundRect, 2 polygon, 3 star, 4 mask */
uniform float u_shapeSize;
uniform float u_cornerRadius;
uniform float u_sides;
uniform float u_rotation;
uniform float u_strokeWidth; /* 0 = filled shape; >0 = hollow outline of this width, in shapeSize units */
uniform sampler2D u_mask;

uniform float u_blur;
uniform float u_dissolve;   /* 1 = let a high blur fade the whole shape to nothing (tags) */
uniform float u_glowIntensity;
uniform float u_glowRadius;
uniform float u_bloom;
uniform float u_scatter;
uniform float u_fresnel;
uniform float u_noiseAmount;
uniform float u_noiseScale;
uniform float u_noiseSpeed;
uniform float u_chromatic;
uniform float u_fillOpacity;
uniform float u_opacity;
uniform float u_gradientAngle;
uniform float u_intensity;
/* multi-stop fill gradient: up to MAX_STOPS colors, sampled by gradientSample()
   below. u_colorCount is how many of the array's entries are actually in
   use (2..MAX_STOPS) — extra slots are ignored. Hover has its own set of
   stops rather than the JS side pre-mixing one color, so the hover gradient
   can bleed in locally around the cursor (see 'leak' in main) instead of
   recoloring the whole shape at once. */
#define MAX_STOPS 6
uniform vec3  u_colors[MAX_STOPS];
uniform vec3  u_colorsHover[MAX_STOPS];
uniform int   u_colorCount;
uniform vec3  u_glowColor;
uniform vec3  u_glowColorHover;

/* cursor lens: two 'fillMask' proximity rings around the pointer (see
   'focus'/'leak' in main), same technique as shaders/fragment.glsl's
   sdfCircle — a size/edge pair fed straight in as the blur/softness amount,
   rather than a Gaussian falloff. All tunable per component instead of
   hard-coded, so the lens' reach and footprint can be dialed in per
   shape/size. */
uniform float u_cursorFocusRadius; /* wide ring's radius: which side of the shape reads as "near" the cursor */
uniform float u_cursorFocusEdge;   /* wide ring's softness */
uniform float u_cursorRadius;      /* tight ring's radius: the hot patch centered on the cursor itself */
uniform float u_cursorEdge;        /* tight ring's softness */
uniform float u_cursorAspect;      /* 1 = circular patch; >1 flattens it, <1 stretches it tall */
uniform float u_cursorExpand;      /* how far blur bulges past its configured width right at the cursor */
uniform float u_cursorColorLeak;   /* 0..1, how strongly the hover color bleeds in locally */
uniform float u_cursorTransparency; /* 0..1, fades the shape toward see-through right at the cursor */

#define PI 3.14159265358979

/* --- signed distance functions (all in min-dimension units) --- */
float sdCircle(vec2 p, float r) { return length(p) - r; }

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float sdNgon(vec2 p, float r, float n) {
  float an = PI / n;
  float a = mod(atan(p.y, p.x) + an, 2.0 * an) - an;
  return length(p) * cos(a) - r * cos(an);
}

float sdStar(vec2 p, float r, float n, float m) {
  float an = PI / n;
  float en = PI / m;
  vec2 acs = vec2(cos(an), sin(an));
  vec2 ecs = vec2(cos(en), sin(en));
  float bn = mod(atan(p.x, p.y), 2.0 * an) - an;
  p = length(p) * vec2(cos(bn), abs(sin(bn)));
  p -= r * acs;
  p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);
  return length(p) * sign(p.x);
}

float sceneSDF(vec2 p, vec2 asp) {
  float sz = max(u_shapeSize, 1e-4);
  if (u_shapeType == 0) return sdCircle(p, sz * 0.5);
  if (u_shapeType == 1) {
    vec2 b = asp * 0.5 * sz;
    float r = min(u_cornerRadius * 0.5, min(b.x, b.y));
    return sdRoundBox(p, b, r);
  }
  if (u_shapeType == 2) return sdNgon(p, sz * 0.5, max(floor(u_sides + 0.5), 3.0));
  if (u_shapeType == 3) {
    float n = max(floor(u_sides + 0.5), 3.0);
    float m = clamp(mix(n, 2.0, clamp(u_cornerRadius, 0.0, 1.0)), 2.0, n);
    return sdStar(p, sz * 0.5, n, m);
  }
  /* image / SVG mask: distance field baked into a texture; the tiny dither
     hides 8-bit quantization banding in glow falloffs */
  vec2 muv = p / sz + 0.5;
  vec2 cl = clamp(muv, 0.0, 1.0);
  float enc = texture2D(u_mask, cl).r;
  float dither = (fract(sin(dot(muv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.004;
  return (enc - 0.5 + dither) * sz + length(muv - cl) * sz;
}

/* --- value noise fbm --- */
float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + 17.7;
    a *= 0.5;
  }
  return v;
}

/* Approaches 'cap' as x grows but never actually reaches it — unlike a hard
   min(), every larger input still produces a (progressively smaller but
   nonzero) visible change, so no two distinct values ever render identically
   and cranking a field never silently "stops doing anything". Close to
   identity for x well under cap, so ordinary values are practically
   untouched. */
float softCap(float x, float cap) {
  return cap * (1.0 - exp(-max(x, 0.0) / cap));
}

/* Same shape as shaders/fragment.glsl's fill(x, size, edge): 1 inside
   'size', ramping down to 0 over 'edge' on either side. Used here as a
   cursor-centered proximity mask (x = distance from the pointer) instead of
   a shape fill, so the falloff around the cursor is a plain smoothstep
   ring rather than a Gaussian — same technique as the lens-blur reference. */
float fillMask(float x, float size, float edge) {
  return 1.0 - smoothstep(size - edge, size + edge, x);
}

/* Samples the multi-stop fill gradient (base or hover set, chosen by
   useHover) at position t in [0,1]. Reads the uniform arrays directly by a
   loop-constant index rather than taking an array as a function parameter —
   WebGL1 GLSL ES 1.00 has flaky driver support for the latter, but a 'for'
   loop with a compile-time-constant bound indexing a uniform array by its
   own loop variable is the standard, portable pattern. Each iteration only
   commits its segment's blend into 'result' when t actually falls inside
   that segment ('active'), so segments before/after the current one leave
   the running result untouched instead of overwriting it. */
vec3 gradientSample(float t, bool useHover) {
  int n = clamp(u_colorCount, 2, MAX_STOPS);
  float scaled = clamp(t, 0.0, 1.0) * float(n - 1);
  vec3 result = useHover ? u_colorsHover[0] : u_colors[0];
  for (int k = 0; k < MAX_STOPS - 1; k++) {
    if (k < n - 1) {
      float lo = float(k);
      float hi = float(k + 1);
      float segT = clamp(scaled - lo, 0.0, 1.0);
      float inSeg = step(lo, scaled) * step(scaled, hi);
      vec3 a = useHover ? u_colorsHover[k] : u_colors[k];
      vec3 b = useHover ? u_colorsHover[k + 1] : u_colors[k + 1];
      result = mix(result, mix(a, b, segT), inSeg);
    }
  }
  return result;
}

void main() {
  /* the canvas bleeds past its host element so glow isn't clipped;
     re-map to element-space uv so all params stay element-relative */
  vec2 uv = (v_uv - 0.5) * (1.0 + 2.0 * u_bleed) + 0.5;
  float minRes = min(u_resolution.x, u_resolution.y);
  vec2 asp = u_resolution / minRes;
  vec2 p = (uv - 0.5) * asp;
  float cr = cos(u_rotation);
  float sr = sin(u_rotation);
  vec2 pr = mat2(cr, -sr, sr, cr) * p;

  float d = sceneSDF(pr, asp);

  /* noise: distorts the shape edge and textures the fill */
  float n = 0.5;
  if (u_noiseAmount > 0.0001) {
    n = fbm(pr * u_noiseScale + vec2(u_time * u_noiseSpeed, -u_time * u_noiseSpeed * 0.7));
    d += (n - 0.5) * u_noiseAmount;
  }

  /* Cursor-local blur + color, same technique as the lens-blur shaders
     (see shaders/fragment.glsl's sdfCircle / fill()): a plain SDF circle
     centered on the pointer is fed straight in as the blur/softness amount,
     rather than blending it uniformly across the whole shape on hover.
     Two rings off the same cursor distance 'ld' (aspect-warped by
     u_cursorAspect so the patch doesn't have to be a perfect circle):
       - 'focus' (wide, radius/edge u_cursorFocusRadius/u_cursorFocusEdge):
         the side of the shape near the cursor stays at full softness while
         the far side sharpens back toward a crisp edge — direction, not a
         hot spot.
       - 'leak' (tight, radius/edge u_cursorRadius/u_cursorEdge): a small
         patch centered exactly on the cursor that pushes softness past its
         configured ceiling by u_cursorExpand (the "expanding" bulge) and
         pulls the local color toward the hover state, scaled by
         u_cursorColorLeak (the "leaking" color), while the rest of the
         shape — most of a card, but effectively all of a small button —
         stays close to base. Both are gated by u_hover so the resting
         state is untouched. */
  vec2 lp = (u_lightPos - 0.5) * asp;
  vec2 rel = p - lp;
  rel.y *= max(u_cursorAspect, 0.0001);
  float ld = length(rel);
  float focusMask = fillMask(ld, u_cursorFocusRadius, max(u_cursorFocusEdge, 1e-4));
  float focus = mix(1.0, focusMask, u_hover);
  float leak = fillMask(ld, u_cursorRadius, max(u_cursorEdge, 1e-4)) * u_hover;

  /* blur = smoothstep width on the SDF, in component units. The canvas
     itself only extends u_bleed past the element before it's clipped, so
     the transition must fully resolve to 0 alpha within that margin —
     otherwise the canvas's own edge cuts the still-fading gradient off
     abruptly, showing up as a hard rectangular seam instead of a soft
     fade. Soft-cap the half-width to the room actually available, rather
     than hard-clamping it, so radius keeps visibly growing (just with
     diminishing returns) instead of flatlining past a fixed number. */
  float px = 1.5 / minRes;
  float shapeHalfExtent = 0.5 * max(u_shapeSize, 1e-4);
  /* Default (u_dissolve off): the fade may only soften to half the shape's
     half-extent, so a solid core always remains — the original conservative
     seam guard, unchanged for every normal component. When a component opts
     into dissolve mode, the fade may instead reach the shape's centre (as far
     as the bleed margin allows before the canvas edge would clip it to a seam),
     so a high blur melts the whole shape into a borderless blob. Tags only. */
  float maxSoft;
  if (u_dissolve > 0.5) {
    float bleedRoom = (0.5 + u_bleed) - shapeHalfExtent;
    maxSoft = max(min(shapeHalfExtent, bleedRoom * 0.85), px);
  } else {
    maxSoft = max(shapeHalfExtent * 0.5, px);
  }
  float softFull = max(px, softCap(u_blur * 0.5, maxSoft));
  float soft = mix(px, softFull, focus);
  /* u_cursorExpand is an absolute radius bump (same units as blur), not a
     multiple of the configured blur, so the edge visibly melts under the
     cursor even for a preset whose base blur is barely-there (e.g. a crisp
     outline button) instead of the bulge scaling away to nothing. */
  soft += leak * u_cursorExpand;

  /* u_strokeWidth > 0 draws a hollow outline instead of a filled shape: fold
     the signed distance around the boundary (abs(d) - halfWidth) so it's
     negative only in a thin band straddling the edge, then feed that into
     the same smoothstep used for the fill. Glow/bloom/rim below still key
     off the original 'd' (the filled shape's boundary), so a component that
     also wants a halo keeps radiating from the true silhouette, not the
     ring's own two edges. */
  float dFill = u_strokeWidth > 0.0001 ? abs(d) - u_strokeWidth * 0.5 : d;
  float shape = 1.0 - smoothstep(-soft, soft, dFill);

  /* chromatic aberration: fringe the edge per channel */
  float ca = u_chromatic;
  float shapeR = shape;
  float shapeB = shape;
  if (ca > 0.0001) {
    shapeR = 1.0 - smoothstep(-soft, soft, dFill - ca);
    shapeB = 1.0 - smoothstep(-soft, soft, dFill + ca);
  }

  /* gradient fill: the base and hover gradients are each sampled in full,
     then blended per-fragment by 'leak' (scaled by u_cursorColorLeak, 0 =
     stays base everywhere) instead of pre-mixing a single color for the
     whole shape, so the hover gradient visibly bleeds in from the cursor's
     position rather than the shape recoloring everywhere at once. */
  float leakColor = leak * clamp(u_cursorColorLeak, 0.0, 1.0);
  vec3 glowColorLocal = mix(u_glowColor, u_glowColorHover, leakColor);

  float ga = u_gradientAngle;
  vec2 gdir = vec2(cos(ga), sin(ga));
  float t = clamp(dot(uv - 0.5, gdir) + 0.5, 0.0, 1.0);
  vec3 baseCol = mix(gradientSample(t, false), gradientSample(t, true), leakColor);
  if (u_noiseAmount > 0.0001) baseCol *= 0.82 + 0.36 * n;

  /* glow and bloom hug the edge and radiate outward; inside the fill they
     fall to a faint remainder instead of flooding it. Each of these
     multiplies straight into an exp() falloff, so an unbounded intensity
     doesn't just brighten the halo — it pushes the radius where the falloff
     is still >1 (and so clips to solid white) outward without limit,
     eventually swallowing neighboring components. Soft-cap the intensity
     feeding the exponent (not the final color) so the reach stays bounded
     while still growing visibly at every input value, rather than hard-
     clamping to a fixed ceiling past which more input does nothing. */
  float outer = max(d, 0.0);
  float glowI = softCap(u_glowIntensity, 8.0);
  float bloomI = softCap(u_bloom, 8.0);
  float fresnelI = softCap(u_fresnel, 8.0);
  float scatterI = softCap(u_scatter, 8.0);
  float glow = glowI * exp(-outer / max(u_glowRadius * 0.35, 1e-3)) * (1.0 - shape * 0.85);
  /* bloom's falloff scale was wide enough to wash a large area around the
     shape with a barely-there tinted haze — invisible on a dark page (reads
     as extra glow) but a visible gray smudge on a light one. Tightened so it
     stays a halo close to the edge, closer to glow's own reach. */
  float bloom = bloomI * exp(-(outer * outer) / max(u_glowRadius * u_glowRadius * 0.5, 1e-4)) * (1.0 - shape * 0.75);
  /* the fresnel rim is a thin bright line hugging the edge; widening it via
     'soft' alone (already boosted above) just makes a thicker line, which
     still reads as a crisp border. Knocking its peak intensity down where
     the cursor sits, on top of the widening, is what actually makes it
     read as "the border blurred/melted" instead of "the border got fat". */
  float rim = fresnelI * mix(1.0, 0.35, leak) * exp(-abs(d) / (0.015 + soft * 0.8));

  /* light scatter around the (cursor-following) light position; lp/ld/
     focusMask were already computed above to drive the directional blur */
  float haze = scatterI * focusMask * exp(-outer / 0.5) * 0.55 * (1.0 - shape * 0.5);
  baseCol *= 1.0 + scatterI * focusMask * 0.35;

  /* click pulse: ring expanding outward from the shape edge */
  float ring = 0.0;
  if (u_pulse > 0.001) {
    float rp = (1.0 - u_pulse) * 0.45;
    float rd = abs(outer - rp);
    /* squared falloff so the ripple visibly fades rather than snapping off */
    ring = exp(-(rd * rd) / 0.0012) * u_pulse * u_pulse;
  }

  vec3 glowMix = mix(baseCol, glowColorLocal, 0.65);
  /* bloom represents emitted light, not a tinted fill — biasing it toward
     white keeps it reading as "glow" (bright, low-alpha) instead of "stain"
     (dim, moderate-alpha) once composited over a light background */
  vec3 bloomMix = mix(baseCol, vec3(1.0), 0.7);
  vec3 col = baseCol * vec3(shapeR, shape, shapeB) * u_fillOpacity;
  col += glowColorLocal * glow * (1.0 - shape * 0.3);
  col += bloomMix * bloom;
  col += mix(baseCol, vec3(1.0), 0.45) * rim;
  col += glowMix * haze;
  col += glowColorLocal * ring;
  col *= u_intensity;

  float alpha = max(shapeR, max(shape, shapeB)) * u_fillOpacity;
  /* bloom's alpha weight is lower than its color weight on purpose: it should
     read as a light brightening (color near-white, low alpha) rather than a
     moderate-alpha tinted fill, which is what showed up as a gray smudge on
     light backgrounds */
  alpha = max(alpha, clamp(glow * 0.85 + bloom * 0.3, 0.0, 1.0));
  alpha = max(alpha, clamp(rim * 0.7, 0.0, 1.0));
  alpha = max(alpha, clamp(haze, 0.0, 1.0));
  alpha = max(alpha, clamp(ring * 0.8, 0.0, 1.0));
  alpha = clamp(alpha, 0.0, 1.0);
  /* optional: fade toward transparent right where the cursor is, instead of
     (or alongside) the color leak — a "hole" in the surface rather than a
     tint. 0 by default, so existing components are unaffected. */
  alpha *= clamp(1.0 - leak * clamp(u_cursorTransparency, 0.0, 1.0), 0.0, 1.0);
  alpha *= u_opacity;

  gl_FragColor = vec4(col, alpha);
}`;

const SHAPE_TYPES = ['circle', 'roundRect', 'polygon', 'star', 'mask'];

/* Max fill-gradient stops (matches MAX_STOPS in the shader). `colors` is a
 * variable-length array (2..MAX_COLOR_STOPS hex strings), handled outside
 * PARAM_TYPES since it isn't a plain scalar/color like the rest. */
const MAX_COLOR_STOPS = 6;

/* Every tunable param: 'f' float, 'c' hex color. Both base and hover states
 * carry a full set; the runtime blends them by the damped hover value. */
const PARAM_TYPES = {
  blur: 'f',
  glowIntensity: 'f',
  glowRadius: 'f',
  bloom: 'f',
  scatter: 'f',
  fresnel: 'f',
  noiseAmount: 'f',
  noiseScale: 'f',
  noiseSpeed: 'f',
  chromatic: 'f',
  fillOpacity: 'f',
  opacity: 'f',
  gradientAngle: 'f',
  glowColor: 'c',
};

/* Toggling an effect off forces its driving param(s) to zero. */
const EFFECT_GATES = {
  blur: ['blur'],
  glow: ['glowIntensity'],
  bloom: ['bloom'],
  scatter: ['scatter'],
  fresnel: ['fresnel'],
  noise: ['noiseAmount'],
  chromatic: ['chromatic'],
};

/* reverse lookup: param key -> the effect name that gates it */
const PARAM_GATE = {};
for (const fx in EFFECT_GATES) {
  for (const key of EFFECT_GATES[fx]) PARAM_GATE[key] = fx;
}

const ALL_EFFECTS_ON = { blur: true, glow: true, bloom: true, scatter: true, fresnel: true, noise: true, chromatic: true };

/* Defaults for the cursor lens (see 'focus'/'leak' in the fragment shader).
 * Exported so presets and the studio UI share one source of truth and old
 * saved definitions that predate these fields fall back to the same values
 * the shader was tuned against. */
const CURSOR_LENS_DEFAULTS = {
  cursorFocusRadius: 0.4,
  cursorFocusEdge: 0.5,
  cursorRadius: 0.18,
  cursorEdge: 0.3,
  cursorAspect: 1,
  cursorExpand: 0.12,
  cursorColorLeak: 1,
  cursorTransparency: 0,
};

const DEFAULT_DEFINITION = {
  shape: { type: 'roundRect', size: 0.82, cornerRadius: 0.24, sides: 6, rotation: 0, maskSrc: null },
  /* effect toggles are per base/hover state, independent of each other */
  effects: { base: { ...ALL_EFFECTS_ON }, hover: { ...ALL_EFFECTS_ON } },
  interaction: { hover: true, cursorLight: true, clickPulse: true, colorOnHover: true, speed: 6, lightPos: [0.5, 0.5], ...CURSOR_LENS_DEFAULTS },
  /* global strength multiplier for color/glow output; not a base/hover state */
  intensity: 1,
  /* opt-in render behaviours, off by default (see LightComponent.frame):
     dissolve — let a high blur fade the whole shape away; premultiplied —
     composite soft fades in true colour instead of graying out. */
  render: { dissolve: false, premultiplied: false },
  /* label rendered inside the component (see `.fx-label` in studio.js/html) —
     a DOM overlay, not a shader param, so it composites above the effect
     regardless of blur/bloom. fontFamily/fontDataUrl are only set once a
     custom font is uploaded; empty means "use the page's default font". */
  text: {
    content: 'Button',
    fontFamily: '',
    fontDataUrl: '',
    fontSize: 13,
    letterSpacing: 0,
    fontWeight: 600,
    /* label color, split by state like params.base/hover: 'color' is the
       resting look, 'hoverColor' is what it transitions to while the
       pointer is over the component (see '#playground:hover .fx-label' in
       css/studio.css). */
    color: '#191919',
    hoverColor: '#191919',
    /* space (px) kept between the label and the shape's edge; only affects
       components that auto-fit their box to the label (currently a 'circle'
       shape — see autoFitCircleBox in studio.js). Unused otherwise. */
    padding: 16,
  },
  params: {
    base: {
      blur: 0.06, glowIntensity: 0.5, glowRadius: 0.3, bloom: 0.3, scatter: 0.25,
      fresnel: 0, noiseAmount: 0, noiseScale: 6, noiseSpeed: 0.3, chromatic: 0,
      fillOpacity: 0.9, opacity: 1, gradientAngle: 25,
      colors: ['#7dd3fc', '#a78bfa'], glowColor: '#bae6fd',
    },
    hover: {
      blur: 0.09, glowIntensity: 0.85, glowRadius: 0.38, bloom: 0.5, scatter: 0.55,
      fresnel: 0.6, noiseAmount: 0, noiseScale: 6, noiseSpeed: 0.3, chromatic: 0.006,
      fillOpacity: 0.95, opacity: 1, gradientAngle: 25,
      colors: ['#93c5fd', '#c4b5fd'], glowColor: '#e0f2fe',
    },
  },
};

export function cloneDefinition(def) {
  return JSON.parse(JSON.stringify(def));
}

function hexToRGB(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

/* --- image / SVG mask -> signed distance field --------------------------- */

/* Two-pass chamfer distance transform; accurate enough for glow falloffs. */
function chamferDT(feature, w, h) {
  const D = 1;
  const D2 = Math.SQRT2;
  const INF = 1e9;
  const d = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) d[i] = feature[i] ? 0 : INF;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let v = d[i];
      if (x > 0) v = Math.min(v, d[i - 1] + D);
      if (y > 0) {
        v = Math.min(v, d[i - w] + D);
        if (x > 0) v = Math.min(v, d[i - w - 1] + D2);
        if (x < w - 1) v = Math.min(v, d[i - w + 1] + D2);
      }
      d[i] = v;
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      let v = d[i];
      if (x < w - 1) v = Math.min(v, d[i + 1] + D);
      if (y < h - 1) {
        v = Math.min(v, d[i + w] + D);
        if (x < w - 1) v = Math.min(v, d[i + w + 1] + D2);
        if (x > 0) v = Math.min(v, d[i + w - 1] + D2);
      }
      d[i] = v;
    }
  }
  return d;
}

/* Rasterizes an image contain-fit into res x res and bakes a signed distance
 * field: R channel encodes distance in texture-UV units, 0.5 = the edge. */
function buildMaskSDF(image, res = 320) {
  const cnv = document.createElement('canvas');
  cnv.width = res;
  cnv.height = res;
  const ctx = cnv.getContext('2d', { willReadFrequently: true });
  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  const s = Math.min(res / iw, res / ih) * 0.92;
  const dw = iw * s;
  const dh = ih * s;
  ctx.clearRect(0, 0, res, res);
  ctx.drawImage(image, (res - dw) / 2, (res - dh) / 2, dw, dh);
  const alpha = ctx.getImageData(0, 0, res, res).data;

  const inside = new Uint8Array(res * res);
  const outside = new Uint8Array(res * res);
  for (let i = 0; i < res * res; i++) {
    const a = alpha[i * 4 + 3] > 127;
    inside[i] = a ? 1 : 0;
    outside[i] = a ? 0 : 1;
  }
  const dIn = chamferDT(inside, res, res);
  const dOut = chamferDT(outside, res, res);

  const data = new Uint8Array(res * res * 4);
  for (let i = 0; i < res * res; i++) {
    // canvas rows are top-down, texture rows bottom-up
    const y = res - 1 - Math.floor(i / res);
    const src = y * res + (i % res);
    const signed = (dIn[src] - dOut[src]) / res; // uv units, negative inside
    const enc = Math.round(Math.max(0, Math.min(1, signed + 0.5)) * 255);
    data[i * 4] = enc;
    data[i * 4 + 1] = enc;
    data[i * 4 + 2] = enc;
    data[i * 4 + 3] = 255;
  }
  return { data, size: res };
}

/* Accepts raw '<svg ...>' markup, a data URL, or an image URL. */
function loadMaskImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src.trim().startsWith('<')
      ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src)
      : src;
  });
}

function makeMaskTexture(sdf) {
  const tex = new THREE.DataTexture(sdf.data, sdf.size, sdf.size, THREE.RGBAFormat);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

const DUMMY_SDF = { data: new Uint8Array([255, 255, 255, 255]), size: 1 };

function damp(current, target, lambda, dt) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

/* --- the component -------------------------------------------------------- */

export class LightComponent {
  constructor(element, definition, options = {}) {
    this.el = element;
    this.def = definition;
    this.dpr = Math.min(window.devicePixelRatio || 1, options.maxDpr || 2);
    // canvas extends past the element on every side so glow isn't clipped.
    // 0.6 gives enough room even on very flat/wide elements (e.g. buttons),
    // where the short axis previously clipped glow/bloom into a hard edge.
    this.bleed = options.bleed === undefined ? 0.6 : options.bleed;

    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    const canvas = document.createElement('canvas');
    const pct = this.bleed * 100;
    Object.assign(canvas.style, {
      position: 'absolute',
      left: `-${pct}%`, top: `-${pct}%`,
      width: `${100 + 2 * pct}%`, height: `${100 + 2 * pct}%`,
      zIndex: '0', pointerEvents: 'none', display: 'block',
    });
    element.prepend(canvas);
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
    this.camera.position.z = 0.5;

    this.uniforms = {
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_bleed: { value: this.bleed },
      u_time: { value: 0 },
      u_hover: { value: 0 },
      u_pulse: { value: 0 },
      u_lightPos: { value: new THREE.Vector2(0.5, 0.5) },
      u_shapeType: { value: 1 },
      u_shapeSize: { value: 0.8 },
      u_cornerRadius: { value: 0.2 },
      u_sides: { value: 6 },
      u_rotation: { value: 0 },
      u_strokeWidth: { value: 0 },
      u_mask: { value: makeMaskTexture(DUMMY_SDF) },
      u_blur: { value: 0 },
      u_dissolve: { value: 0 },
      u_glowIntensity: { value: 0 },
      u_glowRadius: { value: 0.3 },
      u_bloom: { value: 0 },
      u_scatter: { value: 0 },
      u_fresnel: { value: 0 },
      u_noiseAmount: { value: 0 },
      u_noiseScale: { value: 6 },
      u_noiseSpeed: { value: 0.3 },
      u_chromatic: { value: 0 },
      u_fillOpacity: { value: 1 },
      u_opacity: { value: 1 },
      u_gradientAngle: { value: 0 },
      u_intensity: { value: 1 },
      u_colors: { value: Array.from({ length: MAX_COLOR_STOPS }, () => new THREE.Vector3(1, 1, 1)) },
      u_colorsHover: { value: Array.from({ length: MAX_COLOR_STOPS }, () => new THREE.Vector3(1, 1, 1)) },
      u_colorCount: { value: 2 },
      u_glowColor: { value: new THREE.Vector3(1, 1, 1) },
      u_glowColorHover: { value: new THREE.Vector3(1, 1, 1) },
      u_cursorFocusRadius: { value: CURSOR_LENS_DEFAULTS.cursorFocusRadius },
      u_cursorFocusEdge: { value: CURSOR_LENS_DEFAULTS.cursorFocusEdge },
      u_cursorRadius: { value: CURSOR_LENS_DEFAULTS.cursorRadius },
      u_cursorEdge: { value: CURSOR_LENS_DEFAULTS.cursorEdge },
      u_cursorAspect: { value: CURSOR_LENS_DEFAULTS.cursorAspect },
      u_cursorExpand: { value: CURSOR_LENS_DEFAULTS.cursorExpand },
      u_cursorColorLeak: { value: CURSOR_LENS_DEFAULTS.cursorColorLeak },
      u_cursorTransparency: { value: CURSOR_LENS_DEFAULTS.cursorTransparency },
    };

    // Whether the material blends as premultiplied. Default false keeps the
    // original compositing for every existing component. A component can opt in
    // (def.render.premultiplied) to fix the gray cast a soft fade otherwise
    // picks up — the shader outputs premultiplied colour, so a premultiplied
    // blend composites the fade in its true colour instead of toward gray.
    // Only tags need it; see makeMaterial / the rebuild in frame().
    this.premultiplied = !!(definition.render && definition.render.premultiplied);
    this.material = this.makeMaterial(this.premultiplied);
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.material);
    this.scene.add(this.mesh);

    this.hoverT = 0;
    this.hoverTarget = 0;
    this.pulse = 0;
    this.mouse = [0.5, 0.5];
    this.lightT = [0.5, 0.5];
    this.hovering = false;
    this.maskSrcLoaded = null;
    this.lastTime = performance.now() / 1000;

    this.onEnter = () => { this.hovering = true; };
    this.onLeave = () => { this.hovering = false; };
    this.onMove = (e) => {
      const r = this.el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        this.mouse = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
      }
    };
    this.onDown = () => {
      if (this.def.interaction.clickPulse) this.pulse = 1;
    };
    element.addEventListener('pointerenter', this.onEnter);
    element.addEventListener('pointerleave', this.onLeave);
    element.addEventListener('pointermove', this.onMove);
    element.addEventListener('pointerdown', this.onDown);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(element);
    this.resize();
    this.syncShape();

    this.raf = 0;
    const loop = () => {
      this.frame();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  makeMaterial(premultiplied) {
    return new THREE.ShaderMaterial({
      vertexShader: LIGHTFX_VERTEX,
      fragmentShader: LIGHTFX_FRAGMENT,
      transparent: true,
      premultipliedAlpha: !!premultiplied,
      uniforms: this.uniforms,
    });
  }

  resize() {
    const w = this.el.clientWidth;
    const h = this.el.clientHeight;
    if (w === 0 || h === 0) return;
    const span = 1 + 2 * this.bleed;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(Math.round(w * span), Math.round(h * span), false);
    // u_resolution stays element-sized: all shader params are element-relative
    this.uniforms.u_resolution.value.set(w * this.dpr, h * this.dpr);
  }

  /* Call after mutating definition.shape (params sync live every frame). */
  syncShape() {
    const s = this.def.shape;
    const u = this.uniforms;
    u.u_shapeType.value = Math.max(SHAPE_TYPES.indexOf(s.type), 0);
    u.u_shapeSize.value = s.size;
    u.u_cornerRadius.value = s.cornerRadius;
    u.u_sides.value = s.sides;
    u.u_rotation.value = (s.rotation * Math.PI) / 180;
    u.u_strokeWidth.value = s.strokeWidth || 0;
    if (s.type === 'mask' && s.maskSrc && s.maskSrc !== this.maskSrcLoaded) {
      const src = s.maskSrc;
      this.maskSrcLoaded = src;
      loadMaskImage(src).then((img) => {
        if (this.maskSrcLoaded !== src) return;
        const old = u.u_mask.value;
        u.u_mask.value = makeMaskTexture(buildMaskSDF(img));
        old.dispose();
      }).catch(() => {});
    }
  }

  setDefinition(def) {
    this.def = def;
    this.syncShape();
  }

  frame() {
    const now = performance.now() / 1000;
    const dt = Math.min(now - this.lastTime, 0.1);
    this.lastTime = now;

    const def = this.def;
    const inter = def.interaction;
    const u = this.uniforms;
    const speed = inter.speed || 6;

    this.hoverTarget = inter.hover && this.hovering ? 1 : 0;
    this.hoverT = damp(this.hoverT, this.hoverTarget, speed, dt);
    this.pulse = Math.max(this.pulse - dt * 1.1, 0);

    const rest = inter.lightPos || [0.5, 0.5];
    const lt = inter.cursorLight && this.hovering ? this.mouse : rest;
    this.lightT[0] = damp(this.lightT[0], lt[0], speed, dt);
    this.lightT[1] = damp(this.lightT[1], lt[1], speed, dt);

    u.u_time.value = now;
    u.u_hover.value = this.hoverT;
    u.u_pulse.value = this.pulse;
    u.u_lightPos.value.set(this.lightT[0], this.lightT[1]);
    u.u_intensity.value = def.intensity == null ? 1 : def.intensity;

    // per-component render flags — default off, so any component without a
    // `render` block behaves exactly as before. Only opted-in defs (tags)
    // dissolve their blur or switch to premultiplied compositing.
    const render = def.render || {};
    u.u_dissolve.value = render.dissolve ? 1 : 0;
    if (!!render.premultiplied !== this.premultiplied) {
      this.premultiplied = !!render.premultiplied;
      const oldMat = this.material;
      this.material = this.makeMaterial(this.premultiplied);
      this.mesh.material = this.material;
      oldMat.dispose();
    }
    // fall back to CURSOR_LENS_DEFAULTS for definitions saved before these
    // fields existed
    u.u_cursorFocusRadius.value = inter.cursorFocusRadius ?? CURSOR_LENS_DEFAULTS.cursorFocusRadius;
    u.u_cursorFocusEdge.value = inter.cursorFocusEdge ?? CURSOR_LENS_DEFAULTS.cursorFocusEdge;
    u.u_cursorRadius.value = inter.cursorRadius ?? CURSOR_LENS_DEFAULTS.cursorRadius;
    u.u_cursorEdge.value = inter.cursorEdge ?? CURSOR_LENS_DEFAULTS.cursorEdge;
    u.u_cursorAspect.value = inter.cursorAspect ?? CURSOR_LENS_DEFAULTS.cursorAspect;
    u.u_cursorExpand.value = inter.cursorExpand ?? CURSOR_LENS_DEFAULTS.cursorExpand;
    // colorOnHover off suppresses the fill/glow color bleed entirely — every
    // other cursor-lens/hover effect (blur, glow, bloom, scatter, ...) keeps
    // interpolating normally, this only zeroes the color-mix term.
    u.u_cursorColorLeak.value = inter.colorOnHover === false
      ? 0
      : (inter.cursorColorLeak ?? CURSOR_LENS_DEFAULTS.cursorColorLeak);
    u.u_cursorTransparency.value = inter.cursorTransparency ?? CURSOR_LENS_DEFAULTS.cursorTransparency;

    const k = this.hoverT;
    const base = def.params.base;
    const hover = def.params.hover;
    const effBase = def.effects.base || def.effects;
    const effHover = def.effects.hover || def.effects;
    for (const key in PARAM_TYPES) {
      const gateFx = PARAM_GATE[key];
      const uni = u['u_' + key];
      if (PARAM_TYPES[key] === 'c') {
        // colors aren't pre-mixed here — the shader blends base -> hover
        // per-fragment around the cursor position (see `leak` in the
        // fragment shader), so the hover color bleeds in locally instead
        // of the whole shape recoloring at once.
        const a = hexToRGB(base[key]);
        const b = hexToRGB(hover[key]);
        uni.value.set(a[0], a[1], a[2]);
        u['u_' + key + 'Hover'].value.set(b[0], b[1], b[2]);
      } else {
        // each state's own toggle gates its own value, so a hover-only or
        // base-only effect still interpolates correctly across the blend
        let bVal = gateFx && effBase[gateFx] === false ? 0 : base[key];
        let hVal = gateFx && effHover[gateFx] === false ? 0 : hover[key];
        let v = bVal + (hVal - bVal) * k;
        if (key === 'gradientAngle') v = (v * Math.PI) / 180;
        uni.value = v;
      }
    }

    /* multi-stop fill gradient: base/hover aren't pre-mixed (see PARAM_TYPES
     * loop's comment above) — both full gradients are uploaded and the
     * shader blends between them per-fragment. If base and hover have a
     * different number of stops, the shorter one is padded by repeating its
     * last color so both arrays share one u_colorCount. */
    const baseColors = base.colors || ['#ffffff', '#ffffff'];
    const hoverColors = hover.colors || baseColors;
    const count = Math.min(Math.max(baseColors.length, hoverColors.length, 2), MAX_COLOR_STOPS);
    for (let i = 0; i < MAX_COLOR_STOPS; i++) {
      const bHex = baseColors[Math.min(i, baseColors.length - 1)];
      const hHex = hoverColors[Math.min(i, hoverColors.length - 1)];
      const b = hexToRGB(bHex);
      const h = hexToRGB(hHex);
      u.u_colors.value[i].set(b[0], b[1], b[2]);
      u.u_colorsHover.value[i].set(h[0], h[1], h[2]);
    }
    u.u_colorCount.value = count;

    if (this.el.clientWidth > 0 && this.el.clientHeight > 0) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.el.removeEventListener('pointerenter', this.onEnter);
    this.el.removeEventListener('pointerleave', this.onLeave);
    this.el.removeEventListener('pointermove', this.onMove);
    this.el.removeEventListener('pointerdown', this.onDown);
    this.uniforms.u_mask.value.dispose();
    this.renderer.dispose();
    this.canvas.remove();
  }
}
