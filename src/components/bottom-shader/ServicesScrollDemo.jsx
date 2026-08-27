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
const REF_SETTINGS = {
  background: { color: '#ffffff', transparent: true },
  vignette: { radius: 0.53, falloff: 2.6, skew: 0.0, angle: 0 },
  sine: { frequency: 0.32, amplitude: 7.4, rotation: 0, mixRadius: 0.8, trackMouse: 1 },
  shatter: { scale: 0.5, amount: 2.5, angle: 10, skew: 0.9, mixRadius: 1, trackMouse: 1 },
  bokeh: { radius: 0.82, tilt: 0.5, mixRadius: 1, trackMouse: 0 },
  output: { color: '#ffffff', aberration: 0.006, blendStrength: 0.85 },
};

// The plain (unblended) look's own settings — same object as bottom-
// shader/index.pen.html's own `settings` export, differing from
// REF_SETTINGS only in `shatter.scale`/`shatter.amount` (0.2/1.0 here vs.
// 0.5/2.5). This is what the second, permanently-`overlay={false}`
// instance below renders, so the crossfade at the page's true bottom
// eases into THIS shatter shape, not REF_SETTINGS's. `background.
// transparent: true` is added here too, same reason as REF_SETTINGS.
const END_SETTINGS = {
  background: { color: '#ffffff', transparent: true },
  vignette: { radius: 0.53, falloff: 2.6, skew: 0.0, angle: 0 },
  sine: { frequency: 0.32, amplitude: 7.4, rotation: 0, mixRadius: 0.8, trackMouse: 1 },
  shatter: { scale: 0.2, amount: 1.0, angle: 10, skew: 0.9, mixRadius: 1, trackMouse: 1 },
  bokeh: { radius: 0.82, tilt: 0.5, mixRadius: 1, trackMouse: 0 },
  output: { color: '#ffffff', aberration: 0.006, blendStrength: 0.85 },
};

export default function ServicesScrollDemo() {
  const [atEnd, setAtEnd] = useState(false);
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
        settings={REF_SETTINGS}
        overlay
        layout={DEFAULT_LAYOUT}
        style={{ background: 'transparent', opacity: atEnd ? 0 : 1, transition: 'opacity 0.6s ease', pointerEvents: 'none' }}
      />
      <BottomShader
        variant="services"
        settings={END_SETTINGS}
        overlay={false}
        layout={DEFAULT_LAYOUT}
        style={{ background: 'transparent', opacity: atEnd ? 1 : 0, transition: 'opacity 0.6s ease', pointerEvents: 'none' }}
      />
    </div>
  );
}
