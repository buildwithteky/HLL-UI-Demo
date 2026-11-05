// hooks.js — page-wide, auto-detecting reveal hooks built on the shared cores.
// Call them once per page root; they find eligible text / media on their own
// (and pick up nodes added later). For one specific element use <TextReveal>
// or <ImageReveal> instead.
import { useEffect } from 'react';
import {
  createWordObserver, splitWords, prefersReducedMotion, setWordsHidden, WORD_CLASS,
} from './text-reveal-core.js';
import { scrubImage, bindImageTrigger, IMAGE_REVEAL_DEFAULTS } from './image-reveal-core.js';

/* ---------------------------------------------------------------- text */

const SKIP_TAGS = new Set(['A', 'BUTTON', 'LABEL', 'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'TITLE', 'CODE', 'PRE', 'TIME', 'SUMMARY']);
const SKIP_CLOSEST = "button, label, nav, svg, canvas, [role='button'], [role='tab'], [role='menuitem'], [role='dialog'], [contenteditable], [aria-hidden='true'], [data-no-text-scroll], [class*='gtr-']";

function textEligible(el, text, skipSelector) {
  if (SKIP_TAGS.has(el.tagName) || el.closest(skipSelector)) return false;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words < (/^H[2-6]$/.test(el.tagName) ? 2 : 3)) return false;
  const own = getComputedStyle(el);
  if (own.webkitLineClamp && own.webkitLineClamp !== 'none') return false;
  if (own.textOverflow === 'ellipsis') return false;
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    const pos = getComputedStyle(n).position;
    if (pos === 'fixed' || pos === 'sticky') return false;
  }
  return true;
}

/**
 * Word-by-word reveal for every eligible text block under `rootRef`
 * (plain text elements of 3+ words, 2+ for headings).
 * options: TEXT_REVEAL_DEFAULTS fields (stagger, total, delay, durations, enter,
 * leave) plus `skip` — an extra CSS selector of elements to leave alone.
 * Opt a single element out with data-no-text-scroll.
 */
export function useTextReveal(rootRef, options = {}) {
  const optionsKey = JSON.stringify(options);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;
    const { skip, ...revealOptions } = options;
    const skipSelector = skip ? `${SKIP_CLOSEST}, ${skip}` : SKIP_CLOSEST;
    const observer = createWordObserver(revealOptions);
    const blocks = new Map();

    const split = (el) => {
      const node = el.firstChild;
      if (!node || node.nodeType !== Node.TEXT_NODE || el.childNodes.length !== 1) return;
      const text = node.textContent || '';
      if (!textEligible(el, text, skipSelector)) return;
      const words = splitWords(el, text);
      blocks.set(el, text);
      observer.observe(el, words);
    };
    const seen = new WeakSet();
    const scan = (scope) => {
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
      const parents = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const p = n.parentElement;
        if (p && !seen.has(p) && p.childNodes.length === 1) parents.push(p);
      }
      parents.forEach((p) => { seen.add(p); split(p); });
    };
    scan(root);
    const mutations = new MutationObserver((records) => {
      for (const rec of records) rec.addedNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE) {
          if (n instanceof HTMLElement && n.classList.contains(WORD_CLASS)) return;
          scan(n.nodeType === Node.TEXT_NODE ? n.parentElement || root : n);
        }
      });
    });
    mutations.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect(); mutations.disconnect();
      blocks.forEach((text, el) => { if (el.isConnected) el.replaceChildren(document.createTextNode(text)); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef, optionsKey]);
}

/* --------------------------------------------------------------- image */

const CANDIDATES = "img, video, [style*='url(']";
const NUMERIC = ['rate', 'startOffset', 'heightRange', 'margin', 'maxBlur'];

function imageEligible(el) {
  if (el.closest("[data-no-image-reveal], nav, [role='dialog'], [data-image-scrub]")) return false;
  for (let node = el; node && node !== document.body; node = node.parentElement) {
    const pos = getComputedStyle(node).position;
    if (pos === 'fixed' || pos === 'sticky') return false;
  }
  const style = getComputedStyle(el);
  if (!el.matches('img, video') && style.backgroundImage === 'none') return false;
  if (style.clipPath !== 'none') return false;
  return true;
}

