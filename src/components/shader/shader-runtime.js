// shader-runtime.js — the "BlockGL — jewel refraction" WebGL2 multi-pass
// effect engine, ported from the exported index.pen.html (kept verbatim in
// this folder as the source reference — re-copy the shader strings from
// there if the look changes). Self-contained: no dependency beyond the
// browser's own WebGL2 API.
//
// The original is a static page script: module-level `gl`/`elapsed`/
// `pointer` state, `window.addEventListener('resize', ...)`, and a
// `document.body.innerHTML = ...` fallback that assumes it owns the whole
// page. None of that fits a component that can mount more than once or
// unmount, so this wraps the same render pipeline in a factory function —
// createShaderFX(canvas, options) — with every piece of state closed over
// per-instance, resize driven by a ResizeObserver on the canvas itself
// (rather than the window), and a plain `{ dispose }` return instead of a
// page takeover when WebGL2 isn't available.
export function createShaderFX(canvas, options = {}) {
  const { colors, settings, pauseOnDoubleClick = true, blueNoiseSize = 256, pointerMaxY } = options;
  // Opt-in via `settings.background.transparent` (unset/false for every
  // existing preset — Shader/BottomShader's own BASE_SETTINGS never set
  // it, so their opaque full-bleed look is unchanged). Needs the WebGL
  // context created with `alpha: true` up front — a canvas created with
  // `alpha: false` can never composite as see-through against the DOM
  // beneath it, no matter what the shader itself outputs.
  const transparentBg = !!settings.background.transparent;

  // `premultipliedAlpha: false` matches the reference index.pen.html
  // export exactly — the output pass (FS_OUTPUT below) writes straight
  // (unpremultiplied) alpha: `fragColor.rgb` is the full-strength blended
  // color regardless of `fragColor.a`. The browser's default
  // (`premultipliedAlpha: true`) instead assumes rgb is already scaled by
  // alpha, and darkens/washes out every partially-transparent pixel when
  // compositing the canvas onto the page — exactly the "doesn't blend like
  // the reference" symptom this fixes: `mix-blend-mode: hard-light` reads
  // its backdrop the same either way, but the canvas's own colors going
  // into that blend were wrong without this.
  const gl = canvas.getContext('webgl2', {
    antialias: false,
    alpha: transparentBg,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  });
  if (!gl) {
    console.warn('Shader: WebGL2 is not available in this browser — the effect will not render.');
    return { dispose() {} };
  }

  // ---------------------------------------------------------------
  // helpers
  // ---------------------------------------------------------------
  function hexToRgb(hex) {
    let c = hex.substring(1).split('');
    if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    const n = parseInt(c.join(''), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function compileShader(src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
    }
    return s;
  }
  function createProgram(vsSrc, fsSrc) {
    const p = gl.createProgram();
    gl.attachShader(p, compileShader(vsSrc, gl.VERTEX_SHADER));
    gl.attachShader(p, compileShader(fsSrc, gl.FRAGMENT_SHADER));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(p));
    }
    const uniforms = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      const name = info.name.replace(/\[0\]$/, '');
      uniforms[name] = gl.getUniformLocation(p, info.name);
    }
    return { program: p, uniforms };
  }
  function setF(u, name, v) { if (u[name] !== undefined) gl.uniform1f(u[name], v); }
  function setI(u, name, v) { if (u[name] !== undefined) gl.uniform1i(u[name], v); }
  function set2(u, name, v) { if (u[name] !== undefined) gl.uniform2fv(u[name], v); }
  function set3(u, name, v) { if (u[name] !== undefined) gl.uniform3fv(u[name], v); }
  function bindTex(u, name, tex, unit) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    setI(u, name, unit);
  }

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);

  // ---------------------------------------------------------------
  // fullscreen quad
  // ---------------------------------------------------------------
  const VS = '#version 300 es\n' +
    'layout(location=0) in vec2 position;\n' +
    'layout(location=1) in vec2 uv;\n' +
    'out vec2 vUv;\n' +
    'void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }';

  const quadVAO = gl.createVertexArray();
  gl.bindVertexArray(quadVAO);
  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const uvBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

  function drawQuad() {
    gl.bindVertexArray(quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // ---------------------------------------------------------------
  // fragment shaders
  // ---------------------------------------------------------------

  // Vignette pass: the jewel's core. Samples the gradient texture around the
  // angle from the pointer, so hue rotates around the highlight like light
  // splitting through a facet. Solid at the core, fading to transparent
  // outward, so it reads as a glowing gem sitting on the background.
  const FS_VIGNETTE =
    '#version 300 es\n' +
    'precision highp float;\n' +
    '#define TWO_PI 6.28318530718\n' +
    'in vec2 vUv; out vec4 fragColor;\n' +
    'uniform float uRadius, uFalloff, uSkew, uAngle, uSpin;\n' +
    'uniform vec3 uClearColor;\n' +
    'uniform vec2 uPos, uResolution;\n' +
    'uniform sampler2D tGradient;\n' +
    'mat2 rot(float a){ return mat2(cos(a),-sin(a),sin(a),cos(a)); }\n' +
    'void main(){\n' +
    '  vec2 aspectRatio = vec2(uResolution.x/uResolution.y, 1.0);\n' +
    '  vec2 skew = vec2(uSkew, 1.0 - uSkew);\n' +
    '  vec2 rel = (vUv - uPos) * aspectRatio * rot(uAngle * TWO_PI) * skew;\n' +
    '  float radius = length(rel);\n' +
    '  float halfRadius = uRadius * 0.5;\n' +
    '  float innerEdge = halfRadius - uFalloff * halfRadius * 0.5;\n' +
    '  float outerEdge = halfRadius + uFalloff * halfRadius * 0.5;\n' +
    '  float falloff = smoothstep(innerEdge, outerEdge, radius);\n' +
    '  float ang = atan(rel.y, rel.x) / TWO_PI + 0.5 + uSpin;\n' +
    '  vec3 gradColor = texture(tGradient, vec2(fract(ang), 0.5)).rgb;\n' +
    '  fragColor = mix(vec4(gradColor, 1.), vec4(uClearColor, 0.), falloff);\n' +
    '}';

  const FS_SINE =
    '#version 300 es\n' +
    'precision mediump float;\n' +
    '#define PI3 1.04709283144\n' +
    'in vec2 vUv; out vec4 fragColor;\n' +
    'uniform sampler2D tInput;\n' +
    'uniform float uMixRadius, uFrequency, uAmplitude, uRotation, uTime, uTrackMouse;\n' +
    'uniform vec2 uPos, uResolution, uMousePos;\n' +
    'void main(){\n' +
    '  vec2 uv = vUv;\n' +
    '  vec2 waveCoord = vUv.xy * 2.0 - 1.0;\n' +
    '  float time = uTime * 0.25;\n' +
    '  float frequency = 20.0 * uFrequency;\n' +
    '  float amp = uAmplitude * 0.2;\n' +
    '  float waveX = sin((waveCoord.y + uPos.y) * frequency + (time * PI3)) * amp;\n' +
    '  float waveY = sin((waveCoord.x - uPos.x) * frequency + (time * PI3)) * amp;\n' +
    '  waveCoord.xy += vec2(mix(waveX, 0., uRotation), mix(0., waveY, uRotation));\n' +
    '  vec2 finalUV = waveCoord * 0.5 + 0.5;\n' +
    '  float aspectRatio = uResolution.x/uResolution.y;\n' +
    '  vec2 mPos = uPos + mix(vec2(0), (uMousePos-0.5), uTrackMouse);\n' +
    '  vec2 pos = mix(uPos, mPos, floor(uMixRadius));\n' +
    '  float dist = (max(0.,1.-distance(uv * vec2(aspectRatio,1), mPos * vec2(aspectRatio,1)) * 4. * (1. - uMixRadius)));\n' +
    '  uv = mix(uv, finalUV, dist);\n' +
    '  fragColor = texture(tInput, uv);\n' +
    '}';

  const FS_SHATTER =
    '#version 300 es\n' +
    'precision mediump float;\n' +
    '#define PI 3.14159265359\n' +
    'in vec2 vUv; out vec4 fragColor;\n' +
    'uniform sampler2D tInput;\n' +
    'uniform float uAmount, uSpread, uAngle, uTime, uSkew, uMixRadius, uTrackMouse;\n' +
    'uniform vec2 uPos, uResolution, uMousePos;\n' +
    'vec2 random2(vec2 p){ return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453); }\n' +
    'mat2 rot(float a){ return mat2(cos(a),-sin(a),sin(a),cos(a)); }\n' +
    'void main(){\n' +
    '  vec2 uv = vUv;\n' +
    '  float aspectRatio = uResolution.x/uResolution.y;\n' +
    '  vec2 skew = mix(vec2(1), vec2(1,0), uSkew);\n' +
    '  vec2 st = (uv - uPos) * vec2(aspectRatio,1.) * 50. * uAmount;\n' +
    '  st = st * rot(uAngle * 2. * PI) * skew;\n' +
    '  vec2 i_st = floor(st);\n' +
    '  vec2 f_st = fract(st);\n' +
    '  float m_dist = 15.;\n' +
    '  vec2 m_point; vec2 d;\n' +
    '  for (int j=-1;j<=1;j++){ for (int i=-1;i<=1;i++){\n' +
    '    vec2 neighbor = vec2(float(i),float(j));\n' +
    '    vec2 point = random2(i_st + neighbor);\n' +
    '    point = 0.5 + 0.5 * sin(5. + uTime * 0.2 + 6.2831*point);\n' +
    '    vec2 diff = neighbor + point - f_st;\n' +
    '    float dist = length(diff);\n' +
    '    if (dist < m_dist){ m_dist = dist; m_point = point; d = diff; }\n' +
    '  }}\n' +
    '  vec2 offset = (m_point * 0.2 * uSpread * 2.) - (uSpread * 0.2);\n' +
    '  vec2 mPos = uPos + mix(vec2(0), (uMousePos-0.5), uTrackMouse);\n' +
    '  vec2 pos = mix(uPos, mPos, floor(uMixRadius));\n' +
    '  float dist = (max(0.,1.-distance(uv * vec2(aspectRatio,1), mPos * vec2(aspectRatio,1)) * 4. * (1. - uMixRadius)));\n' +
    '  fragColor = texture(tInput, uv + offset * dist);\n' +
    '}';

  const FS_BOKEH =
    '#version 300 es\n' +
    'precision highp float;\n' +
    'in vec2 vUv; out vec4 fragColor;\n' +
    '#define PI 3.14159265\n' +
    '#define PI2 6.28318530718\n' +
    '#define ITERATIONS 50.0\n' +
    '#define GOLDEN_ANGLE 2.39996323\n' +
    'uniform sampler2D tInput, tBlueNoise;\n' +
    'uniform float uAmount, uTilt, uTime, uTrackMouse;\n' +
    'uniform vec2 uPos, uResolution, uMousePos, uBlueNoiseResolution;\n' +
    'vec2 Sample(in float theta, inout float r){ r += 1.0/r; return (r-1.0)*vec2(cos(theta),sin(theta)); }\n' +
    'float getBlueNoiseOffset(vec2 st){\n' +
    '  ivec2 texSize = ivec2(uBlueNoiseResolution);\n' +
    '  vec4 blueNoise = texelFetch(tBlueNoise, ivec2(fract(st * (uResolution)/vec2(texSize) * vec2(texSize.x/texSize.y,1.0)) * vec2(texSize)) % texSize, 0);\n' +
    '  return mod((blueNoise.r - 0.5) * PI2, PI2);\n' +
    '}\n' +
    'vec4 Bokeh(sampler2D tex, vec2 uv, float blurRadius){\n' +
    '  vec3 accumulatedColor = vec3(0.0);\n' +
    '  vec3 accumulatedWeights = vec3(0.0);\n' +
    '  float accumulatedAlpha = 0.0;\n' +
    '  float aspectRatio = uResolution.x/uResolution.y;\n' +
    '  vec2 pixelSize = vec2(1.0/aspectRatio,1.0) * 0.04 * 0.075;\n' +
    '  float r = 1.0;\n' +
    '  float noiseOffset = (getBlueNoiseOffset(uv) - 0.5) * 0.01;\n' +
    '  float noiseAngle = noiseOffset * PI2;\n' +
    '  mat2 rotationMatrix = mat2(cos(noiseAngle),-sin(noiseAngle),sin(noiseAngle),cos(noiseAngle));\n' +
    '  for (float j = 0.0; j < GOLDEN_ANGLE * ITERATIONS; j += GOLDEN_ANGLE) {\n' +
    '    vec2 offset = Sample(j, r) * pixelSize;\n' +
    '    float jitterAmount = 0.05 * (sin(j * 0.1) * 0.5 + 0.5);\n' +
    '    offset *= 1.0 + jitterAmount * sin(j * 0.7 + noiseOffset);\n' +
    '    vec2 sampleOffset = rotationMatrix * offset;\n' +
    '    vec4 colorSample = texture(tex, uv + sampleOffset);\n' +
    '    vec3 bokehWeight = vec3(5.0) + pow(colorSample.rgb, vec3(9.0)) * 150.0;\n' +
    '    accumulatedAlpha += colorSample.a;\n' +
    '    accumulatedColor += colorSample.rgb * bokehWeight;\n' +
    '    accumulatedWeights += bokehWeight;\n' +
    '  }\n' +
    '  return vec4(accumulatedColor/accumulatedWeights, accumulatedAlpha/ITERATIONS);\n' +
    '}\n' +
    'void main(){\n' +
    '  vec2 uv = vUv;\n' +
    '  if (uAmount == 0.0) { fragColor = vec4(0.0); return; }\n' +
    '  vec2 pos = uPos + mix(vec2(0), (uMousePos-0.5), uTrackMouse);\n' +
    '  float dis = distance(uv, pos) * 1000.0;\n' +
    '  float tilt = mix(1.0 - dis*0.001, dis*0.001, uTilt);\n' +
    '  float blurRadius = uAmount * tilt;\n' +
    '  fragColor = Bokeh(tInput, uv, blurRadius);\n' +
    '}';

  // Output pass: composites the FX chain onto the background color, with a
  // small chromatic-aberration split (RGB sampled at slightly offset radii
  // from the pointer) to sell the "light splitting through glass" feel.
  const FS_OUTPUT =
    '#version 300 es\n' +
    'precision highp float;\n' +
    'in vec2 vUv; out vec4 fragColor;\n' +
    'uniform sampler2D tInput;\n' +
    'uniform vec3 uBgColor, uOutputColor;\n' +
    'uniform vec2 uPos, uResolution;\n' +
    'uniform float uAberration, uBlendStrength, uTransparent, uCapAmount;\n' +
    'void main(){\n' +
    '  vec2 aspect = vec2(uResolution.x/uResolution.y, 1.0);\n' +
    '  vec2 dir = (vUv - uPos) * aspect;\n' +
    '  float len = length(dir);\n' +
    '  vec2 dirN = len > 0.0001 ? dir / len : vec2(0.0);\n' +
    '  dirN /= aspect;\n' +
    '  float aberr = uAberration;\n' +
    '  vec4 cR = texture(tInput, vUv + dirN * aberr);\n' +
    '  vec4 cG = texture(tInput, vUv);\n' +
    '  vec4 cB = texture(tInput, vUv - dirN * aberr);\n' +
    '  vec3 chainColor = vec3(cR.r, cG.g, cB.b);\n' +
    '  float chainAlpha = cG.a;\n' +
    '  vec3 base = uBgColor;\n' +
    '  vec3 blend = mix(uOutputColor, chainColor, chainAlpha);\n' +
    // uTransparent (0 or 1, see `settings.background.transparent`) swaps
    // between the original opaque look (an solid uBgColor plate, full
    // alpha) and a see-through one where only the effect chain itself is
    // visible, its own alpha carried straight through as the pixel's
    // alpha — so a caller compositing this canvas over other page content
    // (e.g. BottomShader's `mix-blend-mode: hard-light`) sees that content
    // instead of a solid background color everywhere the effect chain
    // doesn't itself contribute.
    '  vec3 opaqueRgb = base * mix(vec3(1.), blend, uBlendStrength);\n' +
    // uCapAmount (0-1, see `settings.output.capAmount`) is the transparent
    // branch's own further mix, from the see-through effect chain toward a
    // fully opaque uOutputColor plate. It exists so BottomShader can ease a
    // transparent, hard-light-composited overlay into a solid "end of
    // page" cap using nothing but this one canvas: a hard-light blend of a
    // fully opaque, pure uOutputColor (white) top layer is visually
    // identical to a plain (non-blended) one — hard-light's formula
    // collapses to the top color outright once its alpha is 1 and its
    // value is 1 in every channel — so there's no second element or
    // blend-mode switch needed to "remove" hard-light at uCapAmount == 1;
    // it already reads as a plain solid cap by then. At uCapAmount == 0
    // this branch is exactly the reference index.pen.html export's own
    // (unconditional) output formula — `base * mix(1, blend, blendStrength)`
    // for rgb, `chainAlpha * blendStrength` for alpha — the reference never
    // has a transparent/opaque split at all, so matching its math here is
    // what makes uTransparent's "true" branch actually look like it.
    '  vec3 transparentRestRgb = base * mix(vec3(1.), blend, uBlendStrength);\n' +
    '  float transparentRestAlpha = chainAlpha * uBlendStrength;\n' +
    '  vec3 transparentRgb = mix(transparentRestRgb, uOutputColor, uCapAmount);\n' +
    '  float transparentAlpha = mix(transparentRestAlpha, 1., uCapAmount);\n' +
    '  fragColor.rgb = mix(opaqueRgb, transparentRgb, uTransparent);\n' +
    '  fragColor.a = mix(1., transparentAlpha, uTransparent);\n' +
    '}';

  const vignetteProg = createProgram(VS, FS_VIGNETTE);
  const sineProg = createProgram(VS, FS_SINE);
  const shatterProg = createProgram(VS, FS_SHATTER);
  const bokehProg = createProgram(VS, FS_BOKEH);
  const outputProg = createProgram(VS, FS_OUTPUT);

  // ---------------------------------------------------------------
  // framebuffers
  // ---------------------------------------------------------------
  function createFBO() {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fbo, tex, w: 1, h: 1 };
  }
  function resizeFBO(f, w, h) {
    f.w = w; f.h = h;
    gl.bindTexture(gl.TEXTURE_2D, f.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }

  let bufferRead = createFBO();
  let bufferWrite = createFBO();
  function swap() { const t = bufferRead; bufferRead = bufferWrite; bufferWrite = t; }

  // ---------------------------------------------------------------
  // textures: gradient ring (from the variant's color stops) + blue noise
  // ---------------------------------------------------------------
  // Evenly spaced stops across the given colors, then the first color
  // repeated at 1.0 so the angular lookup in FS_VIGNETTE has no seam —
  // same wrap-around trick as the original's hand-picked stops.
  function makeGradientTexture(stopColors) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 1;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 512, 0);
    const n = stopColors.length;
    stopColors.forEach((color, i) => g.addColorStop(i / n, color));
    g.addColorStop(1, stopColors[0]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 1);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    return tex;
  }
  function makeBlueNoiseTexture(size) {
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      data[i * 4 + 0] = (Math.random() * 256) | 0;
      data[i * 4 + 1] = (Math.random() * 256) | 0;
      data[i * 4 + 2] = 0;
      data[i * 4 + 3] = 255;
    }
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    return tex;
  }

  const gradientTex = makeGradientTexture(colors);
  const blueNoiseTex = makeBlueNoiseTexture(blueNoiseSize);

  // ---------------------------------------------------------------
  // per-instance settings/state (module-level in the original page script;
  // closed over here so multiple mounted instances don't collide)
  // ---------------------------------------------------------------
  const state = {
    resolution: [1, 1],
    blueNoiseResolution: [6, 6],
  };
  const bgColorVec = hexToRgb(settings.background.color);
  const outputColorVec = hexToRgb(settings.output.color);

  const renderScale = options.multiplier ?? 0.6;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const hostW = canvas.clientWidth || 1;
    const hostH = canvas.clientHeight || 1;
    canvas.width = Math.floor(hostW * dpr);
    canvas.height = Math.floor(hostH * dpr);
    const w = Math.max(1, Math.floor(canvas.width * renderScale));
    const h = Math.max(1, Math.floor(canvas.height * renderScale));
    state.resolution = [w, h];
    resizeFBO(bufferRead, w, h);
    resizeFBO(bufferWrite, w, h);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // ---------------------------------------------------------------
  // pointer tracking — relative to the canvas's own bounding rect, same as
  // the original, but scoped to this instance instead of module globals
  // ---------------------------------------------------------------
  const pointer = [0.5, pointerMaxY != null ? pointerMaxY : 0.5];
  const currPointer = [pointer[0], pointer[1]];
  function onPointerMove(e) {
    const r = canvas.getBoundingClientRect();
    pointer[0] = (e.clientX - r.left) / r.width;
    let y = 1 - (e.clientY - r.top) / r.height;
    // BottomShader only: its canvas spans the full page height (see
    // bottom-shader-definition.js's CANVAS_HEIGHT) but only the bottom
    // slice is actually visible — the rest sits clipped above it. Without
    // this, the cursor tracking above still computes a real (in-range)
    // pointer y whenever the mouse is anywhere higher up the page, so the
    // light just drifts up out of the visible window and the effect reads
    // as "off" the moment the cursor leaves the strip. Clamping to
    // `pointerMaxY` (the visible window's own top edge, in this same
    // canvas-normalized space) pins the light there instead, so it keeps
    // reading as lit — as if the cursor never left the top edge of the
    // shader — the instant the real cursor is above that line, and tracks
    // normally again the moment it's back inside the window.
    if (pointerMaxY != null && y > pointerMaxY) y = pointerMaxY;
    pointer[1] = y;
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  let stopped = false;
  function onDblClick() { stopped = !stopped; }
  if (pauseOnDoubleClick) canvas.addEventListener('dblclick', onDblClick);

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------
  // per-pass draw functions
  // ---------------------------------------------------------------
  function drawVignette(target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.viewport(0, 0, target.w, target.h);
    gl.useProgram(vignetteProg.program);
    const u = vignetteProg.uniforms;
    bindTex(u, 'tGradient', gradientTex, 0);
    set2(u, 'uResolution', state.resolution);
    setF(u, 'uRadius', settings.vignette.radius);
    setF(u, 'uFalloff', settings.vignette.falloff);
    setF(u, 'uSkew', settings.vignette.skew);
    setF(u, 'uAngle', settings.vignette.angle);
    setF(u, 'uSpin', elapsed * 0.035);
    set2(u, 'uPos', currPointer);
    set3(u, 'uClearColor', bgColorVec);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawQuad();
  }

  function drawSine(target, inputTex) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.viewport(0, 0, target.w, target.h);
    gl.useProgram(sineProg.program);
    const u = sineProg.uniforms;
    bindTex(u, 'tInput', inputTex, 0);
    setF(u, 'uMixRadius', settings.sine.mixRadius);
    set2(u, 'uPos', [0.5, 0.5]);
    setF(u, 'uFrequency', settings.sine.frequency);
    setF(u, 'uAmplitude', settings.sine.amplitude);
    setF(u, 'uRotation', settings.sine.rotation);
    setF(u, 'uTime', elapsed);
    set2(u, 'uResolution', state.resolution);
    set2(u, 'uMousePos', currPointer);
    setF(u, 'uTrackMouse', settings.sine.trackMouse);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawQuad();
  }

  function drawShatter(target, inputTex) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.viewport(0, 0, target.w, target.h);
    gl.useProgram(shatterProg.program);
    const u = shatterProg.uniforms;
    bindTex(u, 'tInput', inputTex, 0);
    set2(u, 'uResolution', state.resolution);
    setF(u, 'uAngle', settings.shatter.angle / 360);
    setF(u, 'uAmount', settings.shatter.scale);
    setF(u, 'uSpread', settings.shatter.amount);
    setF(u, 'uSkew', settings.shatter.skew);
    setF(u, 'uTime', elapsed);
    set2(u, 'uPos', [0.5, 0.5]);
    setF(u, 'uMixRadius', settings.shatter.mixRadius);
    set2(u, 'uMousePos', currPointer);
    setF(u, 'uTrackMouse', settings.shatter.trackMouse);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawQuad();
  }

  function drawBokeh(target, inputTex) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.viewport(0, 0, target.w, target.h);
    gl.useProgram(bokehProg.program);
    const u = bokehProg.uniforms;
    bindTex(u, 'tInput', inputTex, 0);
    bindTex(u, 'tBlueNoise', blueNoiseTex, 1);
    set2(u, 'uBlueNoiseResolution', state.blueNoiseResolution);
    set2(u, 'uResolution', state.resolution);
    setF(u, 'uAmount', settings.bokeh.radius);
    setF(u, 'uTilt', settings.bokeh.tilt);
    setF(u, 'uTime', elapsed);
    set2(u, 'uPos', [0.5, 0.5]);
    setF(u, 'uMixRadius', settings.bokeh.mixRadius);
    set2(u, 'uMousePos', currPointer);
    setF(u, 'uTrackMouse', settings.bokeh.trackMouse);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawQuad();
  }

  function drawOutput(inputTex) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(outputProg.program);
    const u = outputProg.uniforms;
    bindTex(u, 'tInput', inputTex, 0);
    set3(u, 'uOutputColor', outputColorVec);
    set3(u, 'uBgColor', bgColorVec);
    set2(u, 'uPos', currPointer);
    set2(u, 'uResolution', [canvas.width, canvas.height]);
    setF(u, 'uAberration', settings.output.aberration);
    setF(u, 'uBlendStrength', settings.output.blendStrength);
    setF(u, 'uTransparent', transparentBg ? 1 : 0);
    setF(u, 'uCapAmount', settings.output.capAmount || 0);
    gl.clearColor(bgColorVec[0], bgColorVec[1], bgColorVec[2], transparentBg ? 0 : 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawQuad();
  }

  // ---------------------------------------------------------------
  // render loop
  // ---------------------------------------------------------------
  let last = performance.now();
  let elapsed = 0;
  let raf = 0;
  let disposed = false;

  function frame(now) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    const delta = now - last;
    last = now;

    const smoothing = stopped ? 0 : 0.1;
    currPointer[0] = lerp(currPointer[0], pointer[0], smoothing);
    currPointer[1] = lerp(currPointer[1], pointer[1], smoothing);
    if (!stopped && !reduceMotion) elapsed += (delta / 1000) * 2;

    drawVignette(bufferWrite);
    swap();

    drawSine(bufferWrite, bufferRead.tex);
    swap();

    drawShatter(bufferWrite, bufferRead.tex);
    swap();

    drawBokeh(bufferWrite, bufferRead.tex);
    swap();

    drawOutput(bufferRead.tex);
  }
  raf = requestAnimationFrame(frame);

  function dispose() {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    if (pauseOnDoubleClick) canvas.removeEventListener('dblclick', onDblClick);
  }

  return { dispose };
}
