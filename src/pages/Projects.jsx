import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PROJECTS, TAGS } from '../data/projects.js';
import { Footer } from '../components/Chrome.jsx';
import { Cover, FadeIn, Reveal, TLink } from '../components/ui.jsx';

const pad2 = (n) => String(n).padStart(2, '0');
const tagLabel = Object.fromEntries(TAGS.map((t) => [t.id, t.label]));

export function ProjectCard({ project, index, delay = 0 }) {
  return (
    <FadeIn delay={delay}>
      <TLink to={`/project/${project.slug}`} className="pcard" aria-label={`${project.name} — ${project.kicker}`}>
        <div className="pcard-media">
          <Cover project={project} index={index} />
          <span className="pcard-chip" aria-hidden="true">View case study →</span>
        </div>
        <div className="pcard-row">
          <h3 className="pcard-name">{project.name}</h3>
          <span className="pcard-idx">{pad2(index + 1)}</span>
        </div>
        <div className="pcard-sub meta">
          <span>{project.tags.map((t) => tagLabel[t]).join(' · ')}</span>
          <span>{project.year}</span>
        </div>
        <p className="pcard-summary">{project.summary}</p>
      </TLink>
    </FadeIn>
  );
}

export default function Projects() {
  const [params, setParams] = useSearchParams();
  const tag = TAGS.some((t) => t.id === params.get('tag')) ? params.get('tag') : 'all';
  const list = PROJECTS
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => tag === 'all' || p.tags.includes(tag));

  useEffect(() => { document.title = 'My work — Massine Amakhtari'; }, []);

  const filters = [{ id: 'all', label: 'All', count: PROJECTS.length }, ...TAGS.map((t) => ({ ...t, count: PROJECTS.filter((p) => p.tags.includes(t.id)).length }))];

  return (
    <div className="page">
      <header className="wrap page-head">
        <Reveal as="p" className="label" text={`My work / (${pad2(PROJECTS.length)}) projects`} />
        <Reveal as="h1" className="display page-title" lines={['Selected', 'work']} rotate={2.5} stagger={0.1} delay={0.1} />
        <FadeIn delay={0.35} style={{ marginTop: 'clamp(2rem, 4vw, 3.5rem)', maxWidth: '46rem' }}>
          <p className="lede">
            Backend-first projects — event streaming, messaging reliability, real-time platforms — plus the full-stack, cloud and mobile work around them.
          </p>
        </FadeIn>
      </header>

      <div className="wrap">
        <nav className="filters" aria-label="Filter projects">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filter ${tag === f.id ? 'on' : ''}`}
              aria-pressed={tag === f.id}
              onClick={() => setParams(f.id === 'all' ? {} : { tag: f.id }, { replace: true, preventScrollReset: true })}
            >
              {f.label}<sup>({pad2(f.count)})</sup>
            </button>
          ))}
        </nav>

        <div className="pgrid" key={tag}>
          {list.map(({ p, i }, n) => <ProjectCard key={p.slug} project={p} index={i} delay={(n % 2) * 0.08} />)}
        </div>
      </div>
      <Footer />
    </div>
  );
}
