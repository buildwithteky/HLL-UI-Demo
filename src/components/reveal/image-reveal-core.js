// image-reveal-core.js — framework-free engine for the image reveal: the media's
// height grows from its top edge while it sharpens from a blur. Used by
// <ImageReveal>, the page-wide useImageReveal hook and the card hook.
//
// Two drivers share the same visual:
//  - scrubber  (modes 'scrub' and 'fit'): progress follows the element's
//    viewport position, one-way — scrolling up never hides a revealed image;
//    it resets only after leaving through the bottom, so it replays going down.
//  - trigger   (bindImageTrigger): time-based; plays when the element enters
//    the viewport (threshold + inset configurable).
//
// 'scrub' is taken from www.davidebaratta.com/index-top.html: height
// t = (vh - top) / (0.9 vh); blur = 16px × (1 - b),
// b = (0.5 vh - top) / ((vh - 100 - 0.5 vh) / 2).
// 'fit' completes once the image is fully visible (+ margin), whatever the
// screen: p = (vh - top) / (height + margin × vh).
import './reveal.css';

export const IMAGE_REVEAL_DEFAULTS = {
  mode: 'scrub',      // 'scrub' | 'fit'
  rate: 1,            // scrub: >1 finishes in proportionally less scroll
  startOffset: 0.97,  // scrub: starts once the top is this fraction of the viewport down
  heightRange: 0.9,   // scrub: viewport fractions over which the height grows
  margin: 0.08,       // fit: extra viewport fraction after fully visible
  maxBlur: 16,        // px
};

const FULL_CLIP = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
const HIDDEN_CLIP = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';
const DRIVEN = new Set(['filter', 'clip-path', 'all']);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Pure: reveal progress { t: height, b: sharpness } for one element position. */
export function imageProgress(rect, vh, cfg) {
  if (cfg.mode === 'fit') {
    const p = clamp01((vh - rect.top) / (rect.height + vh * cfg.margin));
    return { t: p, b: p };
  }
  const start = vh - 100;
  const end = vh * 0.5;
  return {
    t: clamp01((cfg.rate * Math.max(0, vh * cfg.startOffset - rect.top)) / (vh * cfg.heightRange)),
    b: clamp01((cfg.rate * (end - rect.top)) / ((start - end) / 2)),
  };
}

function paint(item, t, b) {
  if (t === item.t && b === item.b) return;
  item.t = t; item.b = b;
  const { el, cfg } = item;
  // Height animation: the visible height grows from the top edge to full.
  el.style.clipPath = t >= 1 ? '' : `polygon(0% 0%, 100% 0%, 100% ${(t * 100).toFixed(3)}%, 0% ${(t * 100).toFixed(3)}%)`;
  if (item.blurs) {
    const blur = b >= 1 ? '' : `blur(${(cfg.maxBlur * (1 - b)).toFixed(2)}px)`;
    el.style.filter = blur && item.ownFilter !== 'none' ? `${item.ownFilter} ${blur}` : blur;
  }
}

/* One shared scrubber (single scroll/resize listener + observer) for every
   tracked element on the page; created on first use, torn down when empty. */
let shared = null;

