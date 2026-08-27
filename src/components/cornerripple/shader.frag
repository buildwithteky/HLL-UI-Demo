precision highp float;

// ======================================================
// UNIFORMS
// ======================================================

uniform float uTime;
uniform vec2 uResolution;

uniform float uBands;
uniform float uSpeed;
uniform float uFlowStrength;
uniform float uShearStrength;
uniform float uRippleShape;
uniform float uRippleNoise;
uniform float uRippleGap;

uniform vec2 uOrigin;

#define MAX_RIPPLES 32

uniform bool uTapRippleMode;
uniform int uRippleCount;
uniform vec2 uRipplePoints[MAX_RIPPLES];

uniform vec3 uPalette[6];
uniform bool uUseCustomPalette;
uniform float uGradientMotion;
uniform float uGradientSoftness;
uniform float uGradientScale;
uniform float uGradientRotation;
uniform float uGradientWobble;

uniform float uSaturation;
uniform float uVibrancy;
uniform float uContrast;

varying vec2 vTexCoord;

uniform sampler2D uPaintTexture;
uniform int uInteractionMode;
uniform float uPaintStrength;

// ======================================================
// UTILS
// ======================================================

vec2 toAspectSpace(vec2 uv, float aspect) {
    return vec2(uv.x * aspect, uv.y);
}

vec2 fromAspectSpace(vec2 p, float aspect) {
    return vec2(p.x / aspect, p.y);
}

mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

float luminance(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
}

vec2 stabilizeUV(vec2 uv) {
    return mix(
        uv,
        clamp(uv, 0.001, 0.999),
        0.85
    );
}

vec3 applyColorControls(vec3 col) {

    float luma = luminance(col);

    col = mix(
        vec3(luma),
        col,
        max(uSaturation, 1.0)
    );

    float avg = (col.r + col.g + col.b) / 3.0;
    float mx = max(col.r, max(col.g, col.b));

    float amt = (mx - avg) * (-uVibrancy * 3.0);

    col = mix(col, vec3(mx), amt);

    col = (col - 0.5) * uContrast + 0.5;

    return clamp(col, 0.0, 1.0);
}

// ======================================================
// MESH GRADIENT
// ======================================================

vec3 meshGradient(vec2 uv) {

    vec2 p = (uv - 0.5) * uGradientScale;
    p = rot(uGradientRotation) * p;

    float t = uTime * uGradientMotion;
    float wob = uGradientWobble;

    vec2 wobA = vec2(
        sin(t * 1.9),
        cos(t * 1.9)
    ) * wob;

    vec2 wobB = vec2(
        cos(t * 1.9),
        sin(t * 1.9)
    ) * wob;

    vec2 c1 = vec2(-0.45, -0.35) + wobA;
    vec2 c2 = vec2( 0.45, -0.35) + wobB;
    vec2 c3 = vec2(-0.35,  0.15) + wobA;
    vec2 c4 = vec2( 0.35,  0.15) + wobB;
    vec2 c5 = vec2(-0.20,  0.50) + wobA;
    vec2 c6 = vec2( 0.20,  0.50) + wobB;

    float s = max(0.01, uGradientSoftness);

    float d1 = max(length(p - c1), 0.12);
    float d2 = max(length(p - c2), 0.12);
    float d3 = max(length(p - c3), 0.12);
    float d4 = max(length(p - c4), 0.12);
    float d5 = max(length(p - c5), 0.12);
    float d6 = max(length(p - c6), 0.12);

    float w1 = 1.0 / (pow(d1, s) + 0.2);
    float w2 = 1.0 / (pow(d2, s) + 0.2);
    float w3 = 1.0 / (pow(d3, s) + 0.2);
    float w4 = 1.0 / (pow(d4, s) + 0.2);
    float w5 = 1.0 / (pow(d5, s) + 0.2);
    float w6 = 1.0 / (pow(d6, s) + 0.2);

    float total = w1 + w2 + w3 + w4 + w5 + w6;

    vec3 col =
          uPalette[0] * w1
        + uPalette[1] * w2
        + uPalette[2] * w3
        + uPalette[3] * w4
        + uPalette[4] * w5
        + uPalette[5] * w6;

    col /= total;

    float luma = luminance(col);

    float boost = uUseCustomPalette ? 1.0 : 1.35;

    col = mix(
        vec3(luma),
        col,
        boost
    );

    return clamp(col, 0.0, 1.0);
}

// ======================================================
// MAIN
// ======================================================

