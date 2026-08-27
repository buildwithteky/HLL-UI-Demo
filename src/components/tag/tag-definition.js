// tag-definition.js — the structural definition behind every Tag variant:
// shape, effect toggles, interaction tuning, label typography, and render
// mode. This is copied verbatim from the "Tag — Warm" / "Tag — Cool" presets
// in LightFX Studio's presets.js (SHAPE_TAG, TAG_STATIC, tagBlurred()) — the
// single source of truth for everything about the tag EXCEPT its color,
// which lives in tag-variants.js instead (see that file's comment for why
// colors are split out), same split as hll-button-definition.js.
//
// Unlike the button, a tag has no hover/active state at all (TAG_STATIC:
// hover false, cursorLight false, clickPulse false) and base === hover in
// every preset — it's a single, static, fully-blurred colour blob with no
// interaction. `dissolve`/`premultiplied` render flags are what let the blur
// melt the whole shape (no core/edge) and keep the fade in its own colour
// instead of graying out — see presets.js's comment on `tagBlurred`.
//
// Re-copy this file from Studio any time the base preset's shape,
// interaction, typography, or render mode change there. The `params.base` /
// `params.hover` color fields below are what Studio's own "Tag — Warm"
// preset currently uses — tag-variants.js overrides them per variant at
// mount time; it never touches anything else in this object.
export const BASE_DEFINITION = {
  "box": {
    "auto": true,
    "height": 32,
    "scale": 1,
    "width": 90
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
    "hover": false,
    "cursorLight": false,
    "clickPulse": false,
    "colorOnHover": false,
    "speed": 6,
    "lightPos": [
      0.5,
      0.5
    ],
    "cursorFocusRadius": 1.4,
    "cursorFocusEdge": 0.5,
    "cursorRadius": 0.3,
    "cursorEdge": 0.5,
    "cursorAspect": 1,
    "cursorExpand": 0,
    "cursorColorLeak": 1,
    "cursorTransparency": 0
  },
  "params": {
    "base": {
      "bloom": 0,
      "blur": 3,
      "chromatic": 0,
      "colors": [
        "#fa4288",
        "#fb8e97",
        "#ff836b",
        "#fee253"
      ],
      "fillOpacity": 0.72,
      "fresnel": 0,
      "glowColor": "#ff836b",
      "glowIntensity": 0.08,
      "glowRadius": 0.55,
      "gradientAngle": 0,
      "noiseAmount": 0,
      "noiseScale": 6,
      "noiseSpeed": 0.3,
      "opacity": 1,
      "scatter": 0
    },
    "hover": {
      "bloom": 0,
      "blur": 3,
      "chromatic": 0,
      "colors": [
        "#fa4288",
        "#fb8e97",
        "#ff836b",
        "#fee253"
      ],
      "fillOpacity": 0.72,
      "fresnel": 0,
      "glowColor": "#ff836b",
      "glowIntensity": 0.08,
      "glowRadius": 0.55,
      "gradientAngle": 0,
      "noiseAmount": 0,
      "noiseScale": 6,
      "noiseSpeed": 0.3,
      "opacity": 1,
      "scatter": 0
    }
  },
  "render": {
    "dissolve": true,
    "premultiplied": true
  },
  "shape": {
    "type": "roundRect",
    "size": 0.9,
    "cornerRadius": 1,
    "sides": 6,
    "rotation": 0,
    "maskSrc": null,
    "strokeWidth": 0
  },
  "text": {
    "content": "Warm",
    "fontFamily": "",
    "fontDataUrl": "",
    "fontSize": 13,
    "letterSpacing": 0.2,
    "fontWeight": 400,
    "color": "#ffffff",
    "padding": 14,
    "hoverColor": "#ffffff",
    "icon": "x"
  }
};