/** Per-section tuning, read from the nearest [data-image-reveal] ancestor:
 *  data-image-reveal="scrub|fit", data-image-rate, data-image-start-offset, … */
function configFor(el) {
  const host = el.closest('[data-image-reveal]');
  if (!host) return {};
  const cfg = {};
  const mode = host.getAttribute('data-image-reveal');
  if (mode === 'scrub' || mode === 'fit') cfg.mode = mode;
  NUMERIC.forEach((key) => {
    const attr = `data-image-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
    const v = host.getAttribute(attr);
    if (v !== null && v !== '' && !Number.isNaN(Number(v))) cfg[key] = Number(v);
  });
  return cfg;
}

/** Image reveal for every <img>, <video> and CSS-background element under
 *  `rootRef`. Tune a section with data-image-reveal attributes; opt a single
 *  element out with data-no-image-reveal. */
export function useImageReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;
    const stops = new Map();
    const seen = new WeakSet();
    const watch = (scope, initial) => {
      scope.querySelectorAll(CANDIDATES).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (!imageEligible(el)) return;
        const r = el.getBoundingClientRect();
        // Media that appears later while already on screen is left alone.
        if (!initial && r.bottom > 0 && r.top < window.innerHeight) return;
        stops.set(el, scrubImage(el, configFor(el)));
      });
    };
    watch(root, true);
    const mutations = new MutationObserver((records) => {
      for (const rec of records) rec.addedNodes.forEach((n) => {
        if (n instanceof HTMLElement) { if (n.matches(CANDIDATES)) watch(n.parentElement || root, false); watch(n, false); }
      });
    });
    mutations.observe(root, { childList: true, subtree: true });
    return () => { mutations.disconnect(); stops.forEach((stop) => stop()); };
  }, [rootRef]);
}

/* ---------------------------------------------------------------- cards */

const CARD_TEXT_DEFAULTS = {
  stagger: 120, total: 1100,
  durations: { opacity: 520, blur: 680, transform: 750 },
  enter: { rootMargin: '0px 0px -8% 0px', threshold: 0.6 },
  leave: { rootMargin: '0px 0px -8% 0px' },
};

/**
 * Card reveal: for each card, the words of its text elements reveal together
 * (staggered) once the text block is mostly on screen, and its image plays the
 * time-based image reveal once the card is entering. Viewport-triggered, not
 * scroll-mapped. options: { card, text, image } CSS selectors (card required),
 * plus `textOptions` / `imageOptions` overriding the defaults above.
 */
export function useCardReveal(rootRef, { card, text, image, textOptions, imageOptions } = {}) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !card || prefersReducedMotion()) return undefined;
    const observer = createWordObserver({ ...CARD_TEXT_DEFAULTS, ...textOptions });
    const restore = [];
    const stops = [];

    root.querySelectorAll(card).forEach((cardEl) => {
      const words = [];
      if (text) {
        cardEl.querySelectorAll(text).forEach((el) => {
          const node = el.firstChild;
          if (!node || node.nodeType !== Node.TEXT_NODE || el.childNodes.length !== 1) return;
          const original = node.textContent || '';
          words.push(...splitWords(el, original));
          restore.push([el, original]);
        });
      }
      if (words.length) {
        setWordsHidden(words);
        // The trigger is the text block (the first word's grandparent keeps the
        // name + role wrapper together), so both lines reveal as one.
        observer.observe(words[0].parentElement.parentElement, words);
      }
      const img = image && cardEl.querySelector(image);
      if (img) stops.push(bindImageTrigger(img, { blur: true, ...imageOptions }));
    });

    return () => {
      observer.disconnect();
      stops.forEach((stop) => stop());
      restore.forEach(([el, original]) => { if (el.isConnected) el.replaceChildren(document.createTextNode(original)); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef, card, text, image]);
}

export { IMAGE_REVEAL_DEFAULTS };