void main() {

    vec2 uv = vTexCoord;
    
    float paint =
    texture2D(
        uPaintTexture,
        uv
    ).r;
    
    float t = uTime * 0.9;

    float aspect = uResolution.x / uResolution.y;

    vec2 originA = toAspectSpace(uOrigin, aspect);

    float xScale = 1.8;
    float yScale = 0.65;

    vec2 shapeScale = vec2(
        mix(1.0, xScale, uRippleShape),
        mix(1.0, yScale, uRippleShape)
    );

    // --------------------------------------------------
    // RIPPLE FIELD
    // --------------------------------------------------

    vec2 uvA = toAspectSpace(uv, aspect);

vec2 rippleP;
float r;

if (!uTapRippleMode) {

    vec2 p = uvA - originA;

    rippleP = p * shapeScale;

    r = length(rippleP);

} else {

    r = 99999.0;
    rippleP = vec2(0.0);

    for (int i = 0; i < MAX_RIPPLES; i++) {

        if (i >= uRippleCount) break;

        vec2 sourceA =
            toAspectSpace(
                uRipplePoints[i],
                aspect
            );

        vec2 localP =
            (uvA - sourceA) *
            shapeScale;

        float localR =
            length(localP);

        if (localR < r) {

            r = localR;
            rippleP = localP;
        }
    }

    if (uRippleCount == 0) {
        r = 1000.0;
    }
}

    float angularWarp =
        sin(rippleP.x * 2.7 + rippleP.y * 1.3) *
        cos(rippleP.y * 2.1 - rippleP.x * 1.7);

    r += angularWarp * 0.006;

    float circularNoise =
        sin(r * 12.0 - t * 2.0) * 0.04;

    float ovalNoise =
        sin(rippleP.x * 5.0 + t) * 0.085 +
        cos(rippleP.y * 5.0 - t) * 0.015;

    r += mix(
        circularNoise,
        ovalNoise,
        uRippleShape
    );

    float rippleNoise =
        sin(rippleP.x * 18.0 + t * 1.2) *
        cos(rippleP.y * 18.0 - t * 0.9);

    rippleNoise +=
        sin((rippleP.x + rippleP.y) * 25.0 - t);

    r += rippleNoise * 0.03 * uRippleNoise;

    float gappedR =
        pow(max(r, 0.0001), uRippleGap);

    float ripplePhase =
        gappedR * uBands -
        t * uSpeed;

    float ripple = fract(ripplePhase);

    float seam =
        abs(ripple - 0.99) * 2.0;

    float seamFade =
        smoothstep(0.0, 0.98, seam);

    ripple = mix(
        0.5,
        ripple,
        seamFade
    );

    float rippleSoft =
        smoothstep(0.1, 0.9, ripple);

    // --------------------------------------------------
    // FLOW FIELD
    // --------------------------------------------------

    float flow =
        sin(uv.x * 5.0 + t) +
        cos(uv.y * 5.0 - t);

    float flow2 =
        sin(uv.y * 5.0 - t);

    vec2 rawFlow = vec2(flow, flow2);

    float flowLen =
        max(length(rawFlow), 0.25);

    vec2 flowDir =
    rawFlow /
    max(length(rawFlow), 0.5);
  
    

    vec2 displacedUV =
        clamp(
            uv +
            flowDir *
            uFlowStrength *
            rippleSoft,
            0.001,
            0.999
        );

    vec2 displacedA =
        toAspectSpace(
            displacedUV,
            aspect
        );

    vec2 fieldOrigin = originA;

if (uTapRippleMode && uRippleCount > 0) {

    float bestDist = 99999.0;

    for (int i = 0; i < MAX_RIPPLES; i++) {

        if (i >= uRippleCount) break;

        vec2 sourceA =
            toAspectSpace(
                uRipplePoints[i],
                aspect
            );

        float d =
            length(
                displacedA -
                sourceA
            );

        if (d < bestDist) {

            bestDist = d;
            fieldOrigin = sourceA;
        }
    }
}

vec2 shapedSP =
    (displacedA - fieldOrigin) *
    shapeScale;

    float radius =
        length(shapedSP);

    radius +=
        0.00001 *
        sin(
            shapedSP.x * 137.0 +
            shapedSP.y * 91.0
        );

    // --------------------------------------------------
    // SHEAR
    // --------------------------------------------------

    float shear =
        sin(
            uv.y * 10.0 +
            t * 8.0
        ) * 0.2;

    float directionalShear =
        dot(
            flowDir,
            normalize(vec2(1.0, -1.0))
        );

    directionalShear /=
        (1.0 + abs(directionalShear));

    shear +=
        directionalShear *
        uShearStrength;

    // --------------------------------------------------
    // ACCUMULATION
    // --------------------------------------------------

    vec3 col = vec3(0.0);
    float total = 0.0;

    for (int i = -20; i <= 20; i++) {

        float f = float(i) / 20.0;

        float safeRadius =
            max(radius, 0.08);

        vec2 radialDir =
            shapedSP / safeRadius;

        float lenSP =
            length(shapedSP);

        vec2 tangentDir =
            (lenSP > 1e-5)
            ? vec2(-shapedSP.y, shapedSP.x) / lenSP
            : vec2(0.0);

        float angularFade =
            smoothstep(
                0.03,
                0.22,
                radius
            );

        tangentDir *= angularFade;
        radialDir *= angularFade;

        float swirl =
            f * 0.085 * rippleSoft +
            shear * f * 0.038 +
            0.01 * sin(radius * 20.0 + t);

        float radialOffset =
            f * 0.05 * shear;

        vec2 warped =
            shapedSP +
            tangentDir * swirl * 0.8 +
            radialDir * radialOffset * 0.6;

        warped *= 0.9;
        warped /= shapeScale;

        vec2 sampleUV =
            fromAspectSpace(
                originA + warped,
                aspect
            );

        sampleUV =
            stabilizeUV(sampleUV);

        float w =
            pow(
                1.0 - abs(f),
                2.0
            );

        col +=
            meshGradient(sampleUV) * w;

        total += w;
    }

    col /= total;

    col =
        applyColorControls(col);

    gl_FragColor =
        vec4(col, 1.0);
}