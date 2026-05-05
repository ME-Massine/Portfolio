import React from 'react';
import { Link } from 'react-router-dom';
import { Nav, Footer, Section, ProjectCard, StackCard, TimelineEntry, TerminalLabel } from './components.jsx';
import { IoTMini, PulseStreamMini, ERecruitmentMini, LearnovaMini, OrderFlowMini } from './mini-diagrams.jsx';
import { PROJECTS, STACK } from './data/projects.js';

const MINI_DIAGRAMS = {
  'iot-health':     IoTMini,
  'pulsestream':    PulseStreamMini,
  'e-recruitment':  ERecruitmentMini,
  'learnova':       LearnovaMini,
  'orderflow':      OrderFlowMini,
};

function Hero() {
  return (
    <header id="top" style={{ position: 'relative', paddingTop: 140, paddingBottom: 88 }}>
      <div className="hero-grid" />
      <div className="container-prose" style={{ position: 'relative' }}>
        <div style={{ marginBottom: 28 }}><TerminalLabel>whoami</TerminalLabel></div>
        <h1 className="display" style={{
          fontSize: 'clamp(44px, 6.4vw, 84px)',
          margin: '0 0 28px', maxWidth: 880,
        }}>
          I build reliable APIs,<br />
          event-driven systems,<br />
          &amp; cloud-native backends<span className="cursor" />
        </h1>
        <p style={{
          color: 'var(--fg-2)', fontSize: 'clamp(17px, 1.5vw, 19px)',
          lineHeight: 1.65, maxWidth: 660, margin: '0 0 36px',
        }}>
          I'm <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>Massine Amakhtari</strong>, a software
          engineering student based in Morocco. I work on backend systems — Java and Spring Boot, PostgreSQL,
          and message-driven architectures with Kafka and RabbitMQ.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="#projects" className="cmd primary" style={{ fontSize: 14, padding: '13px 22px' }}>
            <span>View case studies</span><span style={{ opacity: .5 }}>↓</span>
          </a>
          <a href="/Massine-Amakhtari-CV.pdf" download className="cmd" style={{ fontSize: 13, padding: '13px 20px' }}>
            <span className="prompt">$</span><span>resume.pdf</span>
          </a>
          <a href="https://github.com/ME-Massine" target="_blank" rel="noopener" className="cmd ghost" style={{ fontSize: 13, padding: '13px 20px' }}>
            <span className="prompt">$</span><span>github</span>
          </a>
        </div>
        <div style={{
          display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 48,
          paddingTop: 22, borderTop: '1px solid var(--border)',
          fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--fg-3)',
        }}>
          <span><span style={{ color: 'var(--accent)' }}>●</span>&nbsp; Open to internships &amp; junior roles · 2026</span>
          <span style={{ color: 'var(--fg-4)' }}>·</span>
          <span>Based in Morocco</span>
          <span style={{ color: 'var(--fg-4)' }}>·</span>
          <span>Remote-friendly</span>
        </div>
      </div>
    </header>
  );
}

function Projects() {
  return (
    <Section id="projects" num="01" kicker="Selected work" title="Projects."
      lede="Five backend-focused case studies covering real-time systems, event-driven architecture, microservices, and full-stack platforms. Each one links to a deeper write-up of the architecture I chose and why."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.slug}
            num={String(i + 1).padStart(2, '0')}
            name={p.name}
            summary={p.summary}
            highlights={p.highlights}
            stack={p.stack}
            to={`/projects/${p.slug}`}
            MiniDiagram={MINI_DIAGRAMS[p.slug]}
          />
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <a href="https://github.com/ME-Massine" target="_blank" rel="noopener" className="cmd ghost" style={{ fontSize: 13 }}>
          <span className="prompt">$</span><span>see more on github</span><span style={{ opacity: .5 }}>↗</span>
        </a>
      </div>
    </Section>
  );
}

