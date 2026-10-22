import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createCoverCanvas } from '../lib/cover.js';
import { fontsReady } from '../lib/hooks.js';

// One section = this many "virtual scroll" units; matches the reference feel.
export const UNITS = 620;
const R = 7;
const FOV = 40;
const { clamp, lerp, damp } = THREE.MathUtils;

/* ─── Shaders ──────────────────────────────────────────────────────────── */

const vertexShader = /* glsl */ `
precision highp float;
uniform vec2 uBend;
varying vec2 vUv;
const float PI = 3.141592653589793;
void main() {
  vUv = uv;
  vec3 p = position;
  p.x += sin(uv.y * PI) * uBend.x;
  p.y += sin(uv.x * PI) * uBend.y;
  p.z += sin(uv.x * PI) * sin(uv.y * PI) * length(uBend) * 0.55;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
uniform sampler2D uMap;
uniform vec2 uUvScale;
uniform vec2 uUvOffset;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(uMap, vUv * uUvScale + uUvOffset);
  gl_FragColor = vec4(c.rgb, c.a * uOpacity);
}
`;

/* ─── Textures ─────────────────────────────────────────────────────────── */

function finishTexture(tex, gl) {
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
  tex.needsUpdate = true;
  return tex;
}

/** Renders uppercase Satoshi text into a tightly-sized canvas texture. */
function textTexture(gl, text, { size = 220, weight = 900, color = '#ecdfcc', lineHeight = 0.86, spacing = -0.04, align = 'center' } = {}) {
  const lines = text.split('\n');
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const font = `${weight} ${size}px Satoshi, Arial, Helvetica, sans-serif`;
  ctx.font = font;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing * size}px`;
  const pad = size * 0.12;
  const widths = lines.map((l) => ctx.measureText(l).width);
  c.width = Math.ceil(Math.max(...widths) + pad * 2);
  c.height = Math.ceil(size * lineHeight * (lines.length - 1) + size * 1.0 + pad * 2);
  ctx.font = font;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing * size}px`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = align;
  const x = align === 'center' ? c.width / 2 : align === 'right' ? c.width - pad : pad;
  lines.forEach((l, i) => ctx.fillText(l, x, pad + size * 0.8 + i * size * lineHeight));
  const tex = finishTexture(new THREE.CanvasTexture(c), gl);
  return { tex, aspect: c.width / c.height };
}

