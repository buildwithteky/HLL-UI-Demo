// Ripple.jsx — React wrapper around the "HLL Ripples" p5.js sketch, exported
// as a standalone HTML page (index.html/sketch.js/style.css) by another
// tool; shader.vert/shader.frag are that export's original shader files,
// kept as-is. The shader, uniforms and baked params/palette below are
// copied verbatim from the exported sketch.js — nothing about the visual
// behavior was changed.
//
// The only adaptation is structural: p5's original global-mode sketch
// (preload/setup/draw as window-level functions, loadShader() fetching the
// .vert/.frag files over the network) doesn't fit a component that can
// mount/unmount and can't rely on a global namespace, so this uses p5's
// instance mode instead, and loads the shader source via Vite's `?raw`
// import (already exact GLSL text) instead of a network fetch.
import { useEffect, useRef } from 'react';
import p5 from 'p5';
import vertSrc from './shader.vert?raw';
import fragSrc from './shader.frag?raw';

const MAX_RIPPLES = 32;

// baked parameters (were the live slider values)
const params = {
  bands: 5,
  speed: 0.9,
  flow: 0.2,
  shear: 0.3,
  shape: 0,
  rippleNoise: 0,
  rippleSpacing: 0.96,
  ox: 0.5,
  oy: 0.47,
  motion: 1,
  soft: 4,
  scale: 5.5,
  rot: 0,
  wobble: 0.08,
  saturation: 0,
  vibrancy: 0.66,
  contrast: 1.15,
};

// baked palette (resolved from either the custom palette or the selected
// gradient set)
const paletteColors = [
  [0.22, 0.49, 0.84],
  [0.47, 0.53, 0.9],
  [0.63, 0.51, 0.75],
  [0.75, 0.49, 0.78],
  [0.95, 0.54, 0.52],
  [0.97, 0.15, 0.17],
];
const usingCustomPalette = false;

// tap-ripple state (baked from export time, still interactive if tap mode
// was on)
const tapRippleMode = false;

function sketch(p) {
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

    const spacedPoints = getSpacedRipplePoints(params.rippleSpacing);

    const rippleArray = [];
    for (let i = 0; i < MAX_RIPPLES; i++) {
      if (i < spacedPoints.length) {
        rippleArray.push(spacedPoints[i].x, spacedPoints[i].y);
      } else {
        rippleArray.push(-10);
        rippleArray.push(-10);
      }
    }

    shaderProgram.setUniform('uTapRippleMode', tapRippleMode);
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

    shaderProgram.setUniform('uPalette', paletteColors.flat());
    shaderProgram.setUniform('uUseCustomPalette', usingCustomPalette);

    p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
  };

  p.mousePressed = () => {
    if (!tapRippleMode) return;

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

export default function Ripple() {
  const hostRef = useRef(null);

  useEffect(() => {
    const instance = new p5(sketch, hostRef.current);
    return () => instance.remove();
  }, []);

  return <div ref={hostRef} className="ripple-host" />;
}
