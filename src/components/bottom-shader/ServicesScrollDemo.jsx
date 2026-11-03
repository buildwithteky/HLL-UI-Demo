// ServicesScrollDemo.jsx — Services.png as the page's own content, with
// BottomShader (the only shader here — see BottomShader.jsx) sitting
// directly on top of it, fixed to the bottom of the viewport.
//
// While there's still more image below the fold, the shader is composited
// via `mix-blend-mode: hard-light` (`overlay` prop — see BottomShader.jsx/
// bottom-shader.css's `.bottom-shader--overlay`), reading the image behind
// it. Once the page is scrolled to its true end, that blended look gives
// way to a plain, unblended one showing the effect chain's own colors
// directly (both keep `settings.background.transparent`, so neither ever
// paints a solid backing plate — see REF_SETTINGS below).
//
// `mix-blend-mode` itself can't be CSS-transitioned (it's a discrete
// value, not an interpolable one), so a single BottomShader instance can
// only cut between the two looks instantly. To make that smooth, TWO
// BottomShader instances are mounted on top of each other here — one
// permanently blended, one permanently plain — and only their `opacity`
// (which DOES transition) crossfades between them as `atEnd` flips. Both
// are genuinely rendering (two live WebGL contexts) rather than one
// canvas somehow appearing twice; that's the actual cost of a real
// crossfade between two blend modes, acceptable for one demo instance.
import { useEffect, useRef, useState } from 'react';
import BottomShader from './BottomShader.jsx';
import BottomShaderControls from './BottomShaderControls.jsx';
import { DEFAULT_MASK_STOPS } from './bottom-shader-controls-schema.js';
import { DEFAULT_LAYOUT } from './bottom-shader-definition.js';
import servicesImg from './Services.png';
import './services-scroll-demo.css';

// How close to the document's true bottom counts as "no more content to
// scroll" — a few px of slack rather than an exact `===` match, since
// fractional scroll positions (high-DPI displays, momentum scrolling) can
// leave scrollY a fraction of a pixel short of the literal maximum.
const END_THRESHOLD_PX = 4;

// DEFAULT_LAYOUT's own FADE_COLOR (#ffffff — see bottom-shader-
// definition.js) is the soft top-edge fade: the effect eases in from the
// host's own background color over the top ~30% of the visible window
// instead of cutting off abruptly. A `REF_LAYOUT` with `fadeColor:
// 'transparent'` used to override this — that was only needed while
// `mix-blend-mode` was (incorrectly) applied to the canvas itself, where
// the fade's own opaque paint sat in FRONT of the canvas, unblended, and
// washed out the whole effect. Now that blend-mode lives on the host div
// (see BottomShader.jsx/bottom-shader.css's `.bottom-shader--overlay`),
// the fade is part of what gets blended as a single unit — hard-light
// against a fully-opaque-white region always resolves to white regardless
// of backdrop, so it reads as "fading up into the page" exactly as
// intended, not as a wash-out bug. Back to plain DEFAULT_LAYOUT.

// Copied verbatim from ref/index.pen.html's own `settings` object, with
// only `background.transparent: true` added so the canvas doesn't paint
// an opaque `#ffffff` plate over the image (the reference's own canvas
// rule sets `background: transparent` directly in CSS, which
// shader-runtime.js achieves via this settings flag instead) — kept on in
// BOTH the blended and unblended states, so the effect chain's own colors
// are always what's visible, never a solid backing plate.
const BASE_TUNE = {
  shatterOffsetScale: 0.2, shatterMinDist: 15, vignetteX: 0.5, sineX: 0.5,
  shatterTurns: 2, shatterCellScale: 50, softness: 1.3, vignetteFalloffFactor: 0.8,
  bokehWeightBase: 5, bokehWeightPow: 9, bokehWeightScale: 100,
  sineFrequencyScale: 27, sineAmplitudeScale: 0.19, bokehJitter: 0.05,
  shatterRandMul: 43758.5453, bokehNoiseScale: 0.01, bokehJitterFreqA: 0.1,
  bokehBaseSize: 0.003, pointerSmoothing: 0.1,
};
const makeSettings = (shatterAmount, tune) => ({
  background: { color: '#ffffff', transparent: true },
  vignette: { radius: 1, falloff: 1, displace: 0, mix: 1, angle: 0, skew: 0.54 },
  sine: { frequency: 0.35, amplitude: 3.18, falloff: 0.5, rotation: 0, phase: 0, speed: 0.1, mixRadius: 1, trackMouse: 0 },
  shatter: { scale: 1, amount: shatterAmount, angle: 44, skew: 1.25, mixRadius: 1, trackMouse: 1 },
  bokeh: { mixRadius: 1, trackMouse: 0, radius: 69, tilt: 0.5, spread: 1.2 },
  output: { color: '#ffffff', aberration: 0.006, blendStrength: 0.95, capAmount: 0 },
  tune: { ...BASE_TUNE, ...tune },
});
const REF_SETTINGS = makeSettings(0.4, { vignetteFollow: 0.9 });
const END_SETTINGS = makeSettings(1, {});
const TUNED_COLORS = ['#FF1F1F', '#72AAFF'];

