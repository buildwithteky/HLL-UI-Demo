// text-reveal-core.js — framework-free engine for the word-by-word text reveal
// (blur + fade + scale, one word after another). Used by <TextReveal>, the
// page-wide useTextReveal hook and the card hook, so the logic lives in one place.
//
// Behaviour: words start hidden (.is-hidden). When the target enters the
// viewport they sharpen in sequence (time-based, not scroll-mapped). A target
// above the viewport is simply shown; one that has left entirely through the
// bottom is re-hidden off-screen so it replays on the way back down. Visible
// text is never faded by scrolling.
import './reveal.css';

export const WORD_CLASS = 'reveal-word';
export const HIDDEN_CLASS = 'is-hidden';

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Defaults — the site's existing values. Every field is overridable. */
export const TEXT_REVEAL_DEFAULTS = {
  stagger: 45,        // ms between words, at most
  total: 900,         // ms the whole stagger may take, at most (long text speeds up)
  delay: 0,           // ms before the first word starts
  durations: null,    // { opacity, blur, transform } in ms; null = CSS defaults (150 / 220 / 450)
  // Trigger: reveal once the target's top is 12% of the viewport height inside
  // the viewport (a fraction, so it adapts to any screen size).
  enter: { rootMargin: '0px 0px -12% 0px', threshold: 0 },
  // Reset / settle only once the target is entirely outside the viewport.
  leave: { rootMargin: '0px' },
};

const merge = (options = {}) => ({
  ...TEXT_REVEAL_DEFAULTS,
  ...options,
  enter: { ...TEXT_REVEAL_DEFAULTS.enter, ...options.enter },
  leave: { ...TEXT_REVEAL_DEFAULTS.leave, ...options.leave },
});

/** Replace an element's single text node with one .reveal-word span per word. */
export function splitWords(el, text = el.textContent || '') {
  const frag = document.createDocumentFragment();
  const words = text.trim().split(/\s+/).filter(Boolean).map((part, i) => {
    const span = document.createElement('span');
    span.className = `${WORD_CLASS} ${HIDDEN_CLASS}`;
    span.textContent = part;
    if (i) frag.append(' ');
    frag.append(span);
    return span;
  });
  el.replaceChildren(frag);
  return words;
}

export function setWordsHidden(words) {
  words.forEach((w) => w.classList.add(HIDDEN_CLASS));
}

function showWords(words, options, animate) {
  const step = animate ? Math.min(options.stagger, options.total / words.length) : 0;
  const base = animate ? options.delay : 0;
  const d = options.durations;
  words.forEach((w, i) => {
    w.style.transitionDelay = `${Math.round(base + i * step)}ms`;
    if (d) {
      if (d.opacity != null) w.style.setProperty('--reveal-opacity-ms', `${d.opacity}ms`);
      if (d.blur != null) w.style.setProperty('--reveal-blur-ms', `${d.blur}ms`);
      if (d.transform != null) w.style.setProperty('--reveal-transform-ms', `${d.transform}ms`);
    }
    w.classList.remove(HIDDEN_CLASS);
  });
}

function hideWords(words) {
  words.forEach((w) => {
    w.style.transitionDelay = '0ms';
    w.style.removeProperty('--reveal-opacity-ms');
    w.style.removeProperty('--reveal-blur-ms');
    w.style.removeProperty('--reveal-transform-ms');
    w.classList.add(HIDDEN_CLASS);
  });
}

/**
 * One pair of IntersectionObservers shared by any number of targets.
 * observe(target, words): `words` are revealed together when `target` enters.
 */
export function createWordObserver(userOptions) {
  const options = merge(userOptions);
  const targets = new Map();
  const th = options.enter.threshold;

  const show = (state, animate) => {
    if (state.shown) return;
    state.shown = true;
    showWords(state.words, options, animate);
  };
  const hide = (state) => {
    if (!state.shown) return;
    state.shown = false;
    hideWords(state.words);
  };

  const enter = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const state = targets.get(e.target);
      if (state && e.isIntersecting && e.intersectionRatio >= th) show(state, true);
    }
  }, { rootMargin: options.enter.rootMargin, threshold: th > 0 ? [0, th] : 0 });

  const leave = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const state = targets.get(e.target);
      if (!state || e.isIntersecting) continue;
      if (e.boundingClientRect.top < 0) show(state, false); // above: already read
      else hide(state);                                       // below: replay later
    }
  }, { rootMargin: options.leave.rootMargin });

  return {
    observe(target, words) {
      targets.set(target, { words, shown: false });
      enter.observe(target);
      leave.observe(target);
    },
    unobserve(target) {
      enter.unobserve(target); leave.unobserve(target); targets.delete(target);
    },
    disconnect() { enter.disconnect(); leave.disconnect(); targets.clear(); },
  };
}
