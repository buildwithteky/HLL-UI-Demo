// scroll-effects.js — the remaining page-level scroll drivers (LineReveal,
// PageIntro), ported as hooks scoped to one page root. The text and image
// reveals live in src/components/reveal (TextReveal, ImageReveal, hooks).
import { useEffect } from 'react';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- LineReveal: [data-line] hairlines draw in left to right. ---------- */
export function useLineReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced()) return undefined;
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-visible');
        observer.unobserve(e.target);
      }
    }, { threshold: 0, rootMargin: '0px 0px -4% 0px' });
    const seen = new WeakSet();
    const watch = () => root.querySelectorAll('[data-line]:not(.is-visible)').forEach((l) => {
      if (seen.has(l)) return;
      seen.add(l); l.classList.add('line-draw-in'); observer.observe(l);
    });
    watch();
    const m = new MutationObserver(watch);
    m.observe(root, { childList: true, subtree: true });
    return () => { observer.disconnect(); m.disconnect(); };
  }, [rootRef]);
}

/* ---------- PageIntro: until the <h1> reveal ends only the title shows, then
   the rest of the page fades in (main[data-intro] pending → done). ---------- */
export function usePageIntro(mainRef) {
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return undefined;
    const title = main.querySelector('h1');
    let finished = false;
    const finish = () => { if (!finished) { finished = true; main.dataset.intro = 'done'; } };
    if (!title || reduced()) { finish(); return undefined; }
    let lastEnd = 0;
    const onEnd = () => { window.clearTimeout(lastEnd); lastEnd = window.setTimeout(finish, 120); };
    title.addEventListener('animationend', onEnd);
    const fallback = window.setTimeout(finish, 1600);
    return () => { title.removeEventListener('animationend', onEnd); window.clearTimeout(lastEnd); window.clearTimeout(fallback); };
  }, [mainRef]);
}
