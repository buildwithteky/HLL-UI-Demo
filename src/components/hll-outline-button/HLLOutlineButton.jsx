// HLLOutlineButton.jsx — the single, reusable HLL Outline Button component,
// ported from LightFX Studio's "Outline Rectangle — Lens Blur" preset.
//
// One implementation for every service: a `variant` prop selects one of the
// six per-service 2-color gradients (see hll-outline-button-variants.js),
// everything else — shape (a hollow stroke, not a fill — see
// hll-outline-button-definition.js's shape.strokeWidth), blur, glow,
// cursor-lens hover behavior, typography — comes from
// hll-outline-button-definition.js and is shared by every variant unchanged.
// There is no per-usage color prop for everyday use, same rule as HLLButton.
//
// Width tracks the label exactly like HLLButton.jsx: no explicit width is
// set on the host, so `.hll-outline-button`'s `display: inline-flex`
// (hll-outline-button.css) sizes it to content, with equal left/right
// padding (BASE_DEFINITION.text.padding, scaled with size) around the
// label — the box hugs the text instead of a fixed px value.
import { useEffect, useRef } from 'react';
import { LightComponent, cloneDefinition } from './hll-outline-button-runtime.js';
import { BASE_DEFINITION } from './hll-outline-button-definition.js';
import { hllOutlineButtonVariants, resolveVariantColors, SIZE_SCALE } from './hll-outline-button-variants.js';
import './hll-outline-button.css';

// The only per-variant/override work: swap the gradient's colors (and the
// glow color that follows them) into a clone of the shared base definition,
// then apply any explicit overrides. Every other field — shape, effects,
// interaction/cursor-lens tuning, render mode, typography — passes through
// untouched, so hover and cursor-lens behavior are identical across
// variants; only the color (and, if overridden, direction/radius/glow)
// changes. Base stays the plain gray hairline from the preset — only the
// hover gradient follows the variant, matching the preset's own resting/
// hover split.
function buildDefinition(variant, overrides) {
  const definition = cloneDefinition(BASE_DEFINITION);
  const { colors, glowColor } =
    overrides.gradient && overrides.gradient.length >= 2
      ? { colors: overrides.gradient, glowColor: overrides.gradient[0] }
      : resolveVariantColors(variant);

  definition.params.hover.colors = colors;
  definition.params.hover.glowColor = glowColor;

  if (overrides.direction != null) {
    definition.params.base.gradientAngle = overrides.direction;
    definition.params.hover.gradientAngle = overrides.direction;
  }
  if (overrides.radius != null) {
    definition.shape.cornerRadius = overrides.radius;
  }
  if (overrides.glow != null) {
    definition.params.hover.blur = overrides.glow;
  }
  if (overrides.animated === false) {
    definition.interaction.hover = false;
  }

  const scale = SIZE_SCALE[overrides.size] ?? 1;
  definition.box = {
    ...definition.box,
    width: Math.round(definition.box.width * scale),
    height: Math.round(definition.box.height * scale),
  };

  return definition;
}

// Builds a fully independent, mutable definition for one variant — the object
// the live control panel edits in place. Pass it back as `definition` and the
// button renders from it directly (no per-prop overrides applied on top).
export function createLiveDefinition(variant = 'hll-ai') {
  return buildDefinition(variant, {});
}

export default function HLLOutlineButton({
  definition: liveDefinition,
  variant = 'hll-ai',
  gradient,
  direction,
  radius,
  glow,
  animated = true,
  size = 'md',
  as: Tag = 'button',
  type,
  className,
  style,
  disabled = false,
  isLoading = false,
  children,
  ...rest
}) {
  const ref = useRef(null);

  // The shader engine owns hover/active entirely through its own DOM
  // listeners (pointerenter/leave/move/down in hll-outline-button-runtime.js)
  // — no React state, no re-renders on hover. The effect only re-runs when a
  // value that actually changes the definition changes.
  useEffect(() => {
    const fx = new LightComponent(
      ref.current,
      liveDefinition || buildDefinition(variant, { gradient, direction, radius, glow, animated, size })
    );
    return () => fx.dispose();
    // bleed / maxDpr size the canvas at construction, so they rebuild it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, gradient?.join(','), direction, radius, glow, animated, size, liveDefinition, liveDefinition?.tune?.bleed, liveDefinition?.tune?.maxDpr]);

  const isButtonTag = Tag === 'button';
  const isInert = disabled || isLoading;
  const { text, box } = liveDefinition || BASE_DEFINITION;
  // a live definition's box is already size-scaled when it was created
  const scale = liveDefinition ? 1 : SIZE_SCALE[size] ?? 1;
  // Width follows the label instead of a fixed px value: the button stays
  // an inline-flex box sized by its content, with equal left/right padding
  // (BASE_DEFINITION.text.padding, scaled with size) around the label — so
  // left/right space around the text is always the same regardless of how
  // long the text is. Height stays fixed, matching every other variant.
  const hPadding = Math.round(text.padding * scale);
  const css = liveDefinition?.css || {};

  return (
    <Tag
      ref={ref}
      type={isButtonTag ? type || 'button' : undefined}
      disabled={isButtonTag ? isInert : undefined}
      aria-disabled={!isButtonTag ? isInert || undefined : undefined}
      aria-busy={isLoading || undefined}
      className={hllOutlineButtonVariants({
        variant,
        size,
        disabled: isInert || undefined,
        loading: isLoading || undefined,
        className,
      })}
      style={{
        height: Math.round(box.height * scale),
        paddingLeft: hPadding,
        paddingRight: hPadding,
        whiteSpace: 'nowrap',
        '--hll-outline-label-color': text.color,
        '--hll-outline-label-hover-color': text.hoverColor,
        ...(liveDefinition && css.width != null ? { width: css.width } : null),
        ...style,
      }}
      {...rest}
    >
      <span
        className="hll-outline-button__label"
        style={{
          fontFamily: text.fontFamily || 'inherit',
          fontSize: text.fontSize,
          fontWeight: text.fontWeight,
          letterSpacing: text.letterSpacing,
          ...(liveDefinition ? { textTransform: css.textTransform || undefined, lineHeight: css.lineHeight ?? undefined } : null),
        }}
      >
        {liveDefinition && text.content != null && text.content !== '' && children == null ? text.content : children}
      </span>
      {isLoading && <span className="hll-outline-button__spinner" aria-hidden="true" />}
    </Tag>
  );
}
