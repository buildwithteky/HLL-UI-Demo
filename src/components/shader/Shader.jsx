// Shader.jsx — React wrapper around the "BlockGL — jewel refraction" WebGL2
// effect, exported as a standalone page (index.pen.html, kept in this
// folder as the source reference) by another tool.
//
// Same one-component-many-variants approach as HLLButton: a `variant` prop
// selects one of the design system's predefined menu-item (services/
// industries/engagement/about/contact) or per-service gradients (see
// shader-variants.js, copied from hll-button-variants.js's
// VARIANT_GRADIENTS) — the vignette/sine/shatter/bokeh/output shape all
// comes from shader-definition.js and is shared by every variant unchanged.
// `colors` exists as an explicit one-off override, same role as HLLButton's
// `gradient` prop.
//
// The original is a static page script (module-level state, a
// document.body.innerHTML takeover if WebGL2 isn't available, a
// window-resize listener sized to the whole viewport). shader-runtime.js
// wraps the same render pipeline in a factory — createShaderFX(canvas,
// options) — so it can mount more than once and clean up on unmount; this
// component just owns the effect's lifecycle and sizes the canvas to
// whatever its host element renders at (see shader.css) instead of the
// full page.
import { useEffect, useRef } from 'react';
import { createShaderFX } from './shader-runtime.js';
import { BASE_SETTINGS, MULTIPLIER, BLUE_NOISE_SIZE } from './shader-definition.js';
import { shaderVariants, resolveVariantColors } from './shader-variants.js';
import './shader.css';

export default function Shader({
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

  // Like HLLButton's `disabled`: an inert, dimmed state. The WebGL effect
  // is idle work (a rAF loop + a window pointermove listener) even when
  // nothing changes visually, so `disabled` skips creating it entirely
  // instead of mounting it just to sit there — same as the button not
  // wiring up its hover/click listeners while disabled.
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
      className={shaderVariants({ variant, disabled: disabled || undefined, className })}
      style={style}
      {...rest}
    >
      <canvas ref={canvasRef} className="shader__canvas" />
    </div>
  );
}
