// hll-outline-button-definition.js — the structural definition behind every
// HLL Outline Button variant: shape, effect toggles, interaction/cursor-lens
// tuning, label typography, and render mode. This is copied verbatim from
// the "Outline Rectangle — Lens Blur" preset in LightFX Studio's presets.js
// — it is the single source of truth for everything about the button EXCEPT
// its per-service gradient, which lives in hll-outline-button-variants.js
// instead (see that file's comment for why colors are split out).
//
// Re-copy this file from Studio any time the base preset's shape, effects,
// interaction, typography, or render mode change there. The `params.base` /
// `params.hover` color fields below are Studio's own preset colors —
// hll-outline-button-variants.js overrides them per variant at mount time;
// it never touches anything else in this object.
//
// Unlike hll-button-definition.js's filled shape (`shape.strokeWidth: 0`),
// this preset draws a hollow stroke (`shape.strokeWidth: 0.06`) — the
// gradient IS the border, there's no interior fill. `params.base` is a
// plain gray hairline (matching a real outline button's resting state);
// `params.hover` fades in the variant's actual gradient border.
export const BASE_DEFINITION = {
  "box": {
    "auto": false,
    "height": 36,
    "scale": 1,
    "width": 136
  },
  "effects": {
    "base": {
      "bloom": true,
      "blur": true,
      "chromatic": true,
      "fresnel": true,
      "glow": true,
      "noise": true,
      "scatter": true
    },
    "hover": {
      "bloom": true,
      "blur": true,
      "chromatic": true,
      "fresnel": true,
      "glow": true,
      "noise": true,
      "scatter": true
    }
  },
  "hoverLinked": false,
  "intensity": 1,
  "interaction": {
    "hover": true,
    "cursorLight": true,
    "clickPulse": false,
    "colorOnHover": true,
    "speed": 10,
    "lightPos": [
      0.5,
      0.5
    ],
    "cursorFocusRadius": 1.75,
    "cursorFocusEdge": 0.5,
    "cursorRadius": 4,
    "cursorEdge": 1,
    "cursorAspect": 1,
    "cursorExpand": 0.06,
    "cursorColorLeak": 1,
    "cursorTransparency": 0
  },
  "params": {
    "base": {
      "bloom": 0,
      "blur": 0,
      "chromatic": 0,
      "colors": [
        "#E6E6E6",
        "#E6E6E6"
      ],
      "fillOpacity": 1,
      "fresnel": 0,
      "glowColor": "#E6E6E6",
      "glowIntensity": 0,
      "glowRadius": 0.3,
      "gradientAngle": 0,
      "noiseAmount": 0,
      "noiseScale": 6,
      "noiseSpeed": 0.3,
      "opacity": 1,
      "saturation": 1,
      "scatter": 0
    },
    "hover": {
      "bloom": 0,
      "blur": 1.5,
      "chromatic": 0,
      "colors": [
        "#10b981",
        "#3b82f6"
      ],
      "fillOpacity": 1,
      "fresnel": 0,
      "glowColor": "#10b981",
      "glowIntensity": 0,
      "glowRadius": 0.3,
      "gradientAngle": 0,
      "noiseAmount": 0,
      "noiseScale": 6,
      "noiseSpeed": 0.3,
      "opacity": 1,
      "saturation": 1,
      "scatter": 0
    }
  },
  "render": {
    "dissolve": false,
    "premultiplied": true
  },
  "shape": {
    "type": "roundRect",
    "size": 0.94,
    "cornerRadius": 0.17,
    "sides": 6,
    "rotation": 0,
    "maskSrc": null,
    "strokeWidth": 0.06
  },
  "text": {
    "content": "DATA ENGINEERING",
    "fontFamily": "",
    "fontDataUrl": "",
    "fontSize": 13,
    "letterSpacing": 2,
    "fontWeight": 500,
    "color": "#191919",
    "padding": 16,
    "hoverColor": "#191919"
  }
};
