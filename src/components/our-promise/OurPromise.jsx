// OurPromise.jsx — React wrapper around the "Our Promise" p5.js sketch,
// originally exported as a standalone HTML page (index.html/sketch.js/
// style.css) by another tool; shader.vert/shader.frag are that export's
// original shader files, kept as-is. Same conversion approach as
// Ripple.jsx: p5 instance mode (no global preload/setup/draw, no
// loadShader() network fetch — shader source comes in via Vite's `?raw`
// import) so the sketch can mount/unmount as a normal component.
//
// Unlike Ripple, this piece is a full scroll-driven hero section: a fixed
// fullscreen canvas backdrop, a hero text overlay that fades/scales out,
// and an image reveal that fades/scales in as the same scroll progress
// crosses a fixed pixel threshold (SCROLL_TRIGGER_PX) — independent of the
// page's total scroll length, so it settles before the real bottom of the
// page. Content (eyebrow/headline/image) is passed as props so this can
// be dropped into any page without carrying over the demo copy.
import { useEffect, useRef } from 'react';
import p5 from 'p5';
import vertSrc from './shader.vert?raw';
import fragSrc from './shader.frag?raw';
import defaultImageSrc from './knowledge graph placeholder.png';
import {
  MAX_RIPPLES,
  TAP_RIPPLE_MODE,
  COLOR_PALETTE,
  GRAY_PALETTE,
  COLOR_LOOK,
  GRAY_LOOK,
  BASE_PARAMS,
  LOCKED_ORIGIN,
  BANDS_AT_TOP,
  BANDS_AT_BOTTOM,
  SPEED_AT_TOP,
  SPEED_AT_BOTTOM,
  SCROLL_TRIGGER_PX,
  BANDS_EASING,
  TEXT_FADE_END,
  TEXT_SCALE_END,
  IMAGE_FADE_START,
  IMAGE_FADE_END,
  IMAGE_SCALE_START,
  SCROLL_SPACER_VH,
} from './our-promise-definition.js';
import './our-promise.css';

const EMPTY_RIPPLE_ARRAY = new Array(MAX_RIPPLES * 2).fill(-10);

function lerpPaletteInto(out, paletteA, paletteB, t) {
  for (let i = 0; i < paletteA.length; i++) {
    out[i * 3 + 0] = paletteA[i][0] + (paletteB[i][0] - paletteA[i][0]) * t;
    out[i * 3 + 1] = paletteA[i][1] + (paletteB[i][1] - paletteA[i][1]) * t;
    out[i * 3 + 2] = paletteA[i][2] + (paletteB[i][2] - paletteA[i][2]) * t;
  }
}

function lerpLookInto(out, lookA, lookB, t) {
  out.saturation = lookA.saturation + (lookB.saturation - lookA.saturation) * t;
  out.vibrancy = lookA.vibrancy + (lookB.vibrancy - lookA.vibrancy) * t;
  out.contrast = lookA.contrast + (lookB.contrast - lookA.contrast) * t;
}

function smoothStep(t) {
  t = Math.min(1, Math.max(0, t));
  return t * t * (3 - 2 * t);
}