function Stack() {
  return (
    <Section id="stack" num="02" kicker="What I work with" title="Stack."
      lede="The tools and concepts I reach for, grouped by layer. I pick what's right for the problem rather than chasing the newest thing."
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 14,
      }}>
        {STACK.map(s => <StackCard key={s.layer} layer={s.layer} blurb={s.blurb} items={s.items} />)}
      </div>
    </Section>
  );
}

function About() {
  return (
    <Section id="about" num="03" kicker="A bit about me" title="About.">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 220px)',
        gap: 48, alignItems: 'start',
      }} className="about-grid">
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 18,
          color: 'var(--fg-2)', fontSize: 'clamp(16px, 1.4vw, 18px)', lineHeight: 1.7,
        }}>
          <p style={{ margin: 0 }}>
            I got pulled toward the backend the first time I had to figure out how a simple CRUD app actually behaves under concurrent requests. Since then, the parts I care about most are the ones users never see: how data moves between services, how systems stay consistent under failure, and how to keep things observable when something goes wrong.
          </p>
          <p style={{ margin: 0 }}>
            Most of my recent work is in Java with Spring Boot, but I treat the language as a tool. What I focus on is designing clean module boundaries, picking the right messaging pattern for the problem, and writing code that is straightforward to test and operate.
          </p>
          <p style={{ margin: 0 }}>
            Outside of class projects I read engineering blogs, build small things to try ideas in practice, and contribute on GitHub when I can. I'm looking for a team where I can keep learning from people who have shipped serious systems — and contribute thoughtfully while I do.
          </p>
        </div>

        <aside style={{
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 22px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {[
            ['location', 'Morocco · GMT+1'],
            ['availability', 'Open · 2026'],
            ['focus', 'Backend & distributed systems'],
            ['languages', 'English · French · Arabic'],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="kicker" style={{ marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 14, color: 'var(--fg)' }}>{value}</div>
            </div>
          ))}
        </aside>

        <style>{`
          @media (max-width: 760px) {
            .about-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          }
        `}</style>
      </div>
    </Section>
  );
}

function Experience() {
  return (
    <Section id="experience" num="04" kicker="Where I've been" title="Experience.">
      <TimelineEntry year="2025 — present" title="Independent backend projects" place="self-directed"
        desc="Building backend systems end-to-end: APIs, event pipelines, observability, and deployment. The five case studies linked above are open-sourced on GitHub." />
      <TimelineEntry year="2024" title="Open-source contributions & coursework" place="GitHub · university"
        desc="Smaller pull requests to ecosystem libraries, plus team coursework focused on distributed systems and software architecture." />
      <TimelineEntry year="2023" title="Started software engineering studies" place="Morocco"
        desc="First serious exposure to data structures, OS internals, and databases — and the moment backend clicked." />
      <style>{`
        @media (max-width: 600px) {
          .timeline-entry { grid-template-columns: 1fr !important; gap: 8px !important; }
        }
      `}</style>
    </Section>
  );
}

function Education() {
  return (
    <Section id="education" num="05" kicker="Education" title="Education.">
      <TimelineEntry year="2023 — 2026" title="B.Sc. in Software Engineering" place="Morocco"
        desc="Coursework: distributed systems, databases, software architecture, networks, and algorithms." />
      <TimelineEntry year="ongoing" title="Self-directed learning" place="papers · books · talks"
        desc="Designing Data-Intensive Applications · Confluent's Kafka materials · Spring docs · Strange Loop talks." />
    </Section>
  );
}

