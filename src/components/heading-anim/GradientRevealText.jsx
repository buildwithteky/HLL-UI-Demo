import React, { useEffect, useId, useState } from 'react';
import { headingAnimVariants, resolveVariantColors, hexToRgba } from './heading-anim-variants.js';

/**
 * GradientRevealText — the design system's single reusable heading reveal.
 *
 * Same one-component-many-variants approach as HLLButton/Ripple: a
 * `variant` prop selects one of the design system's predefined 2-3 color
 * gradients (see heading-anim-variants.js, copied from
 * hll-button-variants.js's VARIANT_GRADIENTS) — the reveal timing, easing,
 * blur and glow are shared by every variant unchanged. `colors` exists as
 * an explicit one-off override, same role as HLLButton's `gradient` prop.
 *
 * Text fades in while the variant's gradient sweeps across it in bands,
 * with a soft edge glow matched to the same colors. No background, no
 * layout chrome — just the text element itself.
 *
 * Usage:
 *   <GradientRevealText text="Intelligence and Imagination" variant="services" />
 *   <GradientRevealText text="Hello" replayKey={someChangingValue} />
 */

// Resamples a variant's 2-3 hex stops into evenly-spaced bands across the
// sweep, generalizing the original hand-tuned "leak" gradient (a fixed
// 4-color band) to any variant's stop count.
function buildBandGradient(colors) {
  const start = 20;
  const end = 98;
  const step = (end - start) / colors.length;
  const stops = ['transparent 0%'];
  colors.forEach((color, i) => {
    const from = start + i * step;
    const to = start + (i + 1) * step;
    stops.push(`${color} ${from}%`, `${color} ${to}%`);
  });
  stops.push('transparent 100%');
  return stops.join(',\n            ');
}

function buildGlowShadow(colors, alphas) {
  return colors
    .map((color, i) => `0 0 ${[2, 10, 22][i] ?? 22}px ${hexToRgba(color, alphas[i] ?? 0.18)}`)
    .join(', ');
}

export default function GradientRevealText({
  text = 'Intelligence and Imagination',
  variant = 'enterprise',
  colors,
  autoPlay = true,
  replayKey,
  fontSize = '67px',
  letterSpacing = '0.010em',
  ink = '#1a1a1a',
  duration = 1200,
  glow = true,
  sweepBlur = 6.4,
  className,
  style,
}) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [running, setRunning] = useState(false);
  const gradientColors = colors && colors.length >= 2 ? colors : resolveVariantColors(variant);

  useEffect(() => {
    if (!autoPlay) return;
    setRunning(false);
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setRunning(true));
    });
    return () => cancelAnimationFrame(raf1);
  }, [text, replayKey, autoPlay]);

  const ease = 'cubic-bezier(0.445, 0.05, 0.55, 0.95)';
  const glowPeak = buildGlowShadow(gradientColors, [0.45, 0.35, 0.18]);
  const glowNone = gradientColors.map(() => '0 0 0 rgba(0,0,0,0)').join(', ');

  return (
    <>
      <style>{`
        .gtr-${rawId} {
          position: relative;
          display: inline-block;
          font-weight: 300;
          font-size: ${fontSize};
          letter-spacing: ${letterSpacing};
          line-height: 1.2;
          color: transparent;
          opacity: 0;
        }
        .gtr-${rawId}.is-running { opacity: 1; }
        ${glow ? `.gtr-${rawId}.is-running {
          animation: gtrGlow-${rawId} ${duration}ms ${ease} forwards;
        }` : ''}
        .gtr-${rawId} .gtr-inner {
          display: inline-block;
          color: ${ink};
          opacity: 0;
          filter: blur(2px);
        }
        .gtr-${rawId}.is-running .gtr-inner {
          animation: gtrLetter-${rawId} ${duration}ms ${ease} forwards,
                     gtrTextBlur-${rawId} ${duration}ms ${ease} forwards;
        }
        .gtr-${rawId}::before {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          pointer-events: none;
          color: transparent;
          background-image: linear-gradient(115deg,
            ${buildBandGradient(gradientColors)});
          background-size: 420% 100%;
          background-position: 200% 50%;
          -webkit-background-clip: text;
          background-clip: text;
          opacity: 0;
          filter: blur(${sweepBlur}px);
        }
        .gtr-${rawId}.is-running::before {
          animation: gtrSweep-${rawId} ${duration}ms ${ease} forwards;
        }
        @keyframes gtrLetter-${rawId} {
          0% { opacity: 0; color: ${ink}; }
          50% { opacity: 0; color: ${ink}; }
          100% { opacity: 1; color: ${ink}; }
        }
        @keyframes gtrTextBlur-${rawId} {
          0% { filter: blur(2px); }
          40% { filter: blur(1.6px); }
          65% { filter: blur(0.9px); }
          85% { filter: blur(0.3px); }
          100% { filter: blur(0); }
        }
        @keyframes gtrSweep-${rawId} {
          0% { opacity: 0; background-position: 200% 50%; }
          10% { opacity: 0.7; background-position: 165% 50%; }
          30% { opacity: 0.85; background-position: 100% 50%; }
          50% { opacity: 0.75; background-position: 40% 50%; }
          75% { opacity: 0.35; background-position: -30% 50%; }
          100% { opacity: 0; background-position: -90% 50%; }
        }
        @keyframes gtrGlow-${rawId} {
          0% { text-shadow: ${glowNone}; }
          30% { text-shadow: ${glowPeak}; }
          60% { text-shadow: ${glowPeak}; }
          100% { text-shadow: ${glowNone}; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gtr-${rawId}, .gtr-${rawId} .gtr-inner, .gtr-${rawId}::before { animation: none !important; }
          .gtr-${rawId} { opacity: 1; }
          .gtr-${rawId} .gtr-inner { opacity: 1; filter: none; color: ${ink}; }
        }
      `}</style>
      <span
        className={headingAnimVariants({ variant, className })}
        style={style}
      >
        <span className={`gtr-${rawId}${running ? ' is-running' : ''}`} data-text={text}>
          <span className="gtr-inner">{text}</span>
        </span>
      </span>
    </>
  );
}
