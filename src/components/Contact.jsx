import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { animate } from 'motion';
import { PROFILE } from '../data/profile.js';
import { useLocalTime, useReducedMotion } from '../lib/hooks.js';
import { getLenis } from '../lib/lenis.js';
import { Ext, Reveal, Roll } from './ui.jsx';

const EASE = [0.76, 0, 0.24, 1];
const Ctx = createContext({ open: () => {}, close: () => {}, isOpen: false });
export const useContact = () => useContext(Ctx);

export function ContactProvider({ children }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <ContactOverlay isOpen={isOpen} onClose={close} />
    </Ctx.Provider>
  );
}

function ContactOverlay({ isOpen, onClose }) {
  const ref = useRef(null);
  const closeBtn = useRef(null);
  const reduced = useReducedMotion();
  const time = useLocalTime();
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const lenis = getLenis();
    if (isOpen) {
      setShown(true);
      lenis?.stop();
      el.style.visibility = 'visible';
      const a = animate(el, { clipPath: ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'] }, { duration: reduced ? 0 : 0.85, ease: EASE });
      a.then(() => closeBtn.current?.focus());
      const onKey = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
    if (el.style.visibility === 'visible') {
      lenis?.start();
      animate(el, { clipPath: ['inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)'] }, { duration: reduced ? 0 : 0.75, ease: EASE })
        .then(() => { el.style.visibility = 'hidden'; setShown(false); });
    }
    return undefined;
  }, [isOpen, onClose, reduced]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div ref={ref} className="contact" role="dialog" aria-modal="true" aria-label="Contact" aria-hidden={!isOpen} inert={!isOpen ? true : undefined}>
      <button ref={closeBtn} type="button" className="contact-close roll-host" onClick={onClose}>
        <Roll text="Close" />
      </button>
      <div className="contact-grid">
        <div>
          <p className="label" style={{ marginBottom: '1.5rem' }}>Contact / Availability</p>
          <Reveal as="h2" className="display contact-title" lines={['Let’s build', 'something', 'reliable.']} show={shown} rotate={2.5} delay={0.25} stagger={0.08} />
          <a className="contact-mail uline thick" href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
          <div className="contact-actions meta">
            <button type="button" className="uline" onClick={copy}>{copied ? 'Copied ✓' : 'Copy email'}</button>
            <a className="uline" href={PROFILE.cv} download>Download CV ↓</a>
          </div>
        </div>
        <div className="contact-side">
          <div>
            <p className="label" style={{ marginBottom: '0.75rem' }}>Socials</p>
            <div className="footer-links">
              {PROFILE.socials.map((s) => (
                <Ext key={s.label} href={s.href} className="roll-host"><Roll text={s.label} /></Ext>
              ))}
              <a href={`mailto:${PROFILE.email}`} className="roll-host"><Roll text="Email" /></a>
            </div>
          </div>
          <div>
            <p className="label" style={{ marginBottom: '0.75rem' }}>Status</p>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.4, maxWidth: '28ch' }}>
              <span className="status-dot" />{PROFILE.statusLong}.
            </p>
          </div>
        </div>
      </div>
      <div className="contact-foot meta">
        <span>{PROFILE.location}</span>
        <span>Local time / {time}</span>
      </div>
    </div>
  );
}
