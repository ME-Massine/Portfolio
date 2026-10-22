import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { PROFILE } from '../data/profile.js';
import { useLocalTime, useReducedMotion } from '../lib/hooks.js';
import { setLenis, getLenis } from '../lib/lenis.js';
import { useReady } from '../lib/ready.js';
import { useContact } from './Contact.jsx';
import { Ext, Reveal, Roll, TLink } from './ui.jsx';
import MiniTorus from '../three/MiniTorus.jsx';

export const NAV = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'My work' },
  { to: '/about', label: 'About' },
];

const isActive = (pathname, to) => (to === '/' ? pathname === '/' : pathname.startsWith(to === '/projects' ? '/project' : to));

function MetaPair({ k, v, show, delay }) {
  return <Reveal as="p" className="meta" text={`${k} / ${v}`} show={show} delay={delay} stagger={0.035} />;
}

function Nav() {
  const { pathname } = useLocation();
  const ready = useReady();
  const contact = useContact();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return (
    <>
      <div className={`nav-veil ${scrolled && pathname !== '/' ? 'on' : ''}`} aria-hidden="true" />
      <nav className="nav" aria-label="Primary">
        <div className="nav-row">
          <div className="nav-item"><MetaPair k="Name" v={PROFILE.name} show={ready} delay={0.1} /></div>
          <div className="nav-item"><MetaPair k="Occupation" v={PROFILE.occupation} show={ready} delay={0.18} /></div>
          <div className="nav-item"><MetaPair k="Location" v={PROFILE.location} show={ready} delay={0.26} /></div>
          <div className="nav-links">
            {NAV.map((n, i) => (
              <span className="rv-mask" key={n.to}>
                <TLink
                  to={n.to}
                  className={`nav-link roll-host ${isActive(pathname, n.to) ? 'is-active' : ''}`}
                  aria-current={isActive(pathname, n.to) ? 'page' : undefined}
                  style={{ display: 'inline-block', transform: ready ? 'none' : 'translateY(115%)', transition: `transform 900ms var(--ease-out) ${320 + i * 60}ms` }}
                >
                  <Roll text={n.label.toUpperCase()} />
                </TLink>
              </span>
            ))}
            <span className="rv-mask">
              <button
                type="button"
                className="nav-link roll-host"
                aria-haspopup="dialog"
                aria-expanded={contact.isOpen}
                onClick={contact.open}
                style={{ display: 'inline-block', transform: ready ? 'none' : 'translateY(115%)', transition: `transform 900ms var(--ease-out) ${320 + NAV.length * 60}ms` }}
              >
                <Roll text="CONTACT" />
              </button>
            </span>
          </div>
        </div>
      </nav>
    </>
  );
}

function MobileNav() {
  const { pathname } = useLocation();
  const contact = useContact();
  const [open, setOpen] = useState(false);
  const time = useLocalTime();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop(); else lenis?.start();
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [open]);

  const items = [...NAV, { contact: true, label: 'Contact' }];

  return (
    <>
      <header className="mnav">
        <TLink to="/" className="mnav-brand">{PROFILE.name}</TLink>
        <button type="button" className="mnav-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
          <span className="mnav-icon" aria-hidden="true"><span /><span /></span>
          <span className="mnav-swap"><span><span>Menu</span><span>Close</span></span></span>
        </button>
      </header>
      <div id="mobile-menu" className={`mmenu ${open ? 'open' : ''}`} aria-hidden={!open} inert={!open ? true : undefined}>
        <div className="mmenu-head label"><span>Navigation</span><span>{PROFILE.location}</span></div>
        <nav aria-label="Mobile">
          {items.map((n, i) => {
            const active = !n.contact && isActive(pathname, n.to);
            const inner = (
              <>
                <span className="big">{n.label}</span>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
              </>
            );
            const style = { transitionDelay: open ? `${180 + i * 70}ms` : '0ms' };
            return n.contact ? (
              <button key="contact" type="button" className="mmenu-item" style={{ ...style, width: '100%', textAlign: 'left' }} onClick={() => { setOpen(false); contact.open(); }}>
                {inner}
              </button>
            ) : (
              <TLink key={n.to} to={n.to} className={`mmenu-item ${active ? 'is-active' : ''}`} style={style} onClick={() => setOpen(false)}>
                {inner}
              </TLink>
            );
          })}
        </nav>
        <div className="mmenu-foot meta">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {PROFILE.socials.map((s) => <Ext key={s.label} href={s.href} className="uline">{s.label}</Ext>)}
            <a className="uline" href={PROFILE.cv} download>CV ↓</a>
          </div>
          <span>Local time / {time}</span>
        </div>
      </div>
    </>
  );
}

export function Footer() {
  const contact = useContact();
  const time = useLocalTime();
  return (
    <footer className="footer">
      <div className="footer-in">
        <div className="footer-grid">
          <div>
            <Reveal as="p" className="label" text="Contact / Availability" />
            <Reveal as="h2" className="display footer-title" lines={['Let’s build', 'systems that last.']} rotate={2.5} stagger={0.1} style={{ marginTop: '1.5rem' }} />
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <p className="label">Navigation</p>
              <div className="footer-links">
                {NAV.map((n) => <TLink key={n.to} to={n.to} className="roll-host"><Roll text={n.label} /></TLink>)}
                <button type="button" className="roll-host" onClick={contact.open}><Roll text="Contact" /></button>
              </div>
            </div>
            <div className="footer-col">
              <p className="label">Socials</p>
              <div className="footer-links">
                {PROFILE.socials.map((s) => <Ext key={s.label} href={s.href} className="roll-host"><Roll text={s.label} /></Ext>)}
                <a href={PROFILE.cv} download className="roll-host"><Roll text="Resume" /></a>
              </div>
            </div>
          </div>
        </div>
        <div>
          <a className="footer-mail uline thick" href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
          <div className="footer-bottom meta" style={{ marginTop: '2.5rem' }}>
            <span>© {new Date().getFullYear()} {PROFILE.name}</span>
            <span><span className="status-dot" />{PROFILE.status}</span>
            <span>Local time / {time}</span>
            <button type="button" className="uline" onClick={() => (getLenis() ? getLenis().scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' }))}>Back to top ↑</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function useSmoothScroll(enabled) {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!enabled || reduced) return undefined;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)) });
    setLenis(lenis);
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => { cancelAnimationFrame(raf); lenis.destroy(); setLenis(null); };
  }, [enabled, reduced]);
}

export default function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  useSmoothScroll(!isHome);

  return (
    <>
      <a href="#main" className="sr-only">Skip to content</a>
      <Nav />
      <MobileNav />
      <main id="main">
        <Outlet />
      </main>
      {!isHome && <MiniTorus />}
      <div className="grain" aria-hidden="true" />
    </>
  );
}