function GitHubSection() {
  return (
    <Section id="github" num="06" kicker="Open source" title="GitHub.">
      <p style={{ color: 'var(--fg-2)', fontSize: 'clamp(16px, 1.4vw, 18px)', lineHeight: 1.65, maxWidth: 680, margin: '0 0 28px' }}>
        Most of my work is public. I push small commits often — case-study projects, learning spikes, and the occasional pull request to libraries I use.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        <a href="https://github.com/ME-Massine" target="_blank" rel="noopener" className="project-card" style={{ padding: 22 }}>
          <div className="kicker accent" style={{ marginBottom: 10 }}>profile</div>
          <div className="mono" style={{ fontSize: 15, color: 'var(--fg)', marginBottom: 4 }}>@ME-Massine</div>
          <div style={{ color: 'var(--fg-3)', fontSize: 13 }}>repositories, commits, contributions</div>
        </a>
        <a href="https://github.com/ME-Massine?tab=repositories" target="_blank" rel="noopener" className="project-card" style={{ padding: 22 }}>
          <div className="kicker accent" style={{ marginBottom: 10 }}>browse</div>
          <div className="mono" style={{ fontSize: 15, color: 'var(--fg)', marginBottom: 4 }}>repositories →</div>
          <div style={{ color: 'var(--fg-3)', fontSize: 13 }}>every project linked here, in source</div>
        </a>
        <a href="https://github.com/ME-Massine?tab=stars" target="_blank" rel="noopener" className="project-card" style={{ padding: 22 }}>
          <div className="kicker accent" style={{ marginBottom: 10 }}>reading list</div>
          <div className="mono" style={{ fontSize: 15, color: 'var(--fg)', marginBottom: 4 }}>stars →</div>
          <div style={{ color: 'var(--fg-3)', fontSize: 13 }}>libraries and references I keep coming back to</div>
        </a>
      </div>
    </Section>
  );
}

function Contact() {
  const [sent, setSent] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', message: '' });

  const onSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio inquiry from ${form.name || 'someone'}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name}\n${form.email}`);
    window.location.href = `mailto:massine000@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <Section id="contact" num="07" kicker="Get in touch" title="Contact.">
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 280px)',
        gap: 48, alignItems: 'start',
      }} className="contact-grid">
        <div>
          <p style={{ color: 'var(--fg-2)', fontSize: 'clamp(16px, 1.4vw, 18px)', lineHeight: 1.65, margin: '0 0 28px' }}>
            Email is the best way to reach me. I read every message, including cold ones, and usually reply within a day.
          </p>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="contact-row">
              <input className="input" required placeholder="Your name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="input" required type="email" placeholder="you@company.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <textarea className="input" required placeholder="What's up?" rows={5} value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })} style={{ resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="submit" className="cmd primary" style={{ fontSize: 14, padding: '13px 22px' }}>
                <span>{sent ? 'Mail client opened ✓' : 'Send message'}</span><span style={{ opacity: .5 }}>→</span>
              </button>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-3)' }}>opens in your mail client</span>
            </div>
          </form>
        </div>

        <aside style={{
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '22px 22px',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div>
            <div className="kicker accent" style={{ marginBottom: 8 }}>direct</div>
            <a href="mailto:massine000@gmail.com" className="mono"
              style={{ fontSize: 14, color: 'var(--fg)', wordBreak: 'break-all' }}>massine000@gmail.com</a>
          </div>
          <div className="rule" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href="https://github.com/ME-Massine" target="_blank" rel="noopener" className="mono"
              style={{ fontSize: 13, color: 'var(--fg-2)' }}>↗ github / ME-Massine</a>
            <a href="https://www.linkedin.com/in/massine-amakhtari-48b815261" target="_blank" rel="noopener" className="mono"
              style={{ fontSize: 13, color: 'var(--fg-2)' }}>↗ linkedin</a>
            <a href="/Massine-Amakhtari-CV.pdf" download className="mono"
              style={{ fontSize: 13, color: 'var(--fg-2)' }}>↓ resume.pdf</a>
          </div>
        </aside>

        <style>{`
          @media (max-width: 820px) {
            .contact-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          }
          @media (max-width: 520px) {
            .contact-row { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </Section>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <div className="container-prose"><div className="rule" /></div>
        <Projects />
        <div className="container-prose"><div className="rule" /></div>
        <Stack />
        <div className="container-prose"><div className="rule" /></div>
        <About />
        <div className="container-prose"><div className="rule" /></div>
        <Experience />
        <div className="container-prose"><div className="rule" /></div>
        <Education />
        <div className="container-prose"><div className="rule" /></div>
        <GitHubSection />
        <div className="container-prose"><div className="rule" /></div>
        <Contact />
      </main>
      <Footer />
    </>
  );
}