function sketch(p, refs, scrollTriggerPx) {
  let shaderProgram;

  let smoothPaletteMix = 0;
  const currentPaletteFlat = COLOR_PALETTE.flat();
  const currentLook = { ...COLOR_LOOK };

  let smoothBands = BANDS_AT_TOP;
  let smoothSpeed = SPEED_AT_TOP;

  let smoothTextOpacity = 1;
  let smoothTextScale = 1;
  let smoothImageOpacity = 0;
  let smoothImageScale = IMAGE_SCALE_START;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.noStroke();
    shaderProgram = p.createShader(vertSrc, fragSrc);
  };

  p.draw = () => {
    p.background(0);
    p.shader(shaderProgram);

    const targetScrollY = refs.scrollY.current;
    const scrollProgress = Math.min(1, Math.max(0, targetScrollY / scrollTriggerPx));

    const targetBands = BANDS_AT_TOP + (BANDS_AT_BOTTOM - BANDS_AT_TOP) * scrollProgress;
    smoothBands += (targetBands - smoothBands) * BANDS_EASING;

    const targetSpeed = SPEED_AT_TOP + (SPEED_AT_BOTTOM - SPEED_AT_TOP) * scrollProgress;
    smoothSpeed += (targetSpeed - smoothSpeed) * BANDS_EASING;

    smoothPaletteMix += (scrollProgress - smoothPaletteMix) * BANDS_EASING;
    lerpPaletteInto(currentPaletteFlat, COLOR_PALETTE, GRAY_PALETTE, smoothPaletteMix);
    lerpLookInto(currentLook, COLOR_LOOK, GRAY_LOOK, smoothPaletteMix);

    // hero text scales down + fades out together, fully gone by TEXT_FADE_END
    const rawTextProgress = Math.min(1, Math.max(0, scrollProgress / TEXT_FADE_END));
    const textProgress = smoothStep(rawTextProgress);

    const targetTextOpacity = 1 - textProgress;
    const targetTextScale = 1 + (TEXT_SCALE_END - 1) * textProgress;

    smoothTextOpacity += (targetTextOpacity - smoothTextOpacity) * 0.5;
    smoothTextScale += (targetTextScale - smoothTextScale) * 0.5;
    if (refs.heroText.current) {
      refs.heroText.current.style.opacity = smoothTextOpacity;
      refs.heroText.current.style.transform =
        `translate(-50%, -50%) scale(${smoothTextScale})`;
    }

    // image scales up + fades in starting at IMAGE_FADE_START, overlapping
    // briefly with the tail end of the text fade instead of a hard cut
    const rawImageProgress = Math.min(
      1,
      Math.max(0, (scrollProgress - IMAGE_FADE_START) / (IMAGE_FADE_END - IMAGE_FADE_START))
    );
    const imageProgress = smoothStep(rawImageProgress);

    const targetImageOpacity = imageProgress;
    const targetImageScale = IMAGE_SCALE_START + (1 - IMAGE_SCALE_START) * imageProgress;

    smoothImageOpacity += (targetImageOpacity - smoothImageOpacity) * 0.5;
    smoothImageScale += (targetImageScale - smoothImageScale) * 0.5;

    if (refs.imageStage.current) {
      refs.imageStage.current.style.opacity = smoothImageOpacity;
      refs.imageStage.current.style.transform =
        `translate(-50%, -50%) scale(${smoothImageScale})`;
    }

    shaderProgram.setUniform('uTapRippleMode', TAP_RIPPLE_MODE);
    shaderProgram.setUniform('uRippleCount', 0);
    shaderProgram.setUniform('uRipplePoints', EMPTY_RIPPLE_ARRAY);

    shaderProgram.setUniform('uTime', p.millis() * 0.001);
    shaderProgram.setUniform('uResolution', [p.width, p.height]);

    shaderProgram.setUniform('uBands', smoothBands);
    shaderProgram.setUniform('uSpeed', smoothSpeed);
    shaderProgram.setUniform('uFlowStrength', BASE_PARAMS.flow);
    shaderProgram.setUniform('uShearStrength', BASE_PARAMS.shear);
    shaderProgram.setUniform('uRippleShape', BASE_PARAMS.shape);
    shaderProgram.setUniform('uRippleNoise', BASE_PARAMS.rippleNoise);
    shaderProgram.setUniform('uRippleGap', BASE_PARAMS.rippleGap);

    shaderProgram.setUniform('uOrigin', LOCKED_ORIGIN);

    shaderProgram.setUniform('uGradientMotion', BASE_PARAMS.motion);
    shaderProgram.setUniform('uGradientSoftness', BASE_PARAMS.softness);
    shaderProgram.setUniform('uGradientScale', BASE_PARAMS.scale);
    shaderProgram.setUniform('uGradientRotation', BASE_PARAMS.rotation);
    shaderProgram.setUniform('uGradientWobble', BASE_PARAMS.wobble);

    shaderProgram.setUniform('uSaturation', currentLook.saturation);
    shaderProgram.setUniform('uVibrancy', currentLook.vibrancy);
    shaderProgram.setUniform('uContrast', currentLook.contrast);

    shaderProgram.setUniform('uPalette', currentPaletteFlat);
    shaderProgram.setUniform('uUseCustomPalette', true);

    p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
}

export default function OurPromise({
  eyebrow = 'OUR PROMISE',
  headline = (
    <>
      what is the one-line promise<span className="our-promise-question-mark">?</span>
      <br />
      a single sentence bridging the stack to proof.
    </>
  ),
  imageSrc = defaultImageSrc,
  imageAlt = '',
  scrollTriggerPx = SCROLL_TRIGGER_PX,
  scrollSpacerVh = SCROLL_SPACER_VH,
  className,
  style,
}) {
  const canvasHostRef = useRef(null);
  const heroTextRef = useRef(null);
  const imageStageRef = useRef(null);
  const scrollYRef = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

  useEffect(() => {
    const onScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const refs = {
      scrollY: scrollYRef,
      heroText: heroTextRef,
      imageStage: imageStageRef,
    };
    const instance = new p5((p) => sketch(p, refs, scrollTriggerPx), canvasHostRef.current);

    return () => {
      window.removeEventListener('scroll', onScroll);
      instance.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={['our-promise', className].filter(Boolean).join(' ')} style={style}>
      <div ref={canvasHostRef} className="our-promise-canvas-host" />

      <div ref={heroTextRef} className="our-promise-hero-text">
        <div className="our-promise-eyebrow">{eyebrow}</div>
        <p className="our-promise-headline">{headline}</p>
      </div>

      {imageSrc && (
        <div ref={imageStageRef} className="our-promise-image-stage">
          <img className="our-promise-image" src={imageSrc} alt={imageAlt} />
        </div>
      )}

      <div className="our-promise-scroll-spacer" style={{ height: `${scrollSpacerVh}vh` }} />
    </div>
  );
}
