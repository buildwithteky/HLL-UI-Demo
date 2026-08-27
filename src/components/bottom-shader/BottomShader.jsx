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
import {
  HOST_HEIGHT,
  CANVAS_HEIGHT,
  FADE_HOLD_END,
  FADE_SOLID_START,
  FADE_COLOR,
} from './bottom-shader-definition.js';
import { bottomShaderVariants, resolveVariantColors } from './bottom-shader-variants.js';
import './bottom-shader.css';

// This crop's own layout knobs (host height, canvas height, fade stops/
// color — see bottom-shader-definition.js), fed to bottom-shader.css as CSS
// custom properties. A caller's own `style` is spread after, so it can
// still override any of these (or `height`/`position`/etc. directly) same
// as before.
const LAYOUT_STYLE = {
  '--bottom-shader-height': HOST_HEIGHT,
  '--bottom-shader-canvas-height': CANVAS_HEIGHT,
  '--bottom-shader-fade-hold-end': `${FADE_HOLD_END}%`,
  '--bottom-shader-fade-solid-start': `${FADE_SOLID_START}%`,
  '--bottom-shader-fade-color': FADE_COLOR,
};

export default function BottomShader({
  variant = 'services',
  colors,
  pauseOnDoubleClick = true,
  disabled = false,
  className,
  style,
  ...rest
}) {
  const canvasRef = useRef(null);
  const resolvedColors = colors && colors.length >= 2 ? colors : resolveVariantColors(variant);

  // Like Shader's `disabled`: an inert, dimmed state. The WebGL effect is
  // idle work (a rAF loop + a window pointermove listener) even when
  // nothing changes visually, so `disabled` skips creating it entirely
  // instead of mounting it just to sit there.
  useEffect(() => {
    if (disabled) return undefined;
    const fx = createShaderFX(canvasRef.current, {
      colors: resolvedColors,
      settings: BASE_SETTINGS,
      multiplier: MULTIPLIER,
      blueNoiseSize: BLUE_NOISE_SIZE,
      pauseOnDoubleClick,
    });
    return () => fx.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, colors?.join(','), pauseOnDoubleClick, disabled]);

  return (
    <div
      className={bottomShaderVariants({ variant, disabled: disabled || undefined, className })}
      style={{ ...LAYOUT_STYLE, ...style }}
      {...rest}
    >
      <canvas ref={canvasRef} className="bottom-shader__canvas" />
    </div>
  );
}