function coverTexture(gl, project, index) {
  const canvas = createCoverCanvas(project, index, 1200, 900);
  return { tex: finishTexture(new THREE.CanvasTexture(canvas), gl), aspect: 4 / 3 };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ─── Layout ───────────────────────────────────────────────────────────── */

/**
 * Turns semantic sections into positioned panel specs, using the visible
 * half-width (hw) / half-height (hh) at radius R so it adapts to any viewport.
 */
function layout(sections, assets, view) {
  const { hw, hh, mobile } = view;
  const T = (Math.PI * 2) / sections.length;
  const specs = [];

  const fitText = (asset, maxW, maxH) => {
    let h = maxH;
    let w = h * asset.aspect;
    if (w > maxW) { w = maxW; h = w / asset.aspect; }
    return { w, h };
  };

  sections.forEach((s, k) => {
    const base = k * T;
    const A = assets[s.id];
    if (!A) return;
    const add = (spec) => specs.push({ ...spec, angle: base + spec.x / R, section: k, key: `${s.id}-${specs.length}` });

    // Main label.
    const labelMaxW = mobile ? hw * 1.72 : Math.min(hw * 1.12, 9);
    const labelMaxH = mobile ? hh * 0.34 : hh * (s.kind === 'intro' ? 0.7 : 0.62);
    const L = fitText(A.label, labelMaxW, labelMaxH);
    const labelX = s.kind === 'intro' && !mobile ? hw * 0.14 : 0;
    const labelY = s.kind === 'intro' && mobile ? -hh * 0.06 : 0;
    add({ type: 'text', tex: A.label.tex, w: L.w, h: L.h, x: labelX, y: labelY, r: R, to: s.to, order: 1, bend: 1, delay: 0.05 });

    if (A.caption) {
      const C = fitText(A.caption, mobile ? hw * 1.6 : hw * 0.9, mobile ? 0.13 : 0.16);
      const cy = labelY - L.h / 2 - (mobile ? 0.22 : 0.32);
      const cx = s.kind === 'intro' && !mobile ? labelX - L.w / 2 + C.w / 2 : 0;
      add({ type: 'text', tex: A.caption.tex, w: C.w, h: C.h, x: cx, y: cy, r: R, to: s.to, order: 1, bend: 0.8, delay: 0.25, opacity: 0.75 });
    }

    if (A.portrait) {
      const pw = mobile ? Math.min(hw * 0.62, 1.3) : clamp(hw * 0.27, 1.05, 1.75);
      const ph = pw * 1.25;
      const px = mobile ? 0 : -hw * 0.62;
      const py = mobile ? labelY + L.h / 2 + ph / 2 + 0.25 : hh * 0.18;
      add({ type: 'image', tex: A.portrait.tex, imgAspect: A.portrait.aspect, w: pw, h: ph, x: px, y: py, r: R - 0.8, rotZ: mobile ? 0 : 0.035, to: s.portraitTo, order: 2, bend: 1.2, delay: 0.15, hover: true });
    }

    // Floating covers around the label.
    const covers = A.covers || [];
    const slots = mobile
      ? [[-0.4, 0.56, -0.04], [0.4, -0.56, 0.04]]
      : [[-0.6, 0.36, -0.05], [0.62, -0.3, 0.045], [0.58, 0.42, 0.03], [-0.58, -0.32, -0.03]];
    const cw = mobile ? Math.min(hw * 0.95, 2.1) : clamp(hw * 0.33, 1.4, 2.4);
    covers.slice(0, slots.length).forEach((cv, i) => {
      const [sx, sy, rz] = slots[i];
      add({ type: 'cover', tex: cv.tex, w: cw, h: cw * 0.75, x: sx * hw, y: sy * hh, r: R - 0.9 - i * 0.05, rotZ: rz, to: cv.to, order: 2 + i, bend: 1.25, delay: 0.2 + i * 0.08, hover: true });
    });

    // Small floating words (about section).
    const words = A.words || [];
    const wslots = mobile
      ? [[-0.3, 0.62], [0.32, 0.48], [-0.34, -0.5], [0.3, -0.64]]
      : [[-0.55, 0.5], [0.52, 0.56], [-0.62, -0.06], [0.64, 0.04], [-0.48, -0.46], [0.5, -0.44]];
    words.slice(0, wslots.length).forEach((wd, i) => {
      const [sx, sy] = wslots[i];
      const W = fitText(wd, mobile ? hw * 0.9 : hw * 0.55, mobile ? 0.15 : 0.2);
      add({ type: 'text', tex: wd.tex, w: W.w, h: W.h, x: sx * hw, y: sy * hh, r: R - 0.5, to: s.to, order: 2, bend: 1.4, delay: 0.25 + i * 0.05, opacity: 0.7, hover: true });
    });
  });
  return specs;
}

/* ─── Motion controller ────────────────────────────────────────────────── */

function Controller({ motion, count, onSection }) {
  const lastIdx = useRef(-1);
  useFrame((state, delta) => {
    const m = motion.current;
    const dt = clamp(delta, 0.001, 1 / 30);

    if (!m.touching) {
      m.target += m.velocity * dt;
      m.velocity *= Math.exp(-4.4 * dt);
      if (Math.abs(m.velocity) < 0.5) m.velocity = 0;
      // Settle on the nearest section once input has stopped.
      if (Math.abs(m.velocity) < 40 && performance.now() - m.lastInput > 160) {
        m.target = damp(m.target, Math.round(m.target / UNITS) * UNITS, 6, dt);
      }
    }
    m.current = damp(m.current, m.target, m.touching ? 18 : 10, dt);
    if (Math.abs(m.target - m.current) < 0.001) m.current = m.target;

    // Bend follows the lag between target and current, with a springy wobble.
    const diff = m.target - m.current;
    const goalX = clamp(-diff * 0.0019, -0.7, 0.7);
    const goalY = clamp(diff * 0.0004, -0.22, 0.22);
    m.bvx += (goalX - m.bx) * 112 * dt;
    m.bvy += (goalY - m.by) * 112 * dt;
    m.bvx *= Math.exp(-10.8 * dt);
    m.bvy *= Math.exp(-10.8 * dt);
    m.bx += m.bvx * dt;
    m.by += m.bvy * dt;

    if (m.introActive && m.intro < 1.6) m.intro = Math.min(1.6, m.intro + dt / 1.5);

    const T = (Math.PI * 2) / count;
    state.camera.position.set(0, 0, 0);
    state.camera.rotation.set(0, -(m.current / UNITS) * T, 0, 'YXZ');

    const idx = ((Math.round(m.current / UNITS) % count) + count) % count;
    if (idx !== lastIdx.current) {
      lastIdx.current = idx;
      onSection?.(idx);
    }
  });
  return null;
}

/* ─── Panel ────────────────────────────────────────────────────────────── */

function Panel({ spec, motion, onNavigate }) {
  const inner = useRef(null);
  const mat = useRef(null);
  const st = useRef({ hover: false, s: 1, px: 0, py: 0, tx: 0, ty: 0 });
  const uniforms = useMemo(() => {
    const u = {
      uMap: { value: spec.tex },
      uBend: { value: new THREE.Vector2() },
      uOpacity: { value: 0 },
      uUvScale: { value: new THREE.Vector2(1, 1) },
      uUvOffset: { value: new THREE.Vector2(0, 0) },
    };
    if (spec.imgAspect) {
      // object-fit: cover
      const planeAspect = spec.w / spec.h;
      if (spec.imgAspect > planeAspect) {
        const s = planeAspect / spec.imgAspect;
        u.uUvScale.value.set(s, 1);
        u.uUvOffset.value.set((1 - s) / 2, 0);
      } else {
        const s = spec.imgAspect / planeAspect;
        u.uUvScale.value.set(1, s);
        u.uUvOffset.value.set(0, (1 - s) / 2);
      }
    }
    return u;
  }, [spec]);

  useFrame((_, delta) => {
    const g = inner.current;
    // Write through the live material: R3F may swap the uniforms object on prop updates.
    const u = mat.current?.uniforms;
    if (!g || !u?.uBend) return;
    const dt = Math.min(delta, 1 / 30);
    const m = motion.current;
    const s = st.current;
    const p = clamp((m.intro - spec.delay) / 0.9, 0, 1);
    const e = 1 - (1 - p) ** 4;

    const hoverScale = s.hover ? (spec.type === 'text' ? 1.04 : 1.07) : 1;
    s.s = damp(s.s, hoverScale, 9, dt);
    s.px = damp(s.px, s.hover ? s.tx : 0, 7, dt);
    s.py = damp(s.py, s.hover ? s.ty : 0, 7, dt);
    g.scale.setScalar(s.s * lerp(0.72, 1, e));
    g.position.set(s.px * spec.w * 0.06 + (1 - e) * 0.9, s.py * spec.h * 0.06, 0);

    u.uBend.value.set(m.bx * spec.bend - (1 - e) * 1.6, m.by * spec.bend + (1 - e) * 0.15);
    u.uOpacity.value = (spec.opacity ?? 1) * clamp(p * 1.8, 0, 1);
  });

  const interactive = !!spec.to;
  const handlers = interactive ? {
    onPointerOver: (e) => { e.stopPropagation(); st.current.hover = true; document.body.style.cursor = 'pointer'; },
    onPointerOut: () => { st.current.hover = false; document.body.style.cursor = ''; },
    onPointerMove: (e) => {
      if (!e.uv) return;
      st.current.tx = (e.uv.x - 0.5) * 2;
      st.current.ty = (e.uv.y - 0.5) * 2;
    },
    onClick: (e) => {
      e.stopPropagation();
      if (motion.current.dragMoved > 8) return;
      document.body.style.cursor = '';
      onNavigate(spec.to);
    },
  } : {};

  return (
    <group position={[Math.sin(spec.angle) * spec.r, spec.y, -Math.cos(spec.angle) * spec.r]} rotation={[0, -spec.angle, 0]}>
      <group ref={inner}>
        <mesh rotation={[0, 0, spec.rotZ || 0]} renderOrder={spec.order} {...handlers}>
          <planeGeometry args={[spec.w, spec.h, 24, 12]} />
          <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} depthTest={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ─── Scene ────────────────────────────────────────────────────────────── */

function Scene({ sections, motion, onSection, onReady, onNavigate }) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const [assets, setAssets] = useState(null);

  useEffect(() => {
    let alive = true;
    const made = [];
    (async () => {
      await fontsReady();
      const out = {};
      for (const s of sections) {
        const a = { label: textTexture(gl, s.label) };
        if (s.caption) a.caption = textTexture(gl, s.caption, { size: 90, weight: 900, spacing: 0.02 });
        if (s.covers) a.covers = s.covers.map((c) => ({ ...coverTexture(gl, c.project, c.index), to: c.to }));
        if (s.words) a.words = s.words.map((w) => textTexture(gl, w, { size: 110, spacing: -0.02 }));
        if (s.portrait) {
          try {
            const img = await loadImage(s.portrait);
            const tex = finishTexture(new THREE.Texture(img), gl);
            a.portrait = { tex, aspect: img.naturalWidth / img.naturalHeight };
          } catch { /* portrait optional */ }
        }
        out[s.id] = a;
        Object.values(a).flat().forEach((x) => x?.tex && made.push(x.tex));
      }
      if (alive) { setAssets(out); onReady?.(); }
    })();
    return () => { alive = false; made.forEach((t) => t.dispose()); };
  }, [gl, sections, onReady]);

  const specs = useMemo(() => {
    if (!assets) return [];
    const aspect = size.width / size.height;
    const hh = R * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    return layout(sections, assets, { hw: hh * aspect, hh, mobile: aspect < 0.9 });
  }, [assets, sections, size.width, size.height]);

  return (
    <>
      <Controller motion={motion} count={sections.length} onSection={onSection} />
      {specs.map((spec) => <Panel key={spec.key} spec={spec} motion={motion} onNavigate={onNavigate} />)}
    </>
  );
}

/** Full-screen ring. `motion` is a mutable ref shared with the input hook. */
function Ring(props) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: FOV, near: 0.1, far: 50, position: [0, 0, 0] }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => { document.body.style.cursor = ''; }}
    >
      <Scene {...props} />
    </Canvas>
  );
}

