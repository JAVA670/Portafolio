/**
 * Liquid-chrome ferrofluid — a raymarched signed-distance field.
 *
 * A mercury core (three smooth-min metaballs) bristles with ferrofluid
 * spikes and clings to a thin aperture ring — a lens, rendered as liquid
 * metal. Shading is pure reflection of a procedural studio: white softbox
 * strips, an electric-cobalt key light and an ice rim, so it reads as wet,
 * reflective and slightly menacing against the obsidian canvas.
 *
 * Uniforms
 *   uTime    seconds
 *   uRes     drawing-buffer resolution in px
 *   uMouse   pointer, smoothed, -1..1
 *   uScroll  hero scroll progress 0..1 (spikes grow, camera pushes in)
 *   uOffset  horizontal framing offset in uv units (desktop: push right)
 *   uDist    camera distance (mobile sits further back so the form fits)
 */

export const ferrofluidVertex = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const ferrofluidFragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uOffset;
  uniform float uDist;

  #define MAX_STEPS 110
  #define MAX_DIST 9.0

  mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
  }

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  // Sharp peaks on a lattice over the sphere of directions — ferrofluid
  // spikes. Two octaves: big thorns plus finer needles between them.
  float spikes(vec3 n, float t) {
    float a = sin(n.x * 5.0 + t * 0.55) * sin(n.y * 5.0 - t * 0.35) * sin(n.z * 5.0 + t * 0.25);
    float b = sin(n.x * 9.0 - t * 0.45) * sin(n.y * 9.0 + t * 0.6) * sin(n.z * 9.0 - t * 0.2);
    return pow(max(a, 0.0), 3.2) * 1.0 + pow(max(b, 0.0), 4.0) * 0.55;
  }

  vec3 orient(vec3 p) {
    float t = uTime;
    p.xz *= rot(t * 0.13 + uMouse.x * 0.7 + uScroll * 1.6);
    p.yz *= rot(0.32 + uMouse.y * 0.45 - uScroll * 0.7);
    return p;
  }

  float map(vec3 p) {
    float t = uTime;
    p = orient(p);

    // Mercury core
    float core = length(p) - 0.72;
    vec3 b1 = vec3(sin(t * 0.71) * 0.52, cos(t * 0.53) * 0.36, sin(t * 0.37) * 0.4);
    vec3 b2 = vec3(-cos(t * 0.43) * 0.56, sin(t * 0.61) * 0.4, cos(t * 0.29) * 0.32);
    core = smin(core, length(p - b1) - 0.4, 0.42);
    core = smin(core, length(p - b2) - 0.32, 0.36);

    // Ferrofluid spikes radiating from the core
    vec3 n = normalize(p);
    float amp = 0.34 + uScroll * 0.6;
    float d = core - spikes(n, t) * amp;

    // Aperture ring the fluid clings to (the lens)
    vec2 q = vec2(length(p.xy) - 1.34, p.z);
    float ring = length(q) - 0.05;
    d = smin(d, ring, 0.26);

    return d;
  }

  vec3 calcNormal(vec3 p) {
    const vec2 e = vec2(0.0015, -0.0015);
    return normalize(
      e.xyy * map(p + e.xyy) +
      e.yyx * map(p + e.yyx) +
      e.yxy * map(p + e.yxy) +
      e.xxx * map(p + e.xxx)
    );
  }

  // Procedural studio the chrome reflects.
  vec3 env(vec3 r) {
    vec3 c = vec3(0.008, 0.009, 0.014);

    // Overhead softbox strip
    float top = smoothstep(0.42, 0.5, r.y) * (1.0 - smoothstep(0.78, 0.9, r.y));
    c += vec3(1.0) * top * 1.6 * smoothstep(0.9, 0.2, abs(r.x));

    // Vertical strip on the left
    float vs = 1.0 - smoothstep(0.03, 0.09, abs(r.x + 0.58));
    c += vec3(0.92, 0.96, 1.0) * vs * smoothstep(-0.4, 0.3, r.y) * 1.3;

    // Electric cobalt key from the right
    float k = max(dot(r, normalize(vec3(0.9, -0.15, 0.4))), 0.0);
    c += vec3(0.0, 0.22, 1.0) * pow(k, 2.6) * 2.6;

    // Ice rim from below
    float k2 = max(dot(r, normalize(vec3(-0.25, -0.95, 0.15))), 0.0);
    c += vec3(0.65, 0.85, 1.0) * pow(k2, 7.0) * 1.4;

    // Faint silver horizon
    c += vec3(0.22, 0.24, 0.3) * smoothstep(-0.15, 0.1, r.y) * smoothstep(0.4, 0.1, r.y) * 0.5;
    return c;
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    uv.x -= uOffset;

    vec3 ro = vec3(0.0, 0.0, uDist - uScroll * 1.2);
    vec3 rd = normalize(vec3(uv, -1.5));

    float t = 0.0;
    float dmin = 1e9;
    bool hit = false;
    for (int i = 0; i < MAX_STEPS; i++) {
      vec3 p = ro + rd * t;
      float d = map(p);
      dmin = min(dmin, d);
      if (d < 0.0012) { hit = true; break; }
      t += d * 0.55;
      if (t > MAX_DIST) break;
    }

    // Background stays in display space so the canvas is exactly the page
    // obsidian (#050507) — only the chrome itself is tone mapped.
    vec3 bg = vec3(0.0196, 0.0196, 0.0275);
    float halo = exp(-max(dmin, 0.0) * 9.0);
    vec3 col = bg + vec3(0.0, 0.09, 0.55) * halo * 0.32;

    if (hit) {
      vec3 p = ro + rd * t;
      vec3 n = calcNormal(p);
      vec3 r = reflect(rd, n);
      float fres = pow(1.0 - max(dot(n, -rd), 0.0), 4.0);

      vec3 c = env(r) * mix(0.78, 1.35, fres);
      c += vec3(0.25, 0.45, 1.0) * fres * 0.35;

      // Tight specular glint off the softbox
      vec3 l = normalize(vec3(-0.3, 0.8, 0.6));
      float spec = pow(max(dot(r, l), 0.0), 90.0);
      c += vec3(0.85, 0.93, 1.0) * spec * 2.2;

      // Filmic tone map + gamma for the metal only
      c = c / (1.0 + c) * 1.18;
      col = pow(c, vec3(1.0 / 2.2));
    }

    // Dither against banding
    col += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Particle field: hard square specks drifting in depth, catching cobalt. */
export const particlesVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uScroll;
  attribute float aSeed;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec3 p = position;
    float speed = 0.04 + aSeed * 0.08;
    float a = uTime * speed + aSeed * 6.2831;
    float c = cos(a), s = sin(a);
    p.xz = mat2(c, -s, s, c) * p.xz;
    p.y += sin(uTime * 0.3 + aSeed * 12.0) * 0.12;
    // Scroll pulls the field outward as the camera pushes in
    p *= 1.0 + uScroll * 0.35;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min((1.4 + aSeed * 2.6) * uPixelRatio * (3.2 / -mv.z), 5.0 * uPixelRatio);

    // Specks behind the chrome mass fade out so they never cut through it
    float behind = step(p.z, 0.0) * (1.0 - smoothstep(0.9, 1.7, length(p.xy)));
    vAlpha = (0.35 + aSeed * 0.65) * (1.0 - behind);

    vColor = aSeed < 0.55
      ? vec3(1.0)
      : (aSeed < 0.82 ? vec3(0.65, 0.85, 1.0) : vec3(0.23, 0.51, 0.96));
  }
`;

export const particlesFragment = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;
