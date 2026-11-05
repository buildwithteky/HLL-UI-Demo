import { useLayoutEffect, useRef } from 'react';
import { prefersReducedMotion } from './text-reveal-core.js';
import { scrubImage, bindImageTrigger } from './image-reveal-core.js';

/**
 * ImageReveal — the site's image reveal: the media's height grows from its top
 * edge while it sharpens from a blur. Honors prefers-reduced-motion.
 *
 *   <ImageReveal src="/photo.jpg" alt="" />                 // scrubbed to scroll (site default)
 *   <ImageReveal mode="fit" src="/logo.png" alt="" />       // finishes once fully on screen
 *   <ImageReveal mode="trigger" duration={1300}>…</ImageReveal>   // plays when it enters the viewport
 *
 * Props
 *   as          element to render: 'img' when `src` is given, otherwise 'div' (wrapping children)
 *   mode        'scrub' (default) | 'fit' | 'trigger'
 *   scrub/fit:  rate (1), startOffset (0.97), heightRange (0.9), margin (0.08), maxBlur (16)
 *   trigger:    duration (1300 ms), delay (0 ms), easing, threshold (0.3), rootMargin ('0px 0px -8% 0px'), maxBlur
 *   blur        also blur while revealing (default true)
 *   className, style, …rest are passed to the element.
 * Progress is one-way: scrolling up never hides a revealed image; it resets only
 * after leaving through the bottom, so it replays on the way back down.
 */
export default function ImageReveal({
  as,
  mode = 'scrub',
  rate, startOffset, heightRange, margin,
  duration, delay, easing, threshold, rootMargin,
  maxBlur,
  blur = true,
  children,
  ...rest
}) {
  const Tag = as || (rest.src ? 'img' : 'div');
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;
    const defined = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
    if (mode === 'trigger') {
      return bindImageTrigger(el, defined({ duration, delay, easing, threshold, rootMargin, maxBlur, blur }));
    }
    return scrubImage(el, defined({ mode, rate, startOffset, heightRange, margin, maxBlur, blur }));
  }, [mode, rate, startOffset, heightRange, margin, duration, delay, easing, threshold, rootMargin, maxBlur, blur]);

  return <Tag ref={ref} {...rest}>{children}</Tag>;
}
