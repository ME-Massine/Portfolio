import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ── Theme management ──────────────────────────────────────────────────────
const THEME_KEY = 'theme';

function readStoredTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
}

function resolveInitialTheme() {
  const stored = readStoredTheme();
  if (stored === 'light' || stored === 'dark') return stored;
  return 'light';
}

function applyThemeAttr(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setTheme] = React.useState(() => {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.getAttribute('data-theme') || resolveInitialTheme();
  });

  React.useEffect(() => {
    applyThemeAttr(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  return [theme, setTheme];
}

// ── Icons ─────────────────────────────────────────────────────────────────
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

// ── ThemeToggle ───────────────────────────────────────────────────────────
export const ThemeToggle = ({ theme, setTheme }) => (
  <button
    type="button"
    className="theme-toggle"
    aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
  >
    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
  </button>
);

// ── Nav ───────────────────────────────────────────────────────────────────
export const Nav = ({ isDetail = false }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [theme, setTheme] = useTheme();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    ['projects', 'Projects'],
    ['stack', 'Stack'],
    ['about', 'About'],
    ['experience', 'Experience'],
    ['contact', 'Contact'],
  ];

  const navHref = (id) => isDetail ? `/#${id}` : `#${id}`;

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50"
      style={{
        background: scrolled
          ? 'color-mix(in srgb, var(--bg) 86%, transparent)'
          : 'color-mix(in srgb, var(--bg) 60%, transparent)',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        borderBottom: scrolled ? '1px solid var(--border-strong)' : '1px solid var(--border)',
        transition: 'background .2s, border-color .2s',
      }}
    >
      <div className="container-wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 28, height: 28, borderRadius: 7, background: 'var(--fg)', color: 'var(--bg)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
          }}>M</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--fg)' }}>massine.dev</span>
        </Link>

        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 30 }}>
          {links.map(([id, label]) => (
            <a key={id} href={navHref(id)}
              style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--fg-2)', letterSpacing: '.02em' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-2)'}
            >{label}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <a href="/Massine-Amakhtari-CV.pdf" download className="cmd primary hidden md:inline-flex"
            style={{ padding: '9px 16px', fontSize: 13 }}>
            <span>Resume</span><span style={{ opacity: .5 }}>↓</span>
          </a>
          <button className="md:hidden" aria-label="Menu"
            onClick={() => setOpen(o => !o)}
            style={{
              background: 'transparent', border: '1px solid var(--border-strong)',
              borderRadius: 8, padding: '8px 10px', color: 'var(--fg)', cursor: 'pointer',
              fontFamily: 'var(--mono)', fontSize: 12,
            }}>
            {open ? 'close' : 'menu'}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden" style={{
          borderTop: '1px solid var(--border)',
          background: 'color-mix(in srgb, var(--bg) 96%, transparent)',
          padding: '16px 22px 22px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {links.map(([id, label]) => (
              <a key={id} href={navHref(id)} onClick={() => setOpen(false)}
                style={{
                  fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--fg)',
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                }}>{label}</a>
            ))}
            <a href="/Massine-Amakhtari-CV.pdf" download className="cmd primary"
              style={{ marginTop: 14, justifyContent: 'center', fontSize: 13 }}>
              <span>Resume</span><span style={{ opacity: .5 }}>↓</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

// ── Footer ────────────────────────────────────────────────────────────────
export const Footer = () => (
  <footer style={{ borderTop: '1px solid var(--border)', padding: '56px 0 48px', marginTop: 48 }}>
    <div className="container-wide" style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div style={{ minWidth: 0 }}>
        <div className="display" style={{ fontSize: 'clamp(36px, 5vw, 52px)', marginBottom: 10 }}>Let's talk.</div>
        <div style={{ color: 'var(--fg-2)', fontSize: 16, maxWidth: 460, lineHeight: 1.6 }}>
          Open to backend internships and junior roles starting in 2026. Remote-friendly.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
          <a href="mailto:massine000@gmail.com" className="pill accent">massine000@gmail.com</a>
          <a href="https://github.com/ME-Massine" target="_blank" rel="noopener" className="pill">github</a>
          <a href="https://www.linkedin.com/in/massine-amakhtari-48b815261" target="_blank" rel="noopener" className="pill">linkedin</a>
        </div>
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-3)', textAlign: 'right' }}>
        <div>© 2026 Massine Amakhtari</div>
        <div style={{ marginTop: 4 }}>Built with React · Tailwind · Vercel</div>
      </div>
    </div>
  </footer>
);

