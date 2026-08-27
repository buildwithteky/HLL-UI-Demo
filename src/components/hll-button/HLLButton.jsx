// HLLButton.jsx — the single, reusable HLL Button component.
//
// One implementation for every page: a `variant` prop selects a predefined
// 2–3 color gradient (see hll-button-variants.js), everything else — shape,
// blur, glow, cursor-lens hover behavior, click pulse, typography — comes
// from hll-button-definition.js and is shared by every variant unchanged.
// There is no per-page button component and no per-usage color props for
// everyday use. `gradient`/`direction`/`radius`/`glow` exist as explicit
// one-off overrides (used by Studio's Docs playground) — not a substitute
// for adding a real variant, see the README.
//
// Kept in sync by hand with Studio's own copy of this file
// (HLL UI Studio/src/lightfx/hll-button/HLLButton.jsx) — same component
// logic and prop API; only the source of `hll-button-definition.js` differs
// (a static copy here vs. Studio's live Firebase-backed preset), out of
// necessity: an exported component has no Studio/Firebase access and must
// work fully offline.
import { useEffect, useRef } from 'react';
import { LightComponent, cloneDefinition } from './hll-button-runtime.js';
import { BASE_DEFINITION } from './hll-button-definition.js';
import { hllButtonVariants, resolveVariantColors, SIZE_SCALE } from './hll-button-variants.js';
import './hll-button.css';

// The only per-variant/override work: swap the gradient's colors (and the
// glow color that follows them) into a clone of the shared base definition,
// then apply any explicit overrides. Every other field — shape, effects,
// interaction/cursor-lens tuning, render mode, typography — passes through
// untouched, so "hover", "active" (click pulse), and cursor-lens behavior
// are identical across variants; only the color (and, if overridden,
// direction/radius/glow) changes.
function buildDefinition(variant, overrides) {
  const definition = cloneDefinition(BASE_DEFINITION);
  const { colors, glowColor } =
    overrides.gradient && overrides.gradient.length >= 2
      ? { colors: overrides.gradient, glowColor: overrides.gradient[0] }
      : resolveVariantColors(variant);

  definition.params.base.colors = colors;
  definition.params.base.glowColor = glowColor;
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
    // This preset's visible "glow" comes from the hover fill's own blur
    // radius (bloom/glowIntensity are 0 here), not a separate glow term.
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

export default function HLLButton({
  variant = 'services',
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
  // listeners (pointerenter/leave/move/down in hll-button-runtime.js) — no
  // React state, no re-renders on hover. The effect only re-runs when a
  // value that actually changes the definition changes.
  useEffect(() => {
    const fx = new LightComponent(
      ref.current,
      buildDefinition(variant, { gradient, direction, radius, glow, animated, size })
    );
    return () => fx.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, gradient?.join(','), direction, radius, glow, animated, size]);

  const isButtonTag = Tag === 'button';
  const isInert = disabled || isLoading;
  const { text, box } = BASE_DEFINITION;
  const scale = SIZE_SCALE[size] ?? 1;
  // Width follows the label instead of a fixed px value: the button stays
  // an inline-flex box sized by its content, with equal left/right padding
  // (BASE_DEFINITION.text.padding, scaled with size) around the label —
  // so left/right space around the text is always the same regardless of
  // how long the text is. Height stays fixed, matching every other variant.
  const hPadding = Math.round(text.padding * scale);

  return (
    <Tag
      ref={ref}
      type={isButtonTag ? type || 'button' : undefined}
      disabled={isButtonTag ? isInert : undefined}
      aria-disabled={!isButtonTag ? isInert || undefined : undefined}
      aria-busy={isLoading || undefined}
      className={hllButtonVariants({
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
        '--hll-label-color': text.color,
        '--hll-label-hover-color': text.hoverColor,
        ...style,
      }}
      {...rest}
    >
      <span
        className="hll-button__label"
        style={{
          fontFamily: text.fontFamily || 'inherit',
          fontSize: text.fontSize,
          fontWeight: 400,
          letterSpacing: text.letterSpacing,
        }}
      >
        {children}
      </span>
      {isLoading && <span className="hll-button__spinner" aria-hidden="true" />}
    </Tag>
  );
}
