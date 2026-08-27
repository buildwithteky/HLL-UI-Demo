// BottomShader.jsx — the same "BlockGL — jewel refraction" WebGL2 effect as
// Shader (../shader/shader-runtime.js + shader-definition.js, reused
// as-is — not forked), just anchored to the bottom of the viewport instead
// of covering it fullscreen. A separate bottom-shader-runtime.js used to
// exist here with its own tuned settings/output pass; it produced a visibly
// different (wrong) animation from Shader's, so it's gone — this is now
// purely a positioning variant of the one real engine, the way the design
// was always supposed to work.
//
// Same one-component-many-variants approach as Shader/HLLButton: a
// `variant` prop selects one of the design system's per-service gradients
// (see bottom-shader-variants.js, structurally identical to
// shader-variants.js). `colors` exists as an explicit one-off override,
// same role as Shader's `colors` prop.
import { useEffect, useRef } from 'react';
import { createShaderFX } from '../shader/shader-runtime.js';
import { BASE_SETTINGS, MULTIPLIER, BLUE_NOISE_SIZE } from '../shader/shader-definition.js';
import { DEFAULT_LAYOUT } from './bottom-shader-definition.js';
import { bottomShaderVariants, resolveVariantColors } from './bottom-shader-variants.js';
import './bottom-shader.css';

// This crop's own layout knobs (host height, canvas height, fade stops/
// color — see bottom-shader-definition.js's `layout` object), fed to
// bottom-shader.css as CSS custom properties. A caller's own `style` is
// spread after, so it can still override any of these (or `height`/
// `position`/etc. directly) same as before.
function layoutStyle(layout) {
  return {
    '--bottom-shader-height': layout.HOST_HEIGHT,
    '--bottom-shader-canvas-height': layout.CANVAS_HEIGHT,
    '--bottom-shader-fade-hold-end': `${layout.FADE_HOLD_END}%`,
    '--bottom-shader-fade-solid-start': `${layout.FADE_SOLID_START}%`,
    '--bottom-shader-fade-color': layout.FADE_COLOR,
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default function BottomShader({
  variant = 'services',
  colors,
  settings = BASE_SETTINGS,
  // `atEnd`/`endShatter` together are the "scrolled to the bottom of the
  // page" transition (see ServicesScrollDemo.jsx): when the caller flips
  // `atEnd` to true, shatter.scale/amount smoothly ease toward
  // `endShatter` (a { scale, amount } pair — the effect gets visibly more
  // "shattered"), and `settings.output.capAmount` (read live by
  // shader-runtime.js's output pass — see its `uCapAmount`) eases from 0 to
  // 1, easing the SAME canvas from its normal see-through, hard-light-
  // composited look into a fully opaque `settings.output.color` plate.
  // There's deliberately no second element and no `mix-blend-mode`
  // switching involved: a hard-light-blended, fully opaque, pure-white top
  // layer is visually identical to a plain unblended one, so this one
  // canvas reads as "hard-light removed" the moment it's fully capped,
  // without ever being visually split into two separately-composited
  // things. Omit `endShatter` to skip all of this (default): no extra rAF
  // loop, `atEnd` is ignored.
  atEnd = false,
  endShatter,
  // Overrides the default 50vh host/fade/pointer-bound layout (see
  // bottom-shader-definition.js's `makeBottomShaderLayout`) — e.g.
  // ServicesScrollDemo's half-height footer strip passes its own here
  // instead of hand-deriving the fade/pointer math to match a shorter host.
  layout = DEFAULT_LAYOUT,
  pauseOnDoubleClick = true,
  disabled = false,
  className,
  style,
  ...rest
}) {
  const canvasRef = useRef(null);
  const resolvedColors = colors && colors.length >= 2 ? colors : resolveVariantColors(variant);

  // Read by the transition rAF loop below every frame via `atEndRef.current`
  // instead of closing over the `atEnd` prop directly — that lets the loop
  // (started once per mount, inside the effect below) always see the latest
  // value without needing to be torn down and restarted (which would
  // recreate the whole WebGL context) every time the caller's scroll
  // handler flips the flag.
  const atEndRef = useRef(atEnd);
  atEndRef.current = atEnd;

  // Like Shader's `disabled`: an inert, dimmed state. The WebGL effect is
  // idle work (a rAF loop + a window pointermove listener) even when
  // nothing changes visually, so `disabled` skips creating it entirely
  // instead of mounting it just to sit there.
  useEffect(() => {
    if (disabled) return undefined;
    // Cloned once per mount so the transition loop below (and the shared
    // `settings` object shader-runtime.js reads live every frame) never
    // mutates a caller-supplied object or the shared BASE_SETTINGS default
    // — other BottomShader/Shader instances importing the same constant
    // would otherwise see their shatter amount silently drift too.
    const liveSettings = JSON.parse(JSON.stringify(settings));
    const fx = createShaderFX(canvasRef.current, {
      colors: resolvedColors,
      settings: liveSettings,
      multiplier: MULTIPLIER,
      blueNoiseSize: BLUE_NOISE_SIZE,
      pauseOnDoubleClick,
      pointerMaxY: layout.POINTER_MAX_Y,
    });

    let raf = null;
    if (endShatter) {
      const baseShatter = { scale: settings.shatter.scale, amount: settings.shatter.amount };
      let progress = 0; // 0 = resting settings/see-through hard-light, 1 = endShatter/opaque cap

      const tick = () => {
        const target = atEndRef.current ? 1 : 0;
        progress = lerp(progress, target, 0.08);
        if (Math.abs(progress - target) < 0.001) progress = target;

        liveSettings.shatter.scale = lerp(baseShatter.scale, endShatter.scale, progress);
        liveSettings.shatter.amount = lerp(baseShatter.amount, endShatter.amount, progress);
        liveSettings.output.capAmount = progress;

        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      if (raf != null) cancelAnimationFrame(raf);
      fx.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, colors?.join(','), pauseOnDoubleClick, disabled, settings, endShatter, layout]);

  return (
    <div
      className={bottomShaderVariants({ variant, disabled: disabled || undefined, className })}
      style={{ ...layoutStyle(layout), ...style }}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        className={`bottom-shader__canvas${endShatter ? ' bottom-shader__canvas--overlay' : ''}`}
      />
    </div>
  );
}
