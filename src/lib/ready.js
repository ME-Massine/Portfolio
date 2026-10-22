import { useSyncExternalStore } from 'react';

// "Ready" flips once the intro loader has finished, so chrome can animate in.
const INTRO_KEY = 'ma-intro-seen';

function introSeen() {
  try { return sessionStorage.getItem(INTRO_KEY) === '1'; } catch { return false; }
}

export const needsIntro = () => window.location.pathname === '/' && !introSeen();

let ready = !needsIntro();
const listeners = new Set();

export function setReady() {
  if (ready) return;
  ready = true;
  try { sessionStorage.setItem(INTRO_KEY, '1'); } catch { /* private mode */ }
  listeners.forEach((l) => l());
}

export const useReady = () => useSyncExternalStore(
  (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
  () => ready,
);
