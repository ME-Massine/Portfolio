import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PROJECTS, TAGS } from '../data/projects.js';
import { Footer } from '../components/Chrome.jsx';
import { ArchitectureDiagram, Cover, Ext, FadeIn, Reveal, TLink } from '../components/ui.jsx';
import NotFound from './NotFound.jsx';

const pad2 = (n) => String(n).padStart(2, '0');
const tagLabel = Object.fromEntries(TAGS.map((t) => [t.id, t.label]));

function Section({ n, title, children }) {
  return (
    <section className="sec">
      <div className="sec-head"><span className="label"><em>{pad2(n)}</em>{title}</span></div>
      <div>{children}</div>
    </section>
  );
}

export default function Project() {
  const { slug } = useParams();
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  const p = PROJECTS[index];

  useEffect(() => {
    if (p) document.title = `${p.name} — Massine Amakhtari`;
  }, [p]);

  if (!p) return <NotFound />;
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  const blocks = [
    p.overview?.length && ['Overview', <FadeIn className="prose" key="o">{p.overview.map((t, i) => <p key={i}>{t}</p>)}</FadeIn>],
    p.architecture?.nodes?.length && ['Architecture', <FadeIn key="a"><ArchitectureDiagram architecture={p.architecture} title={p.name} /></FadeIn>],
    p.approach?.length && ['Approach', <FadeIn className="prose" key="ap">{p.approach.map((t, i) => <p key={i}>{t}</p>)}</FadeIn>],
    p.decisions?.length && ['Key decisions', (
      <div className="decisions" key="d">
        {p.decisions.map((d, i) => (
          <FadeIn className="decision" key={d.title} delay={i * 0.05}>
            <span className="decision-n">{pad2(i + 1)}</span>
            <div><h3>{d.title}</h3><p>{d.body}</p></div>
          </FadeIn>
        ))}
      </div>
    )],
    p.highlights?.length && ['Highlights', (
      <FadeIn key="h"><ul className="hl-list">{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul></FadeIn>
    )],
    ['Stack', <FadeIn className="chips" key="s">{p.stack.map((s) => <span className="chip" key={s}>{s}</span>)}</FadeIn>],
    p.learnings?.length && ['What I learned', <FadeIn className="prose" key="l">{p.learnings.map((t, i) => <p key={i}>{t}</p>)}</FadeIn>],
  ].filter(Boolean);

  return (
    <article className="page">
      <header className="wrap page-head" style={{ paddingBottom: 'clamp(2rem, 4vw, 3.5rem)' }}>
        <Reveal as="p" className="label" text={`Project ${pad2(index + 1)} / ${p.tags.map((t) => tagLabel[t]).join(' · ')}`} />
        <Reveal as="h1" className="display proj-title" text={p.name} rotate={2.5} stagger={0.08} delay={0.1} style={{ marginTop: '1.5rem' }} />
        <FadeIn delay={0.3}>
          <dl className="proj-meta">
            <div><dt className="label">Role</dt><dd>{p.role}</dd></div>
            <div><dt className="label">Year</dt><dd>{p.year}</dd></div>
            <div><dt className="label">Status</dt><dd>{p.status}</dd></div>
            <div>
              <dt className="label">Links</dt>
              <dd>
                {p.links.length
                  ? p.links.map((l) => <Ext key={l.href} href={l.href} className="uline">{l.label} ↗</Ext>)
                  : <span style={{ color: 'var(--fg-60)' }}>Private repository</span>}
              </dd>
            </div>
          </dl>
        </FadeIn>
      </header>

      <div className="wrap">
        <FadeIn className="proj-cover" y={60} delay={0.4}>
          <Cover project={p} index={index} />
        </FadeIn>

        <FadeIn style={{ padding: 'clamp(3.5rem, 7vw, 7rem) 0', maxWidth: '62rem' }}>
          <p className="lede">{p.summary}</p>
        </FadeIn>

        {blocks.map(([title, body], i) => <Section key={title} n={i + 1} title={title}>{body}</Section>)}

        <TLink to={`/project/${next.slug}`} className="next">
          <p className="label" style={{ marginBottom: '1.25rem' }}>Next project / {pad2(((index + 1) % PROJECTS.length) + 1)}</p>
          <span className="display" style={{ display: 'block' }}>
            {next.name} <span className="next-arrow" aria-hidden="true">→</span>
          </span>
        </TLink>
      </div>
      <Footer />
    </article>
  );
}
