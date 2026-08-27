// Tag.jsx — the single, reusable Tag component.
//
// Same "one implementation, variant picks color" shape as HLLButton.jsx: a
// `variant` prop selects a predefined gradient (see tag-variants.js),
// everything else — shape, blur, glow, typography, render mode — comes from
// tag-definition.js and is shared by every variant unchanged. Unlike the
// button there's no hover/active state at all (TAG_STATIC in Studio's
// presets.js: hover false, cursorLight false, clickPulse false) — a tag is a
// single, static, fully-blurred colour blob.
//
// Per LightFX Studio's presets.js comment: "Both tags are chips: a leading
// 'x' icon (removable-filter affordance) plus a label ... The pill always
// hugs its content at a constant padding as the label text changes" — so,
// unlike the button's fixed box, this has no explicit width/height style;
// the shader canvas (tag-runtime.js's LightComponent) auto-fits to
// whatever size the host element renders at via CSS padding.
import { useEffect, useRef } from 'react';
import { LightComponent, cloneDefinition } from './tag-runtime.js';
import { BASE_DEFINITION } from './tag-definition.js';
import { tagVariants, resolveVariantColors, SIZE_SCALE } from './tag-variants.js';
import './tag.css';

// plus.svg's own paths, at its native stroke width (0.5) — reproduced
// inline (rather than <img src="./plus.svg">) so the viewBox can be cropped
// tight to the glyph's actual bounding box (it only fills the middle ~30%
// of the source file's 14x14 canvas) and so vector-effect can pin the
// stroke to a constant on-screen width: enlarging the icon to track the
// label's font-size should make the mark bigger, not its lines thicker.
function RemoveIcon() {
  return (
    <svg viewBox="4.32 4.14 5.24 5.24" aria-hidden="true">
      <path
        d="M4.82129 8.88304L9.06393 4.6404"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M9.06348 8.88304L4.82084 4.6404"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// The only per-variant/override work: swap the gradient's colors (and the
// glow color that follows them) into a clone of the shared base definition.
// Every other field — shape, effects, interaction, render mode, typography
// — passes through untouched.
function buildDefinition(variant, overrides) {
  const definition = cloneDefinition(BASE_DEFINITION);
  const { colors, glowColor } =
    overrides.gradient && overrides.gradient.length >= 2
      ? { colors: overrides.gradient, glowColor: overrides.gradient[overrides.gradient.length - 1] }
      : resolveVariantColors(variant);

  definition.params.base.colors = colors;
  definition.params.base.glowColor = glowColor;
  definition.params.hover.colors = colors;
  definition.params.hover.glowColor = glowColor;

  return definition;
}

export default function Tag({
  variant = 'warm',
  gradient,
  size = 'md',
  removable = true,
  onRemove,
  disabled = false,
  className,
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);

  // The shader engine owns its own draw loop entirely through
  // tag-runtime.js — no React state, no re-renders. The effect only
  // re-runs when a value that actually changes the definition changes.
  useEffect(() => {
    const fx = new LightComponent(ref.current, buildDefinition(variant, { gradient }));
    return () => fx.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, gradient?.join(',')]);

  const { text } = BASE_DEFINITION;
  const scale = SIZE_SCALE[size] ?? 1;
  const label = children ?? text.content;
  const fontSize = Math.round(text.fontSize * scale);
  const iconSize = Math.round(fontSize * 1.1);

  return (
    <span
      ref={ref}
      className={tagVariants({ variant, size, disabled: disabled || undefined, className })}
      style={{
        padding: `${Math.round(6 * scale)}px ${Math.round(14 * scale)}px`,
        '--tag-label-color': text.color,
        ...style,
      }}
      {...rest}
    >
      {removable && (
        <button
          type="button"
          className="tag__remove"
          disabled={disabled}
          aria-label={`Remove ${typeof label === 'string' ? label : 'tag'}`}
          onClick={onRemove}
          style={{ width: iconSize, height: iconSize }}
        >
          <RemoveIcon />
        </button>
      )}
      <span
        className="tag__label"
        style={{
          fontFamily: text.fontFamily || 'inherit',
          fontSize,
          fontWeight: text.fontWeight,
          letterSpacing: text.letterSpacing,
        }}
      >
        {label}
      </span>
    </span>
  );
}
