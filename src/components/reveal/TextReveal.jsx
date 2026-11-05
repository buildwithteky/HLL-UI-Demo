import { Fragment, useLayoutEffect, useRef } from 'react';
import { createWordObserver, prefersReducedMotion, setWordsHidden, WORD_CLASS } from './text-reveal-core.js';

/**
 * TextReveal — word-by-word blur + fade reveal, played when the text enters the
 * viewport. Time-based (not scroll-mapped), responsive (the trigger is a
 * fraction of the viewport height), and it replays when scrolled back to from
 * below. Honors prefers-reduced-motion (renders plain text).
 *
 *   <TextReveal as="p" className="lead">Intelligence you can audit.</TextReveal>
 *   <TextReveal as="h2" stagger={70} delay={200} durations={{ transform: 700 }}>…</TextReveal>
 *
 * Props
 *   as          element to render (default 'span')
 *   children    the text (string)
 *   stagger     max ms between words (45)           total   max ms for the whole stagger (900)
 *   delay       ms before the first word (0)         durations  { opacity, blur, transform } ms (150/220/450)
 *   enterOffset viewport fraction the top must be inside before it plays (0.12)
 *   threshold   fraction of the element that must be visible (0)
 *   className, style, …rest are passed to the element.
 */
export default function TextReveal({
  as: Tag = 'span',
  children,
  stagger,
  total,
  delay,
  durations,
  enterOffset = 0.12,
  threshold = 0,
  ...rest
}) {
  const ref = useRef(null);
  const text = Array.isArray(children) ? children.join('') : String(children ?? '');
  const durationsKey = JSON.stringify(durations ?? null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;
    const words = Array.from(el.querySelectorAll(`.${WORD_CLASS}`));
    if (!words.length) return undefined;
    setWordsHidden(words);
    const observer = createWordObserver({
      stagger, total, delay, durations,
      enter: { rootMargin: `0px 0px -${enterOffset * 100}% 0px`, threshold },
    });
    observer.observe(el, words);
    return () => {
      observer.disconnect();
      words.forEach((w) => { w.classList.remove('is-hidden'); w.style.transitionDelay = ''; });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, stagger, total, delay, durationsKey, enterOffset, threshold]);

  const parts = text.trim().split(/\s+/).filter(Boolean);
  return (
    <Tag ref={ref} {...rest}>
      {parts.map((word, i) => (
        <Fragment key={i}>
          {i ? ' ' : null}
          <span className={WORD_CLASS}>{word}</span>
        </Fragment>
      ))}
    </Tag>
  );
}
