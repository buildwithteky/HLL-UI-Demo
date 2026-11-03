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
import { useEffect, useRef, useState } from 'react';
import { createShaderFX } from './shader-runtime.js';
import { BASE_SETTINGS, MULTIPLIER, BLUE_NOISE_SIZE } from './shader-definition.js';
import { shaderVariants, resolveVariantColors } from './shader-variants.js';
import BottomShaderControls from '../bottom-shader/BottomShaderControls.jsx';
import { SHADER_GROUPS } from '../bottom-shader/bottom-shader-controls-schema.js';
import './shader.css';

function ShaderBase({
  variant = 'services',
  colors,
  // Defaults to the original opaque, full-bleed BASE_SETTINGS — every
  // existing usage keeps its current look. Pass a clone with
  // `background.transparent: true` (see shader-runtime.js's
  // `transparentBg`) for a usage that needs whatever's behind the canvas
  // to show through instead, e.g. MenuTriggerOverlay.jsx layering this
  // over Services.png.
  settings = BASE_SETTINGS,
  // Optional: used AS-IS (not cloned) so a control panel can mutate it in
  // place and the shader reacts next frame with no remount.
  liveSettings: liveSettingsProp,
  pauseOnDoubleClick = true,
  disabled = false,
  className,
  style,
  ...rest
}) {
  const canvasRef = useRef(null);
  const fxRef = useRef(null);
  const resolvedColors = colors && colors.length >= 2 ? colors : resolveVariantColors(variant);

  // Like HLLButton's `disabled`: an inert, dimmed state. The WebGL effect
  // is idle work (a rAF loop + a window pointermove listener) even when
  // nothing changes visually, so `disabled` skips creating it entirely
  // instead of mounting it just to sit there — same as the button not
  // wiring up its hover/click listeners while disabled.
  useEffect(() => {
    if (disabled) return undefined;
    // Cloned once per mount so shader-runtime.js's live mutation of the
    // settings object it's handed never mutates a caller-supplied object
    // or the shared BASE_SETTINGS default — other Shader instances
    // importing the same constant would otherwise see it drift too.
    const liveSettings = liveSettingsProp || JSON.parse(JSON.stringify(settings));
    const fx = createShaderFX(canvasRef.current, {
      colors: resolvedColors,
      settings: liveSettings,
      multiplier: MULTIPLIER,
      blueNoiseSize: BLUE_NOISE_SIZE,
      pauseOnDoubleClick,
      alwaysAlpha: !!liveSettingsProp,
    });
    fxRef.current = fx;
    return () => { fxRef.current = null; fx.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pauseOnDoubleClick, disabled, settings, liveSettingsProp]);

  // Gradient colors swap live (texture rebuild) instead of remounting.
  const colorKey = resolvedColors.join(',');
  useEffect(() => {
    fxRef.current?.setColors(resolvedColors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorKey]);

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

// Public component. `controls` mounts the unrestricted live parameter panel
// next to the shader: <Shader variant="hll-application" controls />.
export default function Shader({ controls = false, ...props }) {
  return controls ? <ShaderWithControls {...props} /> : <ShaderBase {...props} />;
}

function ShaderWithControls({ settings = BASE_SETTINGS, variant = 'services', colors, ...props }) {
  const live = useRef(null);
  if (!live.current) {
    // Fill keys the runtime defaults internally so every control shows a real value.
    const c = JSON.parse(JSON.stringify(settings));
    c.bokeh.spread ??= 1;
    c.output.capAmount ??= 0;
    c.background.transparent ??= false;
    live.current = c;
  }
  const [config, setConfig] = useState(() => ({
    colors: colors && colors.length >= 2 ? colors : resolveVariantColors(variant),
  }));
  return (
    <>
      <ShaderBase {...props} variant={variant} colors={config.colors} liveSettings={live.current} />
      <BottomShaderControls
        title="Shader"
        groups={SHADER_GROUPS}
        targets={[{ id: 'shader', label: 'Shader', settings: live.current, config, setConfig }]}
      />
    </>
  );
}
