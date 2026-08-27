import React, { useEffect, useId, useState } from 'react';
import { gradientRevealTextNormalVariants, resolveVariantColors, hexToRgba } from './heading-anim-normal-variants.js';

/**
 * GradientRevealTextNormal — the "normal" reveal speed (duration 600ms):
 * text fades in while a white -> variant-color -> dark-ink gradient sweeps
 * across it, with a soft edge glow. This is the counterpart to
 * heading-anim/GradientRevealText.jsx's "slow" reveal (duration 1200ms,
 * multi-band leak sweep) — that one was already built from the original
 * "Variant B — Leak" prototype, so this folder only needed to cover the
 * other prototype, "Variant A — Sweep", which hard-coded its own lead/mid/
 * tail colors; here `mid` follows the same per-service `variant` prop as
 * every other design-system component (see heading-anim-normal-variants.js)
 * — lead/tail stay white/ink so the sweep still reads as "light to dark",
 * just tinted by the service's color.
 *
 * Usage:
 *   <GradientRevealTextNormal text="Intelligence and Imagination" variant="hll-trust" />
 */
export default function GradientRevealTextNormal({
  text = 'Intelligence and Imagination',
  variant = 'hll-ai',
  autoPlay = true,
  replayKey,
  fontSize = '67px',
  letterSpacing = '0.010em',
  ink = '#1a1a1a',
  duration = 600,
  glow = true,
  lead = '#ffffff',
  sweepBlur = 6,
  className,
  style,
}) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [running, setRunning] = useState(false);
  const mid = resolveVariantColors(variant)[0];

  useEffect(() => {
    if (!autoPlay) return;
    setRunning(false);
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setRunning(true));
    });
    return () => cancelAnimationFrame(raf1);
  }, [text, replayKey, autoPlay]);

  const ease = 'cubic-bezier(0.445, 0.05, 0.55, 0.95)';

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
            transparent 0%,
            ${lead} 20%,
            ${mid} 50%,
            ${ink} 80%,
            transparent 100%);
          background-size: 420% 100%;
          background-position: 200% 50%;
          -webkit-background-clip: text;
          background-clip: text;
          opacity: 0;
          filter: blur(0.4px);
        }
        .gtr-${rawId}.is-running::before {
          animation: gtrSweep-${rawId} ${duration}ms ${ease} forwards,
                     gtrSweepBlur-${rawId} ${duration}ms ${ease} forwards;
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
        @keyframes gtrSweepBlur-${rawId} {
          0% { filter: blur(0.4px); }
          15% { filter: blur(2px); }
          40% { filter: blur(${sweepBlur}px); }
          55% { filter: blur(${sweepBlur}px); }
          75% { filter: blur(3px); }
          100% { filter: blur(0.4px); }
        }
        @keyframes gtrGlow-${rawId} {
          0% { text-shadow: 0 0 0 rgba(0,0,0,0), 0 0 0 rgba(0,0,0,0), 0 0 0 rgba(0,0,0,0); }
          30% { text-shadow: 0 0 2px ${hexToRgba(lead, 0.45)}, 0 0 10px ${hexToRgba(mid, 0.35)}, 0 0 22px ${hexToRgba(ink, 0.15)}; }
          60% { text-shadow: 0 0 2px ${hexToRgba(lead, 0.45)}, 0 0 8px ${hexToRgba(mid, 0.35)}, 0 0 16px ${hexToRgba(ink, 0.15)}; }
          100% { text-shadow: 0 0 0 rgba(0,0,0,0), 0 0 0 rgba(0,0,0,0), 0 0 0 rgba(0,0,0,0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gtr-${rawId}, .gtr-${rawId} .gtr-inner, .gtr-${rawId}::before { animation: none !important; }
          .gtr-${rawId} { opacity: 1; }
          .gtr-${rawId} .gtr-inner { opacity: 1; filter: none; color: ${ink}; }
        }
      `}</style>
      <span
        className={gradientRevealTextNormalVariants({ variant, className })}
        style={style}
      >
        <span className={`gtr-${rawId}${running ? ' is-running' : ''}`} data-text={text}>
          <span className="gtr-inner">{text}</span>
        </span>
      </span>
    </>
  );
}
