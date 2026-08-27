// ServicesScrollDemo.jsx — demonstrates BottomShader's `atEnd`/`endShatter`
// scroll transition (see BottomShader.jsx) against Services.png, treated as
// the page's own scrollable content: a single tall image filling the
// document, with BottomShader fixed to the viewport's bottom edge (its own
// default positioning, unchanged) reading the page's own `window` scroll
// position to know when there's no more of the image left to scroll to.
//
// While there's still more image below the fold, the shader sits at its
// resting SCROLL_OVERLAY_SETTINGS, composited over the image via
// `mix-blend-mode: hard-light` (see bottom-shader.css's
// `.bottom-shader__canvas--overlay`). Once the page is scrolled to its
// true end, BottomShader eases shatter.scale/amount up to
// SCROLL_OVERLAY_END_SHATTER and crossfades the hard-light canvas into a
// plain, opaque `settings.output.color` cap — both driven by the same
// per-frame progress value inside BottomShader, so neither the shatter
// change nor the blend-mode removal ever happens as a sudden cut. Scrolling
// back up before the true end reverses the same transition, just as
// smoothly.
import { useEffect, useRef, useState } from 'react';
import { BottomShader } from './index.js';
import { SCROLL_OVERLAY_SETTINGS, SCROLL_OVERLAY_END_SHATTER } from './scroll-overlay-settings.js';
import { HALF_HEIGHT_LAYOUT } from './bottom-shader-definition.js';
import servicesImg from './Services.png';
import './services-scroll-demo.css';

// How close to the document's true bottom counts as "no more content to
// scroll" — a few px of slack rather than an exact `=== ` match, since
// fractional scroll positions (high-DPI displays, momentum scrolling) can
// leave scrollY a fraction of a pixel short of the literal maximum.
const END_THRESHOLD_PX = 4;

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
        settings={SCROLL_OVERLAY_SETTINGS}
        endShatter={SCROLL_OVERLAY_END_SHATTER}
        atEnd={atEnd}
        // Half the index.pen.html reference export's 50vh footer height
        // (see bottom-shader-definition.js's HALF_HEIGHT_LAYOUT) — same
        // feel, shorter strip. Its own fadeColor is already 'transparent'
        // (this usage has the image behind it, not a solid page
        // background), so only the host's own `background` still needs
        // overriding here.
        layout={HALF_HEIGHT_LAYOUT}
        style={{ background: 'transparent' }}
      />
    </div>
  );
}
