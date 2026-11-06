// HomeMedia.jsx — the Home page: the media + animation build of the
// hll-website homepage (images/logos/portraits and the site-wide scroll
// drivers). It is the only home page; '#/home' and '#/home-media' both route
// here. Originally rebuilt from the demo's existing
// components only: GradientRevealTextSlow (headings), HLLButton /
// HLLOutlineButton (nav, CTAs).
// Everything else here is layout glue (home.css) and local page logic
// (scroll-scaled hero, capabilities wheel, marquee, count-up, carousel).

/* =============================================================================
   ANIMATIONS ON THIS PAGE — quick reference
   -----------------------------------------------------------------------------
   Text + image reveals come from ONE reusable package: src/components/reveal/
   (import { TextReveal, ImageReveal, useTextReveal, useImageReveal,
   useCardReveal } from '../../components/reveal').

   TEXT — word-by-word blur + fade + scale, played when text enters the viewport
     • Automatic (page-wide): useTextReveal(pageRef) in HomeMedia() below finds
       every plain paragraph / subtext (3+ words; 2+ for h2–h6) and animates it.
       Opt one element out with  data-no-text-scroll  or add its selector to
       TEXT_REVEAL_SKIP.
     • Explicit (one element): <TextReveal as="span" …>text</TextReveal>
       (used for the How We Work step title/body in HowWeWork()).
     • Cards: useCardReveal() animates the Team cards' name/role + photo.
     • Headings are NOT part of this: they use the separate gradient reveal
       (<GradientRevealTextSlow>, src/components/heading-anim-slow).

   IMAGE — height grows from the top edge while the image sharpens from a blur
     • Automatic (page-wide): useImageReveal(pageRef) scrubs every <img>, <video>
       and CSS-background element. One-way: scrolling up never hides a revealed
       image; it resets after leaving through the bottom and replays going down.
     • Tuned per section with data-image-reveal attributes (Clients, Impact).
     • Explicit (one element): <ImageReveal …/> (modes: scrub | fit | trigger).
     • Opt one image out with  data-no-image-reveal.

   WHERE TO CHANGE WHAT (the values live in the reusable package, not here)
     Text timing / trigger   src/components/reveal/text-reveal-core.js
         TEXT_REVEAL_DEFAULTS: stagger 45ms, total 900ms, delay 0,
         enter.rootMargin '0px 0px -12% 0px' (plays once the top is 12% of the
         viewport height inside), enter.threshold 0, leave.rootMargin '0px'.
     Text look / easing      src/components/reveal/reveal.css
         per-word durations (opacity 150ms, blur 220ms, transform 450ms),
         easing cubic-bezier(.075,.82,.165,1), hidden state (opacity .4,
         blur 15px, scale .85) — all CSS variables (--reveal-*).
     Image scrub / blur      src/components/reveal/image-reveal-core.js
         IMAGE_REVEAL_DEFAULTS: mode 'scrub', rate 1, startOffset .97,
         heightRange .9, margin .08 ('fit'), maxBlur 16px.
         IMAGE_TRIGGER_DEFAULTS ('trigger' mode): duration 1300ms, delay 0,
         easing cubic-bezier(.22,1,.36,1), threshold .3, rootMargin
         '0px 0px -8% 0px', maxBlur 16px.
     Which text / media is picked up automatically
                             src/components/reveal/hooks.js
         (eligibility rules, word-count minimums, CARD_TEXT_DEFAULTS for cards)
     Heading reveal speed    src/components/heading-anim-slow/

   PROPS vs INTERNAL
     • Per instance, via props / data attributes (no package edit needed):
       <TextReveal stagger total delay durations enterOffset threshold>,
       <ImageReveal mode rate startOffset heightRange margin maxBlur duration
       delay easing threshold rootMargin blur>, hook options
       (useTextReveal(ref, { stagger, delay, durations, enter, leave, skip }),
       useCardReveal(ref, { card, text, image, textOptions, imageOptions })),
       and data-image-reveal / data-image-rate / data-image-start-offset /
       data-image-height-range / data-image-margin / data-image-max-blur.
     • Internal to the package (edit the files above to change site-wide):
       the default values, the CSS easing + hidden state, the one-way image
       progress rule, the "reset after leaving through the bottom" replay
       rule, and reduced-motion handling (animations are skipped entirely).

   REUSING ON ANOTHER SECTION / PAGE
     1. Wherever you want it automatic, call the hooks once on the page root:
          const root = useRef(null);
          useTextReveal(root); useImageReveal(root);   // <div ref={root}>…</div>
     2. Or wrap a single element: <TextReveal as="h3">…</TextReveal>,
        <ImageReveal src="/x.jpg" alt="" mode="trigger" duration={900} />.
     3. Tune one section without touching the package:
          <section data-image-reveal="fit">  or  data-image-rate="1.5".
     Fonts for the page come from src/fonts/fonts.css (imported below).
   ============================================================================= */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GradientRevealTextSlow } from '../../components/heading-anim-slow';
