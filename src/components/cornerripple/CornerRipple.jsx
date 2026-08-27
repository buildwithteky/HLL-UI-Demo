// CornerRipple.jsx — React wrapper around the "HLL Ripples" p5.js sketch
// (corner-origin layout), exported as a standalone HTML page by another
// tool; shader.vert/shader.frag are that export's original shader files,
// kept as-is.
//
// Same one-component-many-variants approach as HLLButton/Ripple: a
// `variant` prop selects one of the design system's predefined gradients
// (see cornerripple-variants.js) — everything else (motion, bands,
// softness, corner origin layout) comes from cornerripple-definition.js and
// is shared by every variant unchanged. `palette` exists as an explicit
// one-off override, same role as HLLButton's `gradient` prop.
import { useEffect, useRef } from 'react';
import p5 from 'p5';
import vertSrc from './shader.vert?raw';
import fragSrc from './shader.frag?raw';
import { MAX_RIPPLES, BASE_PARAMS, TAP_RIPPLE_MODE } from './cornerripple-definition.js';
import { cornerRippleVariants, resolveVariantPalette, buildPalette } from './cornerripple-variants.js';
import './corner-ripple.css';

function sketch(p, getPalette) {
  let shaderProgram;
  let ripplePoints = [];

  function getSpacedRipplePoints(spacing) {
    if (ripplePoints.length === 0) return [];

    let cx = 0;
    let cy = 0;

    for (const pt of ripplePoints) {
      cx += pt.x;
      cy += pt.y;
    }

    cx /= ripplePoints.length;
    cy /= ripplePoints.length;

    return ripplePoints.map((pt) => ({
      x: cx + (pt.x - cx) * spacing,
      y: cy + (pt.y - cy) * spacing,
    }));
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.noStroke();
    shaderProgram = p.createShader(vertSrc, fragSrc);
  };

  p.draw = () => {
    p.background(0);
    p.shader(shaderProgram);

    const spacedPoints = getSpacedRipplePoints(BASE_PARAMS.rippleSpacing);

    const rippleArray = [];
    for (let i = 0; i < MAX_RIPPLES; i++) {
      if (i < spacedPoints.length) {
        rippleArray.push(spacedPoints[i].x, spacedPoints[i].y);
      } else {
        rippleArray.push(-10);
        rippleArray.push(-10);
      }
    }

    shaderProgram.setUniform('uTapRippleMode', TAP_RIPPLE_MODE);
    shaderProgram.setUniform('uRippleCount', spacedPoints.length);
    shaderProgram.setUniform('uRipplePoints', rippleArray);

    shaderProgram.setUniform('uTime', p.millis() * 0.001);
    shaderProgram.setUniform('uResolution', [p.width, p.height]);

    shaderProgram.setUniform('uBands', BASE_PARAMS.bands);
    shaderProgram.setUniform('uSpeed', BASE_PARAMS.speed);
    shaderProgram.setUniform('uFlowStrength', BASE_PARAMS.flow);
    shaderProgram.setUniform('uShearStrength', BASE_PARAMS.shear);
    shaderProgram.setUniform('uRippleShape', BASE_PARAMS.shape);
    shaderProgram.setUniform('uRippleNoise', BASE_PARAMS.rippleNoise);
    shaderProgram.setUniform('uRippleGap', BASE_PARAMS.rippleSpacing);

    shaderProgram.setUniform('uOrigin', [BASE_PARAMS.ox, BASE_PARAMS.oy]);

    shaderProgram.setUniform('uGradientMotion', BASE_PARAMS.motion);
    shaderProgram.setUniform('uGradientSoftness', BASE_PARAMS.soft);
    shaderProgram.setUniform('uGradientScale', BASE_PARAMS.scale);
    shaderProgram.setUniform('uGradientRotation', BASE_PARAMS.rot);
    shaderProgram.setUniform('uGradientWobble', BASE_PARAMS.wobble);

    shaderProgram.setUniform('uSaturation', BASE_PARAMS.saturation);
    shaderProgram.setUniform('uVibrancy', BASE_PARAMS.vibrancy);
    shaderProgram.setUniform('uContrast', BASE_PARAMS.contrast);

    shaderProgram.setUniform('uPalette', getPalette().flat());
    shaderProgram.setUniform('uUseCustomPalette', false);

    p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
  };

  p.mousePressed = () => {
    if (!TAP_RIPPLE_MODE) return;

    ripplePoints.push({
      x: p.mouseX / p.width,
      y: 1.0 - p.mouseY / p.height,
    });

    if (ripplePoints.length > MAX_RIPPLES) {
      ripplePoints.shift();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
}

export default function CornerRipple({ variant = 'enterprise', palette, className, style }) {
  const hostRef = useRef(null);
  const resolvePalette = () =>
    palette && palette.length >= 2 ? buildPalette(palette) : resolveVariantPalette(variant);
  const paletteRef = useRef(resolvePalette());

  paletteRef.current = resolvePalette();

  useEffect(() => {
    const instance = new p5((p) => sketch(p, () => paletteRef.current), hostRef.current);
    return () => instance.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={hostRef}
      className={cornerRippleVariants({ variant, className })}
      style={style}
    />
  );
}
