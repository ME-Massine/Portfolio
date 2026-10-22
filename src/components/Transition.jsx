import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { animate } from 'motion';
import { useReducedMotion } from '../lib/hooks.js';
import { scrollToTop } from '../lib/lenis.js';

const EASE = [0.76, 0, 0.24, 1];
const Ctx = createContext({ go: () => {}, busy: false });

export const useTransitionNav = () => useContext(Ctx);

function labelFor(to) {
  const path = to.split('?')[0];
  if (path === '/') return 'Home';
  if (path === '/projects') return 'My work';
  if (path === '/about') return 'About';
  if (path.startsWith('/project/')) return 'Case study';
  return 'Loading';
}

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/**
 * Covers the page with an olive panel, swaps the route underneath,
 * then lifts the panel away.
 */
export function TransitionProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();
  const panel = useRef(null);
  const busyRef = useRef(false);
  const [label, setLabel] = useState('');

  const go = useCallback(async (to) => {
    const here = location.pathname + location.search;
    if (busyRef.current || to === here) return;
    const el = panel.current;
    if (reduced || !el) {
      navigate(to);
      scrollToTop();
      return;
    }
    busyRef.current = true;
    setLabel(labelFor(to));
    await animate(el, { clipPath: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'] }, { duration: 0.75, ease: EASE });
    navigate(to);
    scrollToTop();
    await nextFrame();
    await animate(el, { clipPath: ['inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)'] }, { duration: 0.8, ease: EASE, delay: 0.12 });
    el.style.clipPath = 'inset(100% 0% 0% 0%)';
    busyRef.current = false;
  }, [location, navigate, reduced]);

  const value = useMemo(() => ({ go }), [go]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div ref={panel} className="ptrans" aria-hidden="true">
        <div className="ptrans-label meta">{label} <span style={{ opacity: 0.5 }}>/</span> Massine Amakhtari</div>
      </div>
    </Ctx.Provider>
  );
}
