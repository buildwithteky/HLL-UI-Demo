// bottom-shader-palette.js — the Bottom Shader's colour system for the hard-light blend layer. Ported from the HLL
// website (footer-cta.tsx: toHomeBand / paletteFadeColour). Reusable: any page passes its palette through
// getBlendShaderProps() and spreads the result onto <BottomShader overlay ... />.
//
// 1. Palette per page. A page's variant gives its three colours (resolveVariantColors); a page with no variant of
//    its own uses HOME_SHADER_COLORS (Home's pink and peach).
// 2. Home's HSB band. Each colour goes through toHomeBand(): hue kept, saturation clamped to Home's 33-46%,
//    brightness set to 96%. Every page then blends the way Home does; only the hue differs.
// 3. Why a band. The layer is `mix-blend-mode: hard-light` (bottom-shader.css, .bottom-shader--overlay). Hard-light
//    screens (lightens) a channel above 0.5 and multiplies (darkens) one below it. In Home's band the lowest channel
//    is about 0.52, so the layer only lifts and tints. A saturated palette (e.g. Engagement's orange, blue ~0.2)
//    darkens that channel over the white page and leaves a yellow stain; a luminance-only lift does not catch this.
// 4. The fade colour. See paletteFadeColour().
//
// White and transparent areas: hard-light over a white backdrop returns white, so empty page areas stay clean.
// Text and other content is not treated specially. The layer sits above it and blends with it, which lets black
// text pick up the shader's colour (more strongly under the pointer). Raising text above the layer or giving it a
// fixed colour would switch that off and is deliberately not done.
import { resolveVariantColors } from './bottom-shader-variants.js';

/** Home's pink and peach, used by any page that has no palette of its own. */
export const HOME_SHADER_COLORS = ['#F49AB1', '#F483A6', '#F5CAA3'];

/** Home's saturation range and brightness (HSB, 0-1): the reference band every page's colours are brought into. */
const HOME_SATURATION = [0.33, 0.46];
const HOME_BRIGHTNESS = 0.96;

/** Saturation and brightness (HSB, 0-1) of the colour the blend layer fades out to. */
const FADE_SATURATION = 0.35;
const FADE_BRIGHTNESS = 0.95;

const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const toHex = (rgb) => `#${rgb.map((n) => Math.round(n * 255).toString(16).padStart(2, '0')).join('')}`;

/** Hex to [hue 0-6, saturation 0-1, brightness 0-1]. */
export function hexToHsb(hex) {
  const [r, g, b] = channels(hex);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return [h, max === 0 ? 0 : d / max, max];
}

/** [hue 0-6, saturation 0-1, brightness 0-1] to hex. */
export function hsbToHex(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = v - c;
  const [r, g, b] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h) % 6];
  return toHex([r + m, g + m, b + m]);
}

/** The colour's own hue at Home's saturation range and brightness, so every page blends the way Home does and only
 *  the hue changes. Home's own colours already sit inside the range and come out as they were. */
export function toHomeBand(hex) {
  const [h, s] = hexToHsb(hex);
  return hsbToHex(h, Math.min(Math.max(s, HOME_SATURATION[0]), HOME_SATURATION[1]), HOME_BRIGHTNESS);
}

/**
 * The colour the blend layer fades out to: the palette's mean hue at FADE_SATURATION / FADE_BRIGHTNESS.
 *
 * The vignette used to fade to white (background.color), so as the layer thinned its colour drained away. Over black
 * text hard-light gives max(0, 2S - 1) x alpha per channel; with S near white that is a neutral grey, dimmed by the
 * falling alpha into a dark grey. Fading to the palette's own hue keeps S saturated while alpha falls, so the result
 * is a dark tint of the page colour and never grey. Over the white page hard-light still returns white, so white or
 * empty areas are unaffected. Full-strength areas (alpha 1) are unchanged.
 */
export function paletteFadeColour(hexes) {
  const rgb = hexes.map(channels);
  const mean = toHex([0, 1, 2].map((i) => rgb.reduce((sum, c) => sum + c[i], 0) / rgb.length));
  return hsbToHex(hexToHsb(mean)[0], FADE_SATURATION, FADE_BRIGHTNESS);
}

/**
 * Props for the hard-light blend layer of a page: `colors` (the page's palette in Home's band) and `settings`
 * (baseSettings plus the palette fade colour, both on background.fadeColor and output.color, which the output pass
 * mixes toward where the layer is transparent; they must match or the faded edge turns grey over dark content).
 *
 * Pass a variant name (or nothing for Home's pink and peach) and the page's base settings. Build it once per page
 * (useMemo): BottomShader remounts its effect when `settings` changes identity. The end-of-page layer is an
 * unblended plate and keeps its own settings; do not run it through this.
 */
export function getBlendShaderProps(variant, baseSettings) {
  const palette = variant ? resolveVariantColors(variant) : HOME_SHADER_COLORS;
  const colors = palette.map(toHomeBand);
  const fade = paletteFadeColour(colors);
  return {
    colors,
    settings: {
      ...baseSettings,
      background: { ...baseSettings.background, fadeColor: fade },
      output: { ...baseSettings.output, color: fade },
    },
  };
}