// ── Section ───────────────────────────────────────────────────────────────
export const Section = ({ id, num, kicker, title, lede, children, container = 'prose' }) => (
  <section id={id} className="section" style={{ scrollMarginTop: 88 }}>
    <div className={container === 'wide' ? 'container-wide' : 'container-prose'}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
        {num && <span className="kicker accent">{num}</span>}
        <span className="kicker" style={{ color: 'var(--fg-4)' }}>/</span>
        <span className="kicker">{kicker}</span>
      </div>
      {title && (
        <h2 className="display" style={{ fontSize: 'clamp(36px, 4.6vw, 56px)', margin: '0 0 20px', maxWidth: 780 }}>
          {title}
        </h2>
      )}
      {lede && (
        <p style={{
          color: 'var(--fg-2)', fontSize: 'clamp(16px, 1.4vw, 18px)',
          lineHeight: 1.65, maxWidth: 680, margin: '0 0 40px',
        }}>{lede}</p>
      )}
      {children}
    </div>
  </section>
);

// ── ProjectCard ───────────────────────────────────────────────────────────
export const ProjectCard = ({ num, name, summary, highlights, stack, to, MiniDiagram }) => (
  <Link to={to} className="project-card" aria-label={`${name} — case study`}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
      <span className="kicker accent">{num}</span>
      <span className="kicker" style={{ color: 'var(--fg-4)' }}>/</span>
      <span className="kicker">case study</span>
    </div>

    <div style={{
      display: 'grid',
      gridTemplateColumns: MiniDiagram ? 'minmax(0, 1fr) 300px' : '1fr',
      gap: 28, alignItems: 'start',
    }} className="project-card-grid">
      <div style={{ minWidth: 0 }}>
        <h3 className="display" style={{
          fontSize: 'clamp(26px, 2.8vw, 34px)', margin: '0 0 12px',
          fontStyle: 'italic', lineHeight: 1.18,
        }}>{name}</h3>

        <p style={{
          color: 'var(--fg-2)', fontSize: 'clamp(15px, 1.2vw, 16px)',
          lineHeight: 1.6, margin: '0 0 18px', maxWidth: 640,
        }}>{summary}</p>

        {highlights && highlights.length > 0 && (
          <ul style={{
            listStyle: 'none', padding: 0, margin: '0 0 20px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {highlights.map((h, i) => (
              <li key={i} style={{
                display: 'grid', gridTemplateColumns: '14px 1fr', gap: 10, alignItems: 'baseline',
                fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.55,
              }}>
                <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: 11 }}>→</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
          {stack.map(s => <span key={s} className="pill" style={{ fontSize: 11, padding: '3px 10px' }}>{s}</span>)}
        </div>

        <div className="read-more mono" style={{ fontSize: 13, fontWeight: 500 }}>
          Read case study →
        </div>
      </div>

      {MiniDiagram && (
        <div className="mini-diagram" style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
          <div className="kicker" style={{ marginBottom: 10, fontSize: 10 }}>architecture</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <MiniDiagram />
          </div>
        </div>
      )}
    </div>
  </Link>
);

// ── StackCard ─────────────────────────────────────────────────────────────
export const StackCard = ({ layer, blurb, items }) => (
  <div className="stack-card">
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
      <span className="kicker accent">{layer}</span>
    </div>
    {blurb && (
      <div style={{ color: 'var(--fg-3)', fontSize: 13, lineHeight: 1.55, marginBottom: 14 }}>{blurb}</div>
    )}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map(i => <span key={i} className="pill">{i}</span>)}
    </div>
  </div>
);

// ── TimelineEntry ─────────────────────────────────────────────────────────
export const TimelineEntry = ({ year, title, place, desc }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: 'minmax(140px, 160px) 1fr', gap: 32, padding: '24px 0',
    borderTop: '1px solid var(--border)', alignItems: 'baseline',
  }} className="timeline-entry">
    <span className="kicker" style={{ color: 'var(--fg-2)' }}>{year}</span>
    <div style={{ minWidth: 0 }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontWeight: 500, fontSize: 'clamp(15px, 1.3vw, 17px)', color: 'var(--fg)' }}>{title}</span>
        {place && <span style={{ color: 'var(--fg-3)', fontSize: 14 }}> · {place}</span>}
      </div>
      {desc && <div style={{ color: 'var(--fg-2)', fontSize: 'clamp(14px, 1.2vw, 15px)', lineHeight: 1.6 }}>{desc}</div>}
    </div>
  </div>
);

// ── TerminalLabel ─────────────────────────────────────────────────────────
export const TerminalLabel = ({ children, prompt = '$' }) => (
  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--fg-3)' }}>
    <span style={{ color: 'var(--accent)', marginRight: 8 }}>{prompt}</span>
    {children}
  </span>
);

