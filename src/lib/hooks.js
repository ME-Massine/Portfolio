import { useEffect, useState, useSyncExternalStore } from 'react';
import { PROFILE } from '../data/profile.js';

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit', minute: '2-digit', hour12: false, timeZone: PROFILE.timeZone,
});

function zoneOffset(date) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: PROFILE.timeZone, timeZoneName: 'shortOffset' }).formatToParts(date);
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

/** "HH:MM GMT+1" in Rabat, ticking every 10 s. Returns "--:--" until mounted. */
export function useLocalTime() {
  const [time, setTime] = useState('--:--');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(`${timeFormatter.format(now)} ${zoneOffset(now)}`.trim());
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function subscribeMedia(query) {
  return (cb) => {
    const mq = window.matchMedia(query);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  };
}

export function useMediaQuery(query) {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');

let fontsPromise;
/** Resolves once the Satoshi weights used by canvas drawing are available. */
export function fontsReady() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      document.fonts.load('900 64px Satoshi'),
      document.fonts.load('700 24px Satoshi'),
      document.fonts.load('500 24px Satoshi'),
    ]).catch(() => {});
  }
  return fontsPromise;
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!c.getContext('webgl');
  } catch {
    return false;
  }
}
