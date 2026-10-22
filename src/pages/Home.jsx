import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { animate } from 'motion';
import { PROJECTS } from '../data/projects.js';
import { PROFILE } from '../data/profile.js';
import { hasWebGL, useLocalTime, useReducedMotion } from '../lib/hooks.js';
import { needsIntro, setReady, useReady } from '../lib/ready.js';
import Ring, { createMotion, scrollToSection, useRingInput } from '../three/Ring.jsx';
import { Torus } from '../three/Torus.jsx';
import { useTransitionNav } from '../components/Transition.jsx';
import { Reveal, TLink } from '../components/ui.jsx';


const bySlug = Object.fromEntries(PROJECTS.map((p, i) => [p.slug, { project: p, index: i, to: `/project/${p.slug}` }]));
const pick = (...slugs) => slugs.map((s) => bySlug[s]).filter(Boolean);
const countTag = (tag) => PROJECTS.filter((p) => p.tags.includes(tag)).length;
const pad2 = (n) => String(n).padStart(2, '0');
const LATEST = 'masid';

const SECTIONS = [
  {
    id: 'intro', kind: 'intro', title: PROFILE.name,
    label: 'MASSINE\nAMAKHTARI',
    caption: 'BACKEND ENGINEER — DISTRIBUTED SYSTEMS, EVENT-DRIVEN & CLOUD-NATIVE',
    portrait: PROFILE.portrait, portraitTo: '/about', to: '/about',
  },
  {
    id: 'distributed', kind: 'category', title: 'Distributed systems',
    label: 'DISTRIBUTED\nSYSTEMS',
    caption: `(${pad2(countTag('distributed'))}) PROJECTS — VIEW ALL →`,
    covers: pick('pulsestream', 'orderflow'), to: '/projects?tag=distributed',
  },
  {
    id: 'full-stack', kind: 'category', title: 'Full-stack platforms',
    label: 'FULL-STACK\nPLATFORMS',
    caption: `(${pad2(countTag('full-stack'))}) PROJECTS — VIEW ALL →`,
    covers: pick('masid', 'iot-health', 'e-recruitment', 'learnova'), to: '/projects?tag=full-stack',
  },
  {
    id: 'cloud-ai', kind: 'category', title: 'Cloud & AI',
    label: 'CLOUD\n& AI',
    caption: 'AZURE OPENAI · CONTENT SAFETY · COSMOS DB →',
    covers: pick('student-support-navigator'), to: '/projects?tag=cloud-ai',
  },
  {
    id: 'about', kind: 'about', title: 'About me',
    label: 'ABOUT\nME',
    caption: 'EXPERIENCE, EDUCATION & STACK →',
    words: ['JAVA · SPRING BOOT', 'KAFKA · RABBITMQ', 'EMSI — CLASS OF 2027', 'DOCKER · KUBERNETES', 'POSTGRESQL · MONGODB', 'OPEN FOR PFE — FEB 2027'],
    to: '/about',
  },
  {
    id: 'all', kind: 'category', title: 'All projects',
    label: 'ALL\nPROJECTS',
    caption: `(${pad2(PROJECTS.length)}) — SEE EVERYTHING →`,
    covers: pick('pulsestream', 'skycast', 'freelancehub', 'car-wash'), to: '/projects',
  },
];

const webglSupported = typeof window !== 'undefined' && hasWebGL();

function Loader({ done, onFinish }) {
  const [count, setCount] = useState(0);
  const [out, setOut] = useState(false);
  const exit = useRef(0);
  const doneRef = useRef(done);
  doneRef.current = done;

  useEffect(() => {
    const start = performance.now();
    let value = 0;
    let raf = 0;
    let exiting = false;
    const loop = (now) => {
      const elapsed = (now - start) / 1000;
      const target = doneRef.current ? 100 : Math.min(88, elapsed * 55);
      value += (target - value) * 0.07;
      setCount(Math.min(100, Math.round(value)));
      if (!exiting && doneRef.current && value > 99.4 && elapsed > 1.4) {
        exiting = true;
        const holder = { v: 0 };
        animate(holder, { v: 1 }, {
          duration: 0.95,
          ease: [0.76, 0, 0.24, 1],
          onUpdate: (v) => { exit.current = v; },
        }).then(() => { setOut(true); onFinish(); });
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [onFinish]);

  return (
    <div className={`loader ${out ? 'out' : ''}`} aria-hidden={out} role="status" aria-label="Loading portfolio">
      {webglSupported && (
        <div className="loader-canvas">
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3.6], fov: 45 }} gl={{ alpha: true, antialias: true }}>
            <Torus exit={exit} />
          </Canvas>
        </div>
      )}
      <div className="loader-meta meta">
        <span>{PROFILE.name} / Portfolio {new Date().getFullYear()}</span>
        <span className="loader-count">{String(count).padStart(3, '0')}%</span>
      </div>
    </div>
  );
}

