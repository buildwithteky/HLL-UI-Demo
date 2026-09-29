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
import { MAX_RIPPLES, TAP_RIPPLE_MODE, resolveVariantParams } from './cornerripple-definition.js';
import { cornerRippleVariants, resolveVariantPalette, buildPalette } from './cornerripple-variants.js';
import './corner-ripple.css';

// Render at reduced resolution and let CSS scale the canvas up: the output is
// a soft blurred gradient, so little detail is lost, and fragment cost drops
// ~4x (far more on hi-DPI screens, where p5 defaults to devicePixelRatio).
const RENDER_SCALE = 0.5;
const TARGET_FPS = 30;

function sketch(p, getPalette, getParams) {
  let shaderProgram;
  let ripplePoints = [];
  const rippleArray = new Array(MAX_RIPPLES * 2); // reused every frame
  let paletteSrc = null;
  let paletteFlat = null;

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
    p.pixelDensity(RENDER_SCALE);
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.frameRate(TARGET_FPS);
    p.noStroke();
    shaderProgram = p.createShader(vertSrc, fragSrc);
  };

  p.draw = () => {
    p.background(0);
    p.shader(shaderProgram);

    const params = getParams();
    const spacedPoints = getSpacedRipplePoints(params.rippleSpacing);

    rippleArray.fill(-10);
    for (let i = 0; i < spacedPoints.length && i < MAX_RIPPLES; i++) {
      rippleArray[i * 2] = spacedPoints[i].x;
      rippleArray[i * 2 + 1] = spacedPoints[i].y;
    }

    shaderProgram.setUniform('uTapRippleMode', TAP_RIPPLE_MODE);
    shaderProgram.setUniform('uRippleCount', spacedPoints.length);
    shaderProgram.setUniform('uRipplePoints', rippleArray);

    shaderProgram.setUniform('uTime', p.millis() * 0.001);
    shaderProgram.setUniform('uResolution', [p.width, p.height]);

    shaderProgram.setUniform('uBands', params.bands);
    shaderProgram.setUniform('uSpeed', params.speed);
    shaderProgram.setUniform('uFlowStrength', params.flow);
    shaderProgram.setUniform('uShearStrength', params.shear);
    shaderProgram.setUniform('uRippleShape', params.shape);
    shaderProgram.setUniform('uRippleNoise', params.rippleNoise);
    shaderProgram.setUniform('uRippleGap', params.rippleSpacing);

    shaderProgram.setUniform('uOrigin', [params.ox, params.oy]);

    shaderProgram.setUniform('uGradientMotion', params.motion);
    shaderProgram.setUniform('uGradientSoftness', params.soft);
    shaderProgram.setUniform('uGradientScale', params.scale);
    shaderProgram.setUniform('uGradientRotation', params.rot);
    shaderProgram.setUniform('uGradientWobble', params.wobble);

    shaderProgram.setUniform('uSaturation', params.saturation);
    shaderProgram.setUniform('uVibrancy', params.vibrancy);
    shaderProgram.setUniform('uContrast', params.contrast);

    const palette = getPalette();
    if (palette !== paletteSrc) {
      paletteSrc = palette;
      paletteFlat = palette.flat();
    }
    shaderProgram.setUniform('uPalette', paletteFlat);
    shaderProgram.setUniform('uUseCustomPalette', true);

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

export default function CornerRipple({ variant = 'hll-application', palette, className, style }) {
  const hostRef = useRef(null);
  const resolvePalette = () =>
    palette && palette.length >= 2 ? buildPalette(palette) : resolveVariantPalette(variant);
  const paletteRef = useRef(resolvePalette());

  paletteRef.current = resolvePalette();

  const paramsRef = useRef(resolveVariantParams(variant));
  paramsRef.current = resolveVariantParams(variant);

  useEffect(() => {
    const instance = new p5(
      (p) => sketch(p, () => paletteRef.current, () => paramsRef.current),
      hostRef.current
    );
    // Stop drawing while the effect isn't visible on screen.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) instance.loop();
      else instance.noLoop();
    });
    observer.observe(hostRef.current);
    return () => {
      observer.disconnect();
      instance.remove();
    };
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
