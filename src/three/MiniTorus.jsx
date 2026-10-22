import { Canvas } from '@react-three/fiber';
import { Torus } from './Torus.jsx';
import { TLink } from '../components/ui.jsx';
import { hasWebGL } from '../lib/hooks.js';

const supported = typeof window !== 'undefined' && hasWebGL();

/** Small spinning ring in the corner of content pages; links home. */
export default function MiniTorus() {
  if (!supported) return null;
  return (
    <TLink to="/" className="mini-torus" aria-label="Back to home">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3.4], fov: 45 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: 'none' }}>
        <Torus tube={0.12} />
      </Canvas>
    </TLink>
  );
}
