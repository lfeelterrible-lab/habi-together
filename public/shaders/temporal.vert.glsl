uniform float uTime;
uniform vec2 uMouse;
uniform float uSlice;
uniform float uDepth;
uniform float uIntensity;
uniform float uVelocity;
uniform float uBurst;

varying vec2 vUv;
varying float vDepth;

void main() {
  vUv = uv;
  vDepth = uDepth;

  vec3 transformed = position;
  float phase = uSlice * 0.37;
  float temporalWave = sin(position.y * 4.2 + uTime * 0.34 + phase) * 0.012;
  float lateralWave = cos(position.x * 3.4 - uTime * 0.23 + phase * 1.7) * 0.009;
  float depthFactor = uDepth * (0.55 + uIntensity * 0.45);

  transformed.x += temporalWave * depthFactor;
  transformed.y += lateralWave * depthFactor;
  transformed.z += sin(position.x * 2.3 + uTime * 0.18 + phase) * 0.01 * uDepth;
  transformed.x += uMouse.x * uDepth * 0.018;
  transformed.y += uMouse.y * uDepth * 0.014;
  transformed.xy *= 1.0 + uDepth * (0.012 + uVelocity * 0.025 + uBurst * 0.04);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
