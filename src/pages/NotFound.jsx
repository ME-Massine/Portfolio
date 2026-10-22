import { Reveal, TLink } from '../components/ui.jsx';

export default function NotFound() {
  return (
    <div className="nf">
      <p className="label">Error / Page not found</p>
      <Reveal as="h1" className="display" text="404" rotate={2.5} />
      <p className="lede" style={{ maxWidth: '32rem' }}>This route didn’t make it through the pipeline. Probably sitting in a dead-letter queue.</p>
      <div className="meta" style={{ display: 'flex', gap: '1.5rem' }}>
        <TLink to="/" className="uline">Back home →</TLink>
        <TLink to="/projects" className="uline">See my work →</TLink>
      </div>
    </div>
  );
}
