import { useEffect } from 'react';
import { PROFILE } from '../data/profile.js';
import { Footer } from '../components/Chrome.jsx';
import { useContact } from '../components/Contact.jsx';
import { FadeIn, Reveal } from '../components/ui.jsx';

const pad2 = (n) => String(n).padStart(2, '0');

function Section({ n, title, children }) {
  return (
    <section className="sec">
      <div className="sec-head"><span className="label"><em>{pad2(n)}</em>{title}</span></div>
      <div>{children}</div>
    </section>
  );
}

function Timeline({ rows }) {
  return (
    <div className="tl">
      {rows.map((r) => (
        <FadeIn className="tl-row" key={r.title}>
          <span className="meta" style={{ color: 'var(--fg-60)' }}>{r.period}</span>
          <div>
            <h3>{r.title}</h3>
            <p className="where">{r.place}</p>
            {r.desc && <p>{r.desc}</p>}
          </div>
        </FadeIn>
      ))}
    </div>
  );
}

export default function About() {
  const contact = useContact();
  useEffect(() => { document.title = 'About — Massine Amakhtari'; }, []);

  return (
    <div className="page">
      <header className="wrap page-head">
        <Reveal as="p" className="label" text={`About / ${PROFILE.location}`} />
        <div className="about-hero" style={{ marginTop: '1.5rem' }}>
          <Reveal as="h1" className="display page-title" lines={['Massine', 'Amakhtari']} rotate={2.5} stagger={0.1} delay={0.1} style={{ fontSize: 'clamp(3rem, 8.4vw, 9.5rem)' }} />
          <FadeIn className="about-photo" delay={0.3} y={50}>
            <img src={PROFILE.portrait} alt="Portrait of Massine Amakhtari" width="460" height="460" />
          </FadeIn>
        </div>
        <FadeIn delay={0.35} style={{ marginTop: 'clamp(2.5rem, 5vw, 4.5rem)', maxWidth: '62rem' }}>
          <p className="lede">{PROFILE.intro}</p>
          <div className="meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '2rem' }}>
            <a className="uline" href={PROFILE.cv} download>Download CV ↓</a>
            <button type="button" className="uline" onClick={contact.open}>Get in touch →</button>
            <span style={{ color: 'var(--fg-60)' }}><span className="status-dot" />{PROFILE.status}</span>
          </div>
        </FadeIn>
      </header>

      <div className="wrap" style={{ paddingBottom: 'clamp(4rem, 8vw, 8rem)' }}>
        <Section n={1} title="How I work">
          <FadeIn className="prose">{PROFILE.about.map((t, i) => <p key={i}>{t}</p>)}</FadeIn>
        </Section>
        <Section n={2} title="Experience"><Timeline rows={PROFILE.experience} /></Section>
        <Section n={3} title="Education"><Timeline rows={PROFILE.education} /></Section>
        <Section n={4} title="Certifications"><Timeline rows={PROFILE.certifications} /></Section>
        <Section n={5} title="Stack">
          <FadeIn className="skills">
            {PROFILE.skills.map((g) => (
              <div key={g.group}>
                <h4 className="label">{g.group}</h4>
                <ul>{g.items.map((it) => <li key={it}>{it}</li>)}</ul>
              </div>
            ))}
          </FadeIn>
        </Section>
        <Section n={6} title="Languages">
          <FadeIn className="skills">
            <ul>{PROFILE.languages.map((l) => <li key={l}>{l}</li>)}</ul>
          </FadeIn>
        </Section>
      </div>
      <Footer />
    </div>
  );
}