import { HLLButton } from '../../components/hll-button';
import { HLLOutlineButton } from '../../components/hll-outline-button';
import { Shader, BASE_SETTINGS as SHADER_BASE } from '../../components/shader';
import { BottomShader, BASE_SETTINGS } from '../../components/bottom-shader';
import { makeBottomShaderLayout } from '../../components/bottom-shader/bottom-shader-definition.js';
import '../../fonts/fonts.css'; // registers Aeonik + Sometype Mono
import './home.css';
import './home-media.css';
import { useLineReveal, usePageIntro } from './scroll-effects.js';
import { TextReveal, useTextReveal, useImageReveal, useCardReveal } from '../../components/reveal';
import {
  NAV, MENU_SERVICES, MENU_INDUSTRIES, MENU_ABOUT, MENU_NEWS, HERO, WHAT_WE_DO, CLIENTS, IMPACT, HOW_WE_WORK, WHO_WE_ARE, LAB, FOOTER,
} from './home-media-data.js';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad2 = (n) => String(n).padStart(2, '0');

/* ---------- Section heading: Functional eyebrow + light display title ---------- */
function Heading({ eyebrow, title, dark = false }) {
  const ink = dark ? '#FAFAFA' : '#1A1A1A';
  // The reveal plays on mount, so mount it once the heading scrolls into view.
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.3, rootMargin: '0px 0px -10% 0px' });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref}>
      <p className="hm-label" style={{ color: ink }}>{eyebrow}</p>
      <div className="hm-title">
        {seen ? (
          <GradientRevealTextSlow
            text={title}
            variant="hll-ai"
            ink={ink}
            fontSize="var(--hm-title-size)"
            letterSpacing="0"
          />
        ) : null}
      </div>
    </div>
  );
}

/* ---------- Header + menu shader ---------- */
// Menu Shader, as on the site: the Shader component, transparent, in the
// open nav button's palette, covering the screen under the Nav Bar (it fades
// in on hover and is kept mounted, paused-by-opacity, once built).
const TRANSPARENT_SETTINGS = { ...SHADER_BASE, background: { ...SHADER_BASE.background, transparent: true } };
const PANEL_RIGHT = { services: 9, industries: 9, engagement: 9, about: 44, contact: 9 };