function BottomBar({ ready }) {
  const time = useLocalTime();
  const latest = bySlug[LATEST].project;
  return (
    <div className="bbar">
      <Reveal as="h1" className="bbar-title" text={`Portfolio / ${new Date().getFullYear()}`} show={ready} delay={0.35} />
      <div className="bbar-items">
        <span className="meta rv-mask">
          <span className="rv-word" style={{ transform: ready ? 'none' : 'translateY(115%)', transition: 'transform 1s var(--ease-out) 450ms' }}>
            <b>Latest project</b> / <TLink className="uline" to={`/project/${latest.slug}`} style={{ fontWeight: 700 }}>{latest.name}</TLink>
          </span>
        </span>
        <Reveal as="p" className="meta" text={`Status / ${PROFILE.status}`} show={ready} delay={0.5} stagger={0.03} />
        <p className="meta rv-mask">
          <span className="rv-word" style={{ transform: ready ? 'none' : 'translateY(115%)', transition: 'transform 1s var(--ease-out) 600ms' }}>
            Local time / {time}
          </span>
        </p>
      </div>
      <div className="bbar-mobile meta">
        <span><b>Latest</b> / <TLink className="uline" to={`/project/${latest.slug}`}>{latest.name}</TLink></span>
        <span><span className="status-dot" />{time}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const motion = useRef(createMotion());
  const ready = useReady();
  const reduced = useReducedMotion();
  const { go } = useTransitionNav();
  const [showLoader] = useState(needsIntro);
  const [sceneReady, setSceneReady] = useState(!webglSupported);
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  useRingInput(motion, webglSupported, SECTIONS.length);

  useEffect(() => {
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    return () => { html.style.overflow = ''; html.style.overscrollBehavior = ''; };
  }, []);

  useEffect(() => {
    if (ready && sceneReady) {
      motion.current.introActive = true;
      if (reduced) motion.current.intro = 1.6;
    }
  }, [ready, sceneReady, reduced]);

  useEffect(() => { if (active !== 0) setTouched(true); }, [active]);

  const onReady = useCallback(() => setSceneReady(true), []);
  const onNavigate = useCallback((to) => go(to), [go]);
  const sections = useMemo(() => SECTIONS, []);

  return (
    <div className="home">
      <div className="home-canvas">
        {webglSupported ? (
            <Ring sections={sections} motion={motion} onSection={setActive} onReady={onReady} onNavigate={onNavigate} />
        ) : (
          <div className="home-fallback">
            {SECTIONS.map((s) => (
              <TLink key={s.id} to={s.to} className="display">{s.title}</TLink>
            ))}
          </div>
        )}
      </div>

      {webglSupported && (
        <nav className="home-index" aria-label="Sections" style={{ opacity: ready ? 1 : 0, transition: 'opacity 1s 700ms' }}>
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={i === active ? 'on' : ''}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => { scrollToSection(motion, i, SECTIONS.length); setTouched(true); }}
            >
              <i /><span>{pad2(i + 1)} {s.title}</span>
            </button>
          ))}
        </nav>
      )}

      {webglSupported && (
        <div className="home-hint" style={{ opacity: ready && !touched ? 1 : 0 }} aria-hidden="true">
          <span>Scroll</span><i /><span>Drag</span>
        </div>
      )}

      <BottomBar ready={ready} />

      <ul className="sr-only">
        {SECTIONS.map((s) => <li key={s.id}><TLink to={s.to}>{s.title}</TLink></li>)}
      </ul>

      {showLoader && <Loader done={sceneReady} onFinish={setReady} />}
    </div>
  );
}