export default memo(Ring);

/* ─── Input ────────────────────────────────────────────────────────────── */

export function createMotion() {
  return {
    target: 0, current: 0, velocity: 0, touching: false, lastInput: 0,
    dragMoved: 0, bx: 0, by: 0, bvx: 0, bvy: 0, intro: 0, introActive: false,
  };
}

const blocked = (t) => t instanceof Element && !!t.closest('.contact, .mmenu, .nav, .mnav, .home-index, .bbar, a, button');

/** Wheel / drag / swipe / keyboard → virtual scroll. */
export function useRingInput(motion, enabled, count) {
  useEffect(() => {
    if (!enabled) return undefined;
    const m = motion.current;
    let last = null;

    const touch = () => { m.lastInput = performance.now(); };

    const onWheel = (e) => {
      if (e.target instanceof Element && e.target.closest('.contact, .mmenu')) return;
      e.preventDefault();
      let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (e.deltaMode === 1) d *= 16;
      if (e.deltaMode === 2) d *= window.innerHeight;
      d = clamp(d, -110, 110);
      m.velocity = clamp(m.velocity + d * 10.5, -1450, 1450);
      touch();
    };

    const onKey = (e) => {
      const t = e.target;
      if (t instanceof HTMLElement && (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable)) return;
      if (document.querySelector('.contact[aria-hidden="false"]')) return;
      let n = 0;
      if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) n = 1;
      else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) n = -1;
      else return;
      e.preventDefault();
      m.velocity = 0;
      m.target = (Math.round(m.target / UNITS) + n) * UNITS;
      touch();
    };

    const onDown = (e) => {
      if (e.button !== 0 || blocked(e.target)) return;
      m.touching = true;
      m.velocity = 0;
      m.dragMoved = 0;
      last = { x: e.clientX, y: e.clientY, t: performance.now() };
      touch();
    };
    const onMove = (e) => {
      if (!m.touching || !last) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      const now = performance.now();
      const horizontal = Math.abs(dx) >= Math.abs(dy);
      const d = horizontal ? -dx * 1.5 : (e.pointerType === 'touch' ? -dy * 1.25 : 0);
      m.target += d;
      m.dragMoved += Math.abs(dx) + Math.abs(dy);
      const dts = Math.max((now - last.t) / 1000, 0.008);
      m.velocity = lerp(m.velocity, clamp(d / dts, -1250, 1250), 0.2);
      last = { x: e.clientX, y: e.clientY, t: now };
      touch();
    };
    const onUp = () => {
      if (!m.touching) return;
      m.touching = false;
      last = null;
      touch();
      // Let a click that follows a drag see dragMoved, then reset.
      setTimeout(() => { m.dragMoved = 0; }, 0);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [motion, enabled, count]);
}

/** Moves to section i along the shortest way around the ring. */
export function scrollToSection(motion, i, count) {
  const m = motion.current;
  const k = Math.round(m.target / UNITS);
  const cur = ((k % count) + count) % count;
  let d = (((i - cur) % count) + count) % count;
  if (d > count / 2) d -= count;
  m.velocity = 0;
  m.target = (k + d) * UNITS;
  m.lastInput = performance.now();
}
