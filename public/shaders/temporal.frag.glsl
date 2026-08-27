uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform float uSlice;
uniform float uDepth;
uniform float uIntensity;
uniform float uVelocity;
uniform float uBurst;

varying vec2 vUv;
varying float vDepth;

float hash21(vec2 point) {
  point = fract(point * vec2(123.34, 456.21));
  point += dot(point, point + 45.32);
  return fract(point.x * point.y);
}

void main() {
  float depth = clamp(vDepth, 0.0, 1.0);
  vec2 uv = vUv;
  float phase = uSlice * 0.37;

  float horizontalWave = sin(uv.y * 8.0 + uTime * 0.31 + phase) * 0.0028;
  float verticalWave = cos(uv.x * 6.0 - uTime * 0.18 + phase * 0.8) * 0.0018;
  uv.x += horizontalWave * depth * uIntensity + uMouse.x * 0.0018 * depth;
  uv.y += verticalWave * depth * uIntensity + uMouse.y * 0.0012 * depth;

  float fringe = 0.00035 + depth * 0.0032 + uVelocity * 0.0014 + uBurst * 0.004;
  vec4 center = texture2D(uTexture, uv);
  float red = texture2D(uTexture, uv + vec2(fringe, 0.0)).r;
  float blue = texture2D(uTexture, uv - vec2(fringe, 0.0)).b;
  vec3 color = center.rgb;
  float chromaMix = smoothstep(0.48, 1.0, depth) * (0.32 + uBurst * 0.5 + uVelocity * 0.3);
  color.r = mix(color.r, red, chromaMix);
  color.b = mix(color.b, blue, chromaMix);

  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float edgeGlow = smoothstep(0.68, 0.98, luminance) * (0.008 + depth * 0.022 + uBurst * 0.016);
  color += edgeGlow * vec3(0.44, 0.78, 0.88);

  float grain = (hash21(uv * (uSlice + 1.0) + uTime * 0.03) - 0.5) * 0.013;
  color += grain * (0.2 + depth * 0.8);
  color *= 1.0 - depth * 0.045;

  float alpha = exp(-depth * 3.6);
  alpha *= 0.98 + sin(uTime * 0.42 + phase) * 0.012 * depth;
  alpha *= 1.0 - smoothstep(0.96, 1.0, abs(vUv.x - 0.5) * 2.0);

  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
}