function makeConfig(o) {
  return {
    colors: [...TUNED_COLORS],
    hostHeight: 50,
    hostHeightUnit: 'vh',
    canvasHeight: 100,
    canvasHeightUnit: 'vh',
    fadeStart: 10,
    fadeEnd: 80,
    fadeMinAlpha: 0,
    fadeMaxAlpha: 1,
    fadeCurve: 1.5,
    manualStops: false,
    opacity: 1,
    blendMode: 'hard-light',
    fadeColor: '#ffffff',
    maskStops: DEFAULT_MASK_STOPS,
    ...o,
  };
}
const REF_CONFIG = {};
const END_CONFIG = { hostHeight: 60, fadeEnd: 70, fadeCurve: 1.25, blendMode: 'normal' };

// Inline CSS for the host from the panel config (layout vars + top-edge mask).
function hostStyle(c, visible) {
  let pts;
  if (c.manualStops) pts = c.maskStops;
  else {
    // Generated fade: transparent-ish above fadeStart, ramps (curve) to fadeEnd, solid below.
    const span = c.fadeEnd - c.fadeStart || 1e-6;
    pts = [[0, c.fadeMinAlpha]];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const eased = Math.sign(t) * Math.abs(t) ** c.fadeCurve;
      pts.push([c.fadeStart + span * t, c.fadeMinAlpha + (c.fadeMaxAlpha - c.fadeMinAlpha) * eased]);
    }
    pts.push([100, c.fadeMaxAlpha]);
    pts.sort((a, b) => a[0] - b[0]);
  }
  const stops = pts.map(([p, a]) => `rgba(0,0,0,${a}) ${p}%`).join(', ');
  const mask = `linear-gradient(to bottom, ${stops})`;
  return {
    '--bottom-shader-height': `${c.hostHeight}${c.hostHeightUnit}`,
    '--bottom-shader-canvas-height': `${c.canvasHeight}${c.canvasHeightUnit}`,
    '--bottom-shader-fade-color': c.fadeColor,
    WebkitMaskImage: mask,
    maskImage: mask,
    mixBlendMode: c.blendMode,
    background: 'transparent',
    opacity: visible ? c.opacity : 0,
    transition: 'opacity 0.6s ease',
    pointerEvents: 'none',
  };
}

export default function ServicesScrollDemo() {
  const [atEnd, setAtEnd] = useState(false);
  // Live, in-place-mutable settings (one per instance) + panel config.
  const mainSettings = useRef(JSON.parse(JSON.stringify(REF_SETTINGS)));
  const endSettings = useRef(JSON.parse(JSON.stringify(END_SETTINGS)));
  const [mainCfg, setMainCfg] = useState(() => makeConfig(REF_CONFIG));
  const [endCfg, setEndCfg] = useState(() => makeConfig(END_CONFIG));
  const tickingRef = useRef(false);

  useEffect(() => {
    function checkEnd() {
      tickingRef.current = false;
      const doc = document.documentElement;
      const scrolledToEnd = window.scrollY + window.innerHeight >= doc.scrollHeight - END_THRESHOLD_PX;
      setAtEnd(scrolledToEnd);
    }
    function onScroll() {
      // rAF-throttled the same way shader-runtime.js's own resize/pointer
      // handling avoids doing layout-reading work on every single scroll
      // event — `document.documentElement.scrollHeight` is a layout read.
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(checkEnd);
    }
    checkEnd();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="services-scroll-demo">
      <img src={servicesImg} alt="Services" className="services-scroll-demo__image" />
      <BottomShader
        variant="services"
        colors={mainCfg.colors}
        liveSettings={mainSettings.current}
        layout={DEFAULT_LAYOUT}
        style={hostStyle(mainCfg, !atEnd)}
      />
      <BottomShader
        variant="services"
        colors={endCfg.colors}
        liveSettings={endSettings.current}
        layout={DEFAULT_LAYOUT}
        style={hostStyle(endCfg, atEnd)}
      />
      <BottomShaderControls
        targets={[
          { id: 'main', label: 'Scrolling look', settings: mainSettings.current, config: mainCfg, setConfig: setMainCfg },
          { id: 'end', label: 'End-of-page look', settings: endSettings.current, config: endCfg, setConfig: setEndCfg },
        ]}
      />
    </div>
  );
}