// ── CaseBlock (used in detail pages) ─────────────────────────────────────
export const CaseBlock = ({ kicker, body }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
      <span className="kicker">{kicker}</span>
    </div>
    <div style={{ color: 'var(--fg-2)', fontSize: 17, lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.isArray(body)
        ? body.map((p, i) => <p key={i} style={{ margin: 0 }}>{p}</p>)
        : <p style={{ margin: 0 }}>{body}</p>}
    </div>
  </div>
);

// ── LegendDot (used in detail pages) ─────────────────────────────────────
export const LegendDot = ({ color, label }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
    <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
    <span>{label}</span>
  </span>
);

// ── ProjectDetail (shared shell for detail pages) ─────────────────────────
export const ProjectDetail = ({
  slug, name, oneliner, role, year, status,
  stack, links, diagram: Diagram,
  problem, approach, decisions, learnings,
  next,
}) => (
  <>
    <Nav isDetail={true} />
    <main style={{ paddingTop: 120 }}>

      {/* Header */}
      <div className="container-prose">
        <Link to="/#projects" className="kicker" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
          ← back to projects
        </Link>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <span className="kicker">case study</span>
          <span className="kicker" style={{ color: 'var(--fg-2)' }}>—</span>
          <span className="kicker">{year} · {status}</span>
        </div>

        <h1 className="display" style={{ fontSize: 'clamp(48px, 6vw, 80px)', margin: '0 0 20px' }}>{name}</h1>
        <p style={{ color: 'var(--fg-2)', fontSize: 18, lineHeight: 1.6, maxWidth: 680, margin: '0 0 28px' }}>{oneliner}</p>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {stack.map(s => <span key={s} className="pill">{s}</span>)}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 48 }}>
          {links.map(l => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener" className="cmd" style={{ fontSize: 12 }}>
              <span className="prompt">$</span><span>{l.label}</span><span style={{ opacity: .5 }}>↗</span>
            </a>
          ))}
        </div>

        {/* Meta strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 0,
          border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          marginBottom: 48,
        }}>
          {[['Role', role], ['Year', year], ['Status', status]].map(([k, v], i, arr) => (
            <div key={k} style={{
              padding: '16px 20px',
              borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div className="kicker" style={{ marginBottom: 4 }}>{k}</div>
              <div style={{ fontSize: 14, color: 'var(--fg)' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagram */}
      <div className="container-prose" style={{ marginBottom: 64 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
          <span className="kicker">Architecture</span>
          <span className="kicker" style={{ color: 'var(--fg-2)' }}>—</span>
          <span className="kicker">how the pieces fit</span>
        </div>
        <Diagram />
        <div style={{ marginTop: 12, display: 'flex', gap: 18, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', flexWrap: 'wrap' }}>
          <LegendDot color="rgba(245,158,11,0.5)" label="event source" />
          <LegendDot color="var(--border-strong)" label="service" />
          <LegendDot color="var(--accent)" label="key flow" />
          <LegendDot color="rgba(167,139,250,0.5)" label="datastore" />
        </div>
      </div>

      {/* Problem + Approach */}
      <div className="container-prose" style={{ marginBottom: 64 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 48 }}>
          <CaseBlock kicker="Problem" body={problem} />
          <CaseBlock kicker="Approach" body={approach} />
        </div>
      </div>

      {/* Key decisions */}
      <div className="container-prose" style={{ marginBottom: 64 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 24 }}>
          <span className="kicker">Key decisions</span>
          <span className="kicker" style={{ color: 'var(--fg-2)' }}>—</span>
          <span className="kicker">trade-offs I made &amp; why</span>
        </div>
        <div>
          {decisions.map((d, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '56px 1fr', gap: 24,
              padding: '24px 0', borderTop: '1px solid var(--border)', alignItems: 'baseline',
            }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <div style={{ fontSize: 17, color: 'var(--fg)', marginBottom: 8, fontWeight: 500 }}>{d.title}</div>
                <div style={{ fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.6 }}>{d.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screenshots placeholder */}
      <div className="container-prose" style={{ marginBottom: 64 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
          <span className="kicker">Snapshots</span>
          <span className="kicker" style={{ color: 'var(--fg-2)' }}>—</span>
          <span className="kicker">interface &amp; metrics</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {[
            { label: 'admin dashboard', sub: 'screenshot · WIP' },
            { label: 'metrics panel', sub: 'grafana · WIP' },
          ].map(p => (
            <div key={p.label} style={{
              aspectRatio: '16/10',
              background: 'repeating-linear-gradient(135deg, var(--bg-2) 0 12px, var(--bg-3) 12px 13px)',
              border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{p.label}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>{p.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Learnings */}
      <div className="container-prose" style={{ marginBottom: 64 }}>
        <CaseBlock kicker="What I learned" body={learnings} />
      </div>

      {/* Next project */}
      {next && (
        <div className="container-prose" style={{ marginBottom: 48 }}>
          <Link to={`/projects/${next.slug}`} className="card" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '24px 28px',
          }}>
            <div>
              <div className="kicker" style={{ marginBottom: 6 }}>next case study →</div>
              <div className="display" style={{ fontSize: 28 }}>{next.name}</div>
            </div>
            <span className="mono" style={{ fontSize: 13, color: 'var(--accent)' }}>read →</span>
          </Link>
        </div>
      )}

    </main>
    <Footer />
  </>
);