function Panel({ className = '', opacity = 0.8, children }) {
  return <div className={`hm-panel ${className}`} style={{ background: `rgba(230, 230, 230, ${opacity})` }}>{children}</div>;
}
function NewsPanel() {
  return (
    <Panel className="hm-panel--news">
      <p className="hm-label hm-panel__news-label">In the News</p>
      <div className="hm-panel__news-img" />
      <ul>
        {MENU_NEWS.map((t, i) => (
          <li key={i}>{i > 0 ? <div className="hm-panel__rule" /> : null}<a href="#/home-media">{t}</a></li>
        ))}
      </ul>
    </Panel>
  );
}
function MenuPanels({ open }) {
  return (
    <>
      {open === 'services' ? (
        <Panel className="hm-panel--services">
          <ul>
            {MENU_SERVICES.map((m) => (
              <li key={m.name}>
                <a href="#/home-media" className="hm-panel__svc">
                  <span className="hm-panel__tile"><img src={`/home/services/hll-${m.variant}-glyph.svg`} alt="" /></span>
                  {m.name}
                </a>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
      {open === 'industries' ? (
        <Panel className="hm-panel--industries" opacity={0.9}>
          <div className="hm-panel__groups">
            {MENU_INDUSTRIES.map((g) => (
              <div key={g.title}>
                <p className="hm-panel__group">{g.title}</p>
                <ul>{g.items.map((l) => <li key={l}><a href="#/home-media">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
      {open === 'about' ? (
        <Panel className="hm-panel--about">
          <ul>{MENU_ABOUT.map((l) => <li key={l}><a href="#/home-media">{l}</a></li>)}</ul>
        </Panel>
      ) : null}
      {open === 'services' || open === 'industries' || open === 'engagement' ? <NewsPanel /> : null}
    </>
  );
}

function Header() {
  const [open, setOpen] = useState(null);
  const [shaderVariant, setShaderVariant] = useState(null);
  const timer = useRef(0);
  useEffect(() => { if (open) setShaderVariant(open); }, [open]);
  const show = (v) => { window.clearTimeout(timer.current); setOpen(v); };
  const hide = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(null), 180); };
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); window.clearTimeout(timer.current); };
  }, []);
  return (
    <header className="hm-header">
      <a href="#/home-media" className="hm-brand" aria-label="Hyper Lychee Labs">
        <img src="/home/hll-mark.png" alt="" className="hm-brand__mark" />
        <span>Hyper Lychee Labs</span>
      </a>
      <div className="hm-nav-wrap">
        <nav className="hm-nav" aria-label="Main navigation">
          {NAV.map((n) => (
            <HLLButton
              key={n.label}
              variant={n.variant}
              as="a"
              href="#/home-media"
              className="hm-nav__btn"
              aria-expanded={open === n.variant}
              data-held={open === n.variant ? 'true' : undefined}
              onPointerEnter={() => show(n.variant)}
              onPointerLeave={hide}
              onFocus={() => show(n.variant)}
              style={{ '--hll-label-color': '#949494', '--hll-label-hover-color': '#FAFAFA' }}
            >
              {n.label}
            </HLLButton>
          ))}
        </nav>
        {shaderVariant ? (
          <>
          {/* Subtle blur layer sits just below the menu shader; the Bottom Shader has none. */}
          <div aria-hidden className="hm-menu-blur" style={{ opacity: open ? 1 : 0 }} />
          <Shader
            variant={shaderVariant}
            settings={TRANSPARENT_SETTINGS}
            pauseOnDoubleClick={false}
            className="hm-menu-shader"
            style={{ background: 'transparent', top: 'var(--hm-nav-h)', height: 'calc(100vh - var(--hm-nav-h))', opacity: open ? 1 : 0 }}
          />
          </>
        ) : null}
        {open ? (
          <div className="hm-panels" onPointerEnter={() => show(open)} onPointerLeave={hide} style={{ right: PANEL_RIGHT[open] }}>
            <MenuPanels open={open} />
          </div>
        ) : null}
      </div>
    </header>
  );
}

/* ---------- Bottom Shader (the site's ScreenShader) ----------
   The demo's ServicesScrollDemo setup, as the site carries it over: a
   hard-light-blended BottomShader pinned to the bottom of the screen, which
   crossfades (0.6s) to a second, unblended, finer-shatter layer at the true
   end of the page. Home has no section palette, so it runs the Figma Home
   footer's pink and peach. */
const HOME_SHADER_COLORS = ['#F49AB1', '#F483A6', '#F5CAA3'];
const DEMO_SETTINGS = {
  ...BASE_SETTINGS,
  background: { color: '#ffffff', transparent: true },
  tune: { ...BASE_SETTINGS.tune, vignetteFollow: 0.9 },
};
const DEMO_END_SETTINGS = {
  ...BASE_SETTINGS,
  background: { color: '#ffffff', transparent: true },
  shatter: { ...BASE_SETTINGS.shatter, amount: 1 },
};
const DEMO_CONFIG = { hostHeight: 50, fadeStart: 10, fadeEnd: 80, fadeCurve: 1.5 };
const DEMO_END_CONFIG = { hostHeight: 60, fadeStart: 10, fadeEnd: 70, fadeCurve: 1.25 };
const DEMO_LAYOUT = makeBottomShaderLayout(DEMO_CONFIG.hostHeight);
const DEMO_END_LAYOUT = makeBottomShaderLayout(DEMO_END_CONFIG.hostHeight);

function layerStyle(c) {
  const span = c.fadeEnd - c.fadeStart || 1e-6;
  const pts = [[0, 0]];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    pts.push([c.fadeStart + span * t, t ** c.fadeCurve]);
  }
  pts.push([100, 1]);
  pts.sort((x, y) => x[0] - y[0]);
  const mask = `linear-gradient(to bottom, ${pts.map(([p, a]) => `rgba(0,0,0,${a}) ${p}%`).join(', ')})`;
  return { WebkitMaskImage: mask, maskImage: mask, background: 'transparent', pointerEvents: 'none', zIndex: 30, transition: 'opacity 600ms ease' };
}
const DEMO_STYLE = layerStyle(DEMO_CONFIG);
const DEMO_END_STYLE = layerStyle(DEMO_END_CONFIG);
const END_THRESHOLD_PX = 4;
const END_LAYER_AHEAD = 1600;

function supportsWebGL2() {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
}

function ScreenShader() {
  const [able, setAble] = useState(false);
  const [started, setStarted] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [nearEnd, setNearEnd] = useState(false);
  const [warm, setWarm] = useState(false);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    if (reduceMotion() || !supportsWebGL2()) return undefined;
    setAble(true);
    const media = window.matchMedia('(min-width: 1024px)');
    const onMedia = () => setDesktop(media.matches);
    onMedia();
    media.addEventListener('change', onMedia);
    const onScroll = () => {
      const doc = document.documentElement;
      const left = doc.scrollHeight - (window.scrollY + window.innerHeight);
      setAtEnd(left <= END_THRESHOLD_PX);
      if (left <= END_LAYER_AHEAD) setNearEnd(true);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const start = window.setTimeout(() => setStarted(true), 1200);
    const warmTimer = window.setTimeout(() => setWarm(true), 2500);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(warmTimer);
      media.removeEventListener('change', onMedia);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Phones show the shader near the footer only.
  const show = desktop || nearEnd;
  if (!able || !started || !show) return null;
  return (
    <>
      <BottomShader
        variant="contact"
        colors={HOME_SHADER_COLORS}
        settings={DEMO_SETTINGS}
        layout={DEMO_LAYOUT}
        overlay
        pauseOnDoubleClick={false}
        style={{ ...DEMO_STYLE, opacity: !atEnd ? 1 : 0 }}
      />
      {nearEnd || warm ? (
        <BottomShader
          variant="contact"
          colors={HOME_SHADER_COLORS}
          settings={DEMO_END_SETTINGS}
          layout={DEMO_END_LAYOUT}
          pauseOnDoubleClick={false}
          style={{ ...DEMO_END_STYLE, opacity: atEnd ? 1 : 0 }}
        />
      ) : null}
    </>
  );
}

/* ---------- Hero: window scales from its frame to cover the viewport ---------- */
function useScaleToViewport(ref) {
  useEffect(() => {
    const node = ref.current;
    if (!node || reduceMotion()) return undefined;
    const mobile = window.matchMedia('(width < 64rem)');
    let frame = 0;
    const update = () => {
      frame = 0;
      if (mobile.matches) {
        node.style.transform = '';
        node.style.borderRadius = '';
        return;
      }
      let top = 0;
      for (let el = node; el; el = el.offsetParent) top += el.offsetTop;
      const rest = { w: node.offsetWidth, h: node.offsetHeight };
      const end = Math.max(1, top - (window.innerHeight - rest.h) / 2);
      const t = Math.min(1, Math.max(0, window.scrollY / end));
      const eased = t * t * (3 - 2 * t);
      const cover = Math.max(window.innerWidth / rest.w, window.innerHeight / rest.h);
      node.style.transform = `scale(${1 + (cover - 1) * eased})`;
      node.style.borderRadius = `${8 * (1 - eased)}px`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref]);
}

function Hero() {
  const ref = useRef(null);
  useScaleToViewport(ref);
  return (
    <section className="hm-section hm-hero hm-gutter">
      <h1 className="hm-hero__title">
        <GradientRevealTextSlow
          text={HERO.heading}
          variant="hll-ai"
          fontSize="var(--hm-title-size)"
          letterSpacing="0"
        />
      </h1>
      <div ref={ref} className="hm-hero__window">
        <video src={HERO.video} poster={HERO.poster} autoPlay muted loop playsInline />
      </div>
      <div className="hm-hero__cta">
        <HLLOutlineButton variant="engagement" as="a" href="#/home-media">{HERO.ctaLabel}</HLLOutlineButton>
      </div>
    </section>
  );
}

/* ---------- What we do: scroll-pinned wheel (desktop) / card row (mobile) ---------- */
function WhatWeDoMobile() {
  const services = WHAT_WE_DO.items;
  const rowRef = useRef(null);
  const [active, setActive] = useState(0);
  const CARD = 253 + 10;
  const onScroll = () => {
    const next = Math.round(rowRef.current.scrollLeft / CARD);
    setActive(Math.min(services.length - 1, Math.max(0, next)));
  };
  const go = (d) => {
    const i = (active + d + services.length) % services.length;
    rowRef.current.scrollTo({ left: i * CARD, behavior: reduceMotion() ? 'auto' : 'smooth' });
  };
  const sel = services[active];
  return (
    <section className="hm-section hm-wwd-mobile" aria-label="Our capabilities">
      <div className="hm-gutter"><Heading eyebrow={WHAT_WE_DO.eyebrow} title={WHAT_WE_DO.title} /></div>
      <div className="hm-wwd-mobile__counter hm-mono">
        <span aria-live="polite">{pad2(active + 1)}/{pad2(services.length)}</span>
        <span>
          <button type="button" aria-label="Previous capability" onClick={() => go(-1)}>&lt;</button>
          <button type="button" aria-label="Next capability" onClick={() => go(1)}>&gt;</button>
        </span>
      </div>
      <div ref={rowRef} onScroll={onScroll} className="hm-wwd-mobile__row">
        {services.map((s) => (
          <a key={s.name} href="#/home-media" aria-label={s.name} className="hm-wwd-card" style={{ backgroundImage: `url(${s.image})` }}>
            <span className="hm-wwd-card__glyph"><img src={s.glyph} alt="" /></span>
          </a>
        ))}
        <span aria-hidden className="hm-wwd-mobile__spacer" />
      </div>
      <div className="hm-wwd-mobile__text">
        <a href="#/home-media">{sel.name}</a>
        <p>{sel.description}</p>
      </div>
    </section>
  );
}

function WhatWeDoWheel() {
  const services = WHAT_WE_DO.items;
  const count = services.length;
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const [active, setActive] = useState(0);

  const update = useCallback(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;
    const range = section.getBoundingClientRect().height - sticky.getBoundingClientRect().height;
    if (range <= 0) return;
    const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / range));
    const next = Math.min(count - 1, Math.round(progress * (count - 1)));
    setActive((c) => (c === next ? c : next));
  }, [count]);

  useEffect(() => {
    let frame = 0;
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [update]);

  const scrollTo = (index) => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const range = section.getBoundingClientRect().height - sticky.getBoundingClientRect().height;
    const top = window.scrollY + section.getBoundingClientRect().top + range * (count > 1 ? index / (count - 1) : 0);
    window.scrollTo({ top, behavior: reduceMotion() ? 'auto' : 'smooth' });
  };

  // Two labels above the active name, three below; every label is always
  // rendered in a slot by its distance from the active one, so a change
  // slides labels into place (CSS transition) instead of swapping text.
  const offsetOf = (index) => {
    const o = (index - active + count) % count;
    return o >= count - 2 ? o - count : o;
  };
  const slotTop = (o) => {
    if (o <= -2) return `${(o + 2) * 26.4}px`;
    if (o === -1) return '26.4px';
    if (o === 0) return 'calc(61.8px + var(--big-h) / 2 - 7.2px)';
    return `calc(${73.8 + (o - 1) * 26.4}px + var(--big-h))`;
  };

  return (
    <section ref={sectionRef} className="hm-section hm-wwd-wheel" style={{ height: `${count * 60}svh` }} aria-label="Our capabilities">
      <div ref={stickyRef} className="hm-wwd-wheel__sticky hm-gutter">
        <Heading eyebrow={WHAT_WE_DO.eyebrow} title={WHAT_WE_DO.title} />
        <div className="hm-wwd-wheel__grid">
          <div className="hm-wwd-wheel__names">
            <p className="hm-sr" aria-live="polite">{services[active].name}</p>
            <div className="hm-wwd-wheel__list">
              <ul>
                {services.map((s, i) => {
                  const o = offsetOf(i);
                  const shown = o !== 0 && o >= -2 && o <= 3;
                  return (
                    <li key={s.label} aria-hidden={!shown} style={{ transform: `translateY(${slotTop(o)})`, opacity: shown ? 1 : 0 }}>
                      <button type="button" tabIndex={shown ? undefined : -1} onClick={() => scrollTo(i)} className="hm-label hm-wwd-wheel__label" style={{ pointerEvents: shown ? undefined : 'none' }}>
                        {s.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="hm-wwd-wheel__big">
                {services.map((s, i) => (
                  <a
                    key={s.label}
                    href="#/home-media"
                    aria-hidden={i !== active}
                    tabIndex={i === active ? undefined : -1}
                    style={{ opacity: i === active ? 1 : 0, transform: `translateY(${i === active ? 0 : i < active ? -16 : 16}px)`, pointerEvents: i === active ? undefined : 'none' }}
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <a href="#/home-media" className="hm-wwd-wheel__card">
            {services.map((s, i) => (
              <span key={s.label} aria-hidden className="hm-fade" style={{ backgroundImage: `url(${s.image})`, opacity: i === active ? 1 : 0 }} />
            ))}
            <span className="hm-wwd-wheel__glyph">
              {services.map((s, i) => (
                <img key={s.label} src={s.glyph} alt="" aria-hidden className="hm-fade" style={{ opacity: i === active ? 1 : 0 }} />
              ))}
            </span>
            <span aria-hidden className="hm-wwd-wheel__shade" />
            <span className="hm-wwd-wheel__desc">
              <span>
                {services.map((s, i) => (
                  <span key={s.label} aria-hidden={i !== active} className="hm-fade" style={{ opacity: i === active ? 1 : 0 }}>{s.description}</span>
                ))}
              </span>
              <svg className="hm-wwd-wheel__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden><path d="M7 17 17 7M8 7h9v9" /></svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Our Clients: logo marquee (grey slots until logos exist) ---------- */
function Clients() {
  const logos = CLIENTS.logos.filter((l) => l.logo);
  const slots = logos.length ? logos : Array.from({ length: 8 }, () => null);
  // Image reveal: data-image-reveal="fit" makes this section's logos finish
  // revealing as soon as they are fully on screen (instead of the default
  // scroll-scrub). Mode/margin live in image-reveal-core.js (IMAGE_REVEAL_DEFAULTS).
  return (
    <section className="hm-section hm-clients" data-image-reveal="fit">
      <div className="hm-gutter"><Heading eyebrow={CLIENTS.eyebrow} title={CLIENTS.title} /></div>
      <div className="hm-marquee">
        {[...slots, ...slots].map((item, n) => (
          <div key={n} aria-hidden={n >= slots.length} className={`hm-marquee__slot${item ? '' : ' is-empty'}`}>
            {item ? <img src={item.logo} alt={n < slots.length ? item.name : ''} draggable={false} /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Our Impact ---------- */
// Stat figure ($1B+, 15+): the slow heading reveal, mounted once the figure is
// on screen (replaces the old count-up, which would restart the reveal on
// every changing digit).
function StatValue({ value }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <span ref={ref} className="hm-stat__reveal" aria-label={value}>
      {seen ? (
        <GradientRevealTextSlow text={value} variant="hll-ai" ink="#000" fontSize="var(--hm-stat-size)" letterSpacing="0" />
      ) : null}
    </span>
  );
}

function CountUp({ value }) {
  const m = value.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
  const ref = useRef(null);
  const [cur, setCur] = useState(null);
  useEffect(() => {
    if (!m || !ref.current || reduceMotion()) return undefined;
    const target = Number(m[2].replace(',', '.'));
    let frame = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const began = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - began) / 1400);
        setCur(target * (1 - (1 - t) ** 3));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    setCur(0);
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  if (!m) return <span>{value}</span>;
  const decimals = m[2].split(/[.,]/)[1]?.length ?? 0;
  return <span ref={ref} aria-label={value}><span aria-hidden>{m[1]}{cur === null ? m[2] : cur.toFixed(decimals)}{m[3]}</span></span>;
}

// Figma staggered grid (three 490px columns, offsets inside a 1491 × 1761 block).
const BLOCK = { w: 1491, h: 1761 };
const SLOTS = [
  { id: 'c1', card: 0, mediaH: 490, mobileH: 385, x: 1, y: 0 },
  { id: 'c2', card: 1, mediaH: 317, mobileH: 280, x: 501, y: 0 },
  { id: 'c3', card: 2, mediaH: 551, mobileH: 380, x: 1001, y: 0 },
  { id: 's1', stat: 0, x: 0, y: 959 },
  { id: 'c4', card: 3, mediaH: 490, mobileH: 380, x: 501, y: 641 },
  { id: 'c5', card: 4, mediaH: 317, x: 1001, y: 641 },
  { id: 'c6', card: 5, mediaH: 490, wide: true, x: 0, y: 1221 },
  { id: 's2', stat: 1, x: 1002, y: 1533 },
];
const MOBILE_ORDER = ['c1', 'c2', 'c3', 's1', 'c4', 'c5', 'c6', 's2'];
const pct = (v, of) => `${(v / of) * 100}%`;

function ImpactTile({ slot, mobile }) {
  if (slot.stat !== undefined) {
    const s = IMPACT.stats[slot.stat];
    return (
      <div className="hm-stat">
        <p className="hm-stat__value"><StatValue value={s.value} /></p>
        <p className="hm-stat__label">{s.label}</p>
      </div>
    );
  }
  const c = IMPACT.cards[slot.card];
  const ratio = mobile && slot.mobileH ? `386 / ${slot.mobileH}` : `${slot.wide ? 991 : 490} / ${slot.mediaH}`;
  return (
    <article className="hm-card" data-impact-card>
      <a href="#/home-media">
        <div className="hm-card__media" data-no-image-reveal style={{ aspectRatio: ratio, ...(c.image ? { background: `#d9d9d9 url(${c.image}) center / cover` } : null) }}>
          <span aria-hidden className="hm-card__arrow">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M7 17 17 7M8 7h9v9" /></svg>
          </span>
          <div className="hm-card__tags">{c.tags.map((t) => <span key={t}>{t}</span>)}</div>
        </div>
        <h3>{c.title}</h3>
      </a>
    </article>
  );
}

function Impact() {
  // Image reveal: default 'scrub' mode at data-image-rate="1.5", i.e. these
  // images finish revealing in 2/3 of the usual scroll distance. Change the
  // number here to speed up / slow down only this section (1 = site default);
  // other knobs: data-image-start-offset, -height-range, -max-blur.
  return (
    <section className="hm-section hm-impact" data-image-reveal="scrub" data-image-rate="1.5">
      <div className="hm-gutter hm-impact__head"><Heading eyebrow={IMPACT.eyebrow} title={IMPACT.title} /></div>
      <div className="hm-impact__desktop" style={{ aspectRatio: `${BLOCK.w} / ${BLOCK.h}` }}>
        {SLOTS.map((s) => (
          <div key={s.id} style={{ position: 'absolute', left: pct(s.x, BLOCK.w), top: pct(s.y, BLOCK.h), width: pct(s.wide ? 991 : 490, BLOCK.w) }}>
            <ImpactTile slot={s} />
          </div>
        ))}
      </div>
      <div className="hm-impact__mobile">
        {MOBILE_ORDER.map((id, i) => {
          const s = SLOTS.find((x) => x.id === id);
          const prev = SLOTS.find((x) => x.id === MOBILE_ORDER[i - 1]);
          const stat = s.stat !== undefined;
          return (
            <div key={id} style={{ marginTop: i === 0 ? 0 : stat || prev?.stat !== undefined ? 84 : 32 }}>
              <ImpactTile slot={s} mobile />
            </div>
          );
        })}
      </div>
      <div className="hm-impact__cta">
        <HLLButton variant="engagement" as="a" href="#/home-media">{IMPACT.ctaLabel}</HLLButton>
      </div>
    </section>
  );
}

/* ---------- How we work: three-stage carousel with timer ---------- */
const STAGE = { w: 1452, h: 728 };
const STAGE_SLOTS = [
  { x: 110, y: 205, size: 250 },
  { x: 461, y: 64, size: 530 },
  { x: 1092, y: 206, size: 250 },
];
const STAGE_MS = 6000;

function StepMedia({ step, playing }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else { v.pause(); v.currentTime = 0; }
  }, [playing]);
  return (
    <span className="hm-step__media">
      <img src={step.image} alt="" draggable={false} />
      {step.video ? <video ref={ref} src={step.video} muted loop playsInline preload="metadata" aria-hidden /> : null}
    </span>
  );
}

function HowWeWork() {
  const steps = HOW_WE_WORK.steps;
  const count = steps.length;
  const [active, setActive] = useState(1);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const stageRef = useRef(null);
  const swipeX = useRef(null);
  const slotOf = (i) => (i - active + 1 + count) % count;
  const go = (d) => setActive((a) => (a + d + count) % count);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    if (stageRef.current) io.observe(stageRef.current);
    return () => io.disconnect();
  }, []);

  const swipe = {
    onPointerDown: (e) => { swipeX.current = e.clientX; setPaused(true); },
    onPointerUp: (e) => {
      setPaused(false);
      if (swipeX.current === null) return;
      const dx = e.clientX - swipeX.current;
      swipeX.current = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    },
    onPointerCancel: () => { swipeX.current = null; setPaused(false); },
  };
  const auto = !reduceMotion();

  return (
    <section className="hm-section hm-hww hm-gutter">
      <div data-line className="hm-hww__line" />
      <Heading eyebrow={HOW_WE_WORK.eyebrow} title={HOW_WE_WORK.title} />
      <div ref={stageRef} className="hm-hww__stage" style={{ aspectRatio: `${STAGE.w} / ${STAGE.h}` }} {...swipe}>
        <button type="button" aria-label="Previous stage" className="hm-arrow" style={{ left: pct(36, STAGE.w), top: pct(317, STAGE.h) }} onClick={() => go(-1)}>
          <svg viewBox="0 0 17 17" fill="none" stroke="currentColor" aria-hidden><path d="M16 8.5H1M8 1.5l-7 7 7 7" /></svg>
        </button>
        <button type="button" aria-label="Next stage" className="hm-arrow" style={{ left: pct(1399, STAGE.w), top: pct(317, STAGE.h) }} onClick={() => go(1)}>
          <svg viewBox="0 0 17 17" fill="none" stroke="currentColor" aria-hidden><path d="M1 8.5h15M9 1.5l7 7-7 7" /></svg>
        </button>
        {steps.map((step, i) => {
          const slot = STAGE_SLOTS[slotOf(i)];
          const on = i === active;
          return (
            <button
              key={step.id}
              type="button"
              className="hm-step"
              aria-current={on ? 'step' : undefined}
              onClick={() => setActive(i)}
              style={{ left: pct(slot.x, STAGE.w), top: pct(slot.y, STAGE.h), width: pct(slot.size, STAGE.w) }}
            >
              <StepMedia step={step} playing={on} />
              {/* Explicit <TextReveal>: same word reveal as the page-wide hook, used
                  here because these spans sit inside a <button> (which the
                  auto-detecting hook skips). Per-instance props: stagger, total,
                  delay, durations, enterOffset, threshold. Defaults live in
                  components/reveal/text-reveal-core.js + reveal.css. */}
              <TextReveal as="span" className="hm-step__title">{step.title}</TextReveal>
              {on ? (
                <>
                  <TextReveal as="span" className="hm-step__body">{step.body}</TextReveal>
                  {auto ? (
                    <span aria-hidden className="hm-timer">
                      <span
                        key={active}
                        style={{ animation: `hm-timer ${STAGE_MS}ms linear both`, animationPlayState: paused || !inView ? 'paused' : 'running' }}
                        onAnimationEnd={() => go(1)}
                      />
                    </span>
                  ) : null}
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Who are we ---------- */
function WhoWeAre() {
  // Card reveal (useCardReveal in HomeMedia()): data-reveal-card marks the
  // card; its name/role words reveal together once the text block is 60%
  // on screen, and the photo plays the timed image reveal (1300ms) once
  // 30% of the card is visible. data-no-text-scroll keeps the page-wide
  // text hook off it; data-no-image-reveal (photo, below) keeps the
  // scroll-scrub off it. Timings: CARD_TEXT_DEFAULTS in reveal/hooks.js,
  // or pass textOptions / imageOptions to useCardReveal.
  return (
    <section className="hm-section hm-team">
      <div className="hm-gutter"><Heading eyebrow={WHO_WE_ARE.eyebrow} title={WHO_WE_ARE.title} /></div>
      <ul className="hm-team__grid">
        {WHO_WE_ARE.people.map((p) => (
          <li key={p.id} data-reveal-card data-no-text-scroll>
            <div className="hm-team__photo" data-no-image-reveal style={p.photo ? { background: `#d9d9d9 url(${p.photo}) center / cover` } : undefined} />
            <div>
              <p className="hm-team__name">{p.name}</p>
              <p className="hm-label">{p.role}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="hm-team__cta">
        <HLLButton variant="about" as="a" href="#/home-media">{WHO_WE_ARE.ctaLabel}</HLLButton>
      </div>
    </section>
  );
}

/* ---------- Inside the Lab ---------- */
function Lab() {
  return (
    <section className="hm-section hm-lab hm-gutter" style={{ backgroundImage: `url(${LAB.background})` }}>
      <Heading eyebrow={LAB.eyebrow} title={LAB.title} dark />
      <div className="hm-lab__window">
        <iframe src="/lab/ports.html" title="Ports: interactive demo" allow="fullscreen" loading="lazy" />
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
// The CTA headline uses the same heading animation as the section titles
// (mounted once it scrolls into view); .hm-footer__title is excluded from the
// word-by-word text scroll so the two animations never overlap.
function FooterHeadline({ text }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.3, rootMargin: '0px 0px -10% 0px' });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <h2 ref={ref} className="hm-footer__title" aria-label={text}>
      {seen ? (
        <GradientRevealTextSlow text={text} variant="hll-ai" ink="#FAFAFA" fontSize="clamp(36px, 4.23vw, 64px)" letterSpacing="0" />
      ) : null}
    </h2>
  );
}

function Footer() {
  return (
    <footer className="hm-footer">
      <section className="hm-footer__cta hm-gutter">
        <FooterHeadline text={FOOTER.headline} />
        <HLLButton variant="contact" as="a" href="#/home-media">{FOOTER.ctaLabel}</HLLButton>
      </section>
      <div className="hm-footer__body hm-gutter">
        <span className="hm-footer__brand">Hyper Lychee Labs</span>
        <ul className="hm-footer__col hm-label">{FOOTER.nav.map((l) => <li key={l}>{l}</li>)}</ul>
        <ul className="hm-footer__col hm-label">
          <li className="hm-footer__muted">Services</li>
          {FOOTER.services.map((l) => <li key={l}>{l}</li>)}
        </ul>
        <p className="hm-footer__legal hm-label">© Hyper Lychee Labs 2026</p>
      </div>
    </footer>
  );
}

// Selectors the page-wide text hook must leave alone: headings that run their
// own gradient reveal (<GradientRevealTextSlow>) and small uppercase labels.
// Add a selector here (or put data-no-text-scroll on an element) to opt out.
const TEXT_REVEAL_SKIP = '.hm-title, .hm-hero__title, .hm-footer__title, .hm-label';

export default function HomeMedia() {
  useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
  const pageRef = useRef(null);
  const mainRef = useRef(null);
  // Page-wide reveals (all from src/components/reveal; see the reference at the
  // top of this file). Each takes the page root and finds its targets itself.
  useImageReveal(pageRef);  // every <img>/<video>/background: height + blur scrub
  // Word-by-word text reveal. Options are the TEXT_REVEAL_DEFAULTS fields
  // (stagger, total, delay, durations, enter, leave) — defaults used here.
  useTextReveal(pageRef, { skip: TEXT_REVEAL_SKIP });
  // Team cards: selectors say which element is the card, its text and its image.
  useCardReveal(pageRef, { card: '[data-reveal-card]', text: '.hm-team__name, .hm-label', image: '.hm-team__photo' });
  // Impact cards: same time-based, viewport-triggered image reveal as the Team photos (image only; their text stays on the page-wide text hook).
  useCardReveal(pageRef, { card: '[data-impact-card]', image: '.hm-card__media' });
  useLineReveal(pageRef);
  usePageIntro(mainRef);
  return (
    <div className="hm-page" ref={pageRef}>
      <Header />
      <main ref={mainRef} data-intro="pending">
        <Hero />
        {/* What we do section (commented out)
        <WhatWeDoMobile />
        <WhatWeDoWheel />
        */}
        <Clients />
        <Impact />
        <HowWeWork />
        <WhoWeAre />
        <Lab />
      </main>
      <Footer />
      <ScreenShader />
    </div>
  );
}
