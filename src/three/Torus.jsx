import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uExit;
varying vec3 vNormalView;
varying float vPulse;
const float TAU = 6.283185307179586;

void main() {
  vec3 p = position;
  float live = 1.0 - smoothstep(0.0, 0.6, uExit);

  // A bulge travels around the ring.
  float travel = fract(uv.x - uTime * 0.33);
  float dist = min(travel, 1.0 - travel);
  float pulse = 1.0 - smoothstep(0.0, 0.22, dist);
  float core = 1.0 - smoothstep(0.0, 0.085, dist);

  vec2 radialDir = normalize(p.xy + vec2(0.0001));
  p.xy += radialDir * pulse * 0.13 * live;
  p.z += pulse * 0.18 * live;
  p += normal * core * 0.035 * live;
  p += normal * sin(uv.x * TAU + uTime * 1.5) * 0.008;

  // On exit, the ring contracts and swirls inward.
  float e = uExit * uExit * (3.0 - 2.0 * uExit);
  float a = atan(p.y, p.x) + e * 1.4;
  float r = length(p.xy) * (1.0 - e * 0.85);
  p.x = cos(a) * r;
  p.y = sin(a) * r;

  vPulse = core * live;
  vNormalView = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uOpacity;
varying vec3 vNormalView;
varying float vPulse;

void main() {
  vec3 n = normalize(vNormalView);
  float light = 0.55 + 0.45 * max(dot(n, normalize(vec3(0.35, 0.6, 1.0))), 0.0);
  float rim = pow(1.0 - abs(n.z), 2.2);
  vec3 col = uColor * light - rim * 0.22;
  col = mix(col, uAccent, vPulse * 0.85);
  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}
`;

/**
 * The pulsing ring used by the loader and the corner logo.
 * `exit` is a ref holding 0..1; it collapses the ring when it rises.
 */
export function Torus({ exit, scale = 1, tube = 0.085 }) {
  const mesh = useRef(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uExit: { value: 0 },
    uOpacity: { value: 1 },
    uColor: { value: new THREE.Color('#ecdfcc') },
    uAccent: { value: new THREE.Color('#d6493a') },
  }), []);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;
    const x = exit?.current ?? 0;
    uniforms.uTime.value = t;
    uniforms.uExit.value = x;
    uniforms.uOpacity.value = 1 - THREE.MathUtils.smoothstep(x, 0.55, 1);
    const k = THREE.MathUtils.lerp(1, 0.72, x);
    m.rotation.z += 0.95 * dt * k + dt * x * 2.2;
    m.rotation.y += 0.42 * dt * k;
    m.rotation.x = 0.78 + 0.08 * Math.sin(0.55 * t) * (1 - 0.7 * x);
  });

  return (
    <mesh ref={mesh} rotation={[0.78, -0.25, 0]} scale={scale}>
      <torusGeometry args={[1, tube, 24, 280]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} />
    </mesh>
  );
}