function createScrubber() {
  const items = new Map();
  const visible = new Set();
  let frame = 0;

  const update = (item) => {
    const { t, b } = imageProgress(item.el.getBoundingClientRect(), window.innerHeight, item.cfg);
    paint(item, Math.max(t, item.t), Math.max(b, item.b)); // one-way: never runs backwards
  };
  const tick = () => { frame = 0; visible.forEach((el) => { const i = items.get(el); if (i) update(i); }); };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(tick); };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const item = items.get(entry.target);
      if (!item) continue;
      if (entry.isIntersecting) visible.add(entry.target);
      else {
        visible.delete(entry.target);
        const above = entry.boundingClientRect.top < 0;
        paint(item, above ? 1 : 0, above ? 1 : 0);
      }
    }
    schedule();
  }, { rootMargin: '0px' });

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  const poll = window.setInterval(() => { if (!document.hidden) schedule(); }, 200);

  return {
    size: () => items.size,
    track(el, userCfg = {}) {
      if (items.has(el)) return;
      const cfg = { ...IMAGE_REVEAL_DEFAULTS, ...userCfg };
      const own = getComputedStyle(el);
      // The scrub owns filter / clip-path: stop the element's own CSS
      // transitions from smoothing (and so lagging) them.
      const props = own.transitionProperty.split(',').map((p) => p.trim());
      if (props.some((p) => DRIVEN.has(p))) {
        el.style.transitionProperty = props
          .map((p) => (p === 'all' ? 'opacity, transform, color, background-color, box-shadow' : p))
          .filter((p) => p !== 'filter' && p !== 'clip-path')
          .join(', ') || 'none';
      }
      el.dataset.imageScrub = '';
      items.set(el, { el, cfg, blurs: cfg.blur ?? el.matches('img, video'), ownFilter: own.filter, t: -1, b: -1 });
      observer.observe(el);
    },
    untrack(el) {
      const item = items.get(el);
      if (!item) return;
      observer.unobserve(el); visible.delete(el); items.delete(el);
      el.style.clipPath = ''; el.style.filter = ''; el.style.transitionProperty = '';
      delete el.dataset.imageScrub;
    },
    destroy() {
      if (frame) cancelAnimationFrame(frame);
      window.clearInterval(poll);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('load', schedule);
    },
  };
}

/** Scrub an element's reveal to its viewport position. Returns a stop function. */
export function scrubImage(el, cfg) {
  if (!shared) shared = createScrubber();
  const scrubber = shared;
  scrubber.track(el, cfg);
  return () => {
    scrubber.untrack(el);
    if (scrubber.size() === 0 && shared === scrubber) { scrubber.destroy(); shared = null; }
  };
}

export const IMAGE_TRIGGER_DEFAULTS = {
  duration: 1300,                          // ms
  delay: 0,                                // ms
  easing: 'cubic-bezier(.22, 1, .36, 1)',
  maxBlur: 16,                             // px
  threshold: 0.3,                          // fraction of the trigger element that must be visible
  target: null,                            // element to watch instead of the image itself (e.g. its card)
  rootMargin: '0px 0px -8% 0px',           // inset from the viewport edges
};

/**
 * Time-based reveal, played when the element enters the viewport (scrolling
 * down), reset once it has left through the bottom so it replays. Returns a
 * stop function that clears the inline styles.
 */
export function bindImageTrigger(el, userOptions) {
  const o = { ...IMAGE_TRIGGER_DEFAULTS, ...userOptions };
  let shown = false;
  const blurs = o.blur ?? true;
  const set = (show) => {
    if (shown === show) return;
    shown = show;
    el.style.clipPath = show ? FULL_CLIP : HIDDEN_CLIP;
    if (blurs) el.style.filter = show ? 'blur(0px)' : `blur(${o.maxBlur}px)`;
  };
  el.style.clipPath = HIDDEN_CLIP;
  if (blurs) el.style.filter = `blur(${o.maxBlur}px)`;
  const ms = `${o.duration}ms ${o.easing} ${o.delay}ms`;
  el.style.transition = blurs ? `clip-path ${ms}, filter ${ms}` : `clip-path ${ms}`;

  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.intersectionRatio >= o.threshold && e.isIntersecting) set(true);
      else if (!e.isIntersecting) set(e.boundingClientRect.top < 0); // above: shown, below: reset
    }
  }, { threshold: o.threshold > 0 ? [0, o.threshold] : 0, rootMargin: o.rootMargin });
  // `target` lets a larger container (a card) decide when the image plays, so
  // the threshold is a fraction of the card, not of the (smaller) image.
  observer.observe(o.target || el);
  return () => {
    observer.disconnect();
    el.style.clipPath = ''; el.style.filter = ''; el.style.transition = '';
  };
}
