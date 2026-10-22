import { useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { drawCover } from '../lib/cover.js';
import { fontsReady, useReducedMotion } from '../lib/hooks.js';
import { useTransitionNav } from './Transition.jsx';

const EASE_OUT = [0.16, 1, 0.3, 1];

/**
 * Word-by-word mask reveal (each word slides up from 115% with a slight tilt).
 * Pass `lines` for multi-line display type; each line gets its own block mask.
 */
export function Reveal({
  text, lines, as: Tag = 'span', className, style,
  delay = 0, stagger = 0.045, rotate = 1.5, show, duration = 0.95,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  const reduced = useReducedMotion();
  const visible = show ?? inView;

  const word = (w, i, key) => (
    <motion.span
      key={key}
      className="rv-word"
      initial={reduced ? false : { y: '115%', rotate, opacity: 0 }}
      animate={visible ? { y: '0%', rotate: 0, opacity: 1 } : undefined}
      transition={{ duration, ease: EASE_OUT, delay: delay + i * stagger }}
    >
      {w}
    </motion.span>
  );

  if (lines) {
    return (
      <Tag ref={ref} className={className} style={style}>
        {lines.map((line, i) => (
          <span key={i} className="rv-mask block">{word(line, i, i)}</span>
        ))}
      </Tag>
    );
  }

  const words = String(text).split(' ');
  return (
    <Tag ref={ref} className={className} style={style} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="rv-mask" aria-hidden="true">
          {word(w, i, i)}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}

/** Fade-and-rise for blocks of content. */
export function FadeIn({ children, delay = 0, y = 28, className, style, as = 'div' }) {
  const reduced = useReducedMotion();
  const M = motion[as];
  return (
    <M
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 1, ease: EASE_OUT, delay }}
    >
      {children}
    </M>
  );
}

/** Letters that roll up on hover of the closest `.roll-host`. */
export function Roll({ text }) {
  return (
    <>
      <span className="roll" aria-hidden="true">
        {[...text].map((ch, i) => (
          <span className="roll-ch" key={i} style={{ '--d': `${i * 15}ms` }}>
            <span>{ch}</span>
            <span>{ch}</span>
          </span>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}

const isModified = (e) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

/** Internal link that plays the page transition. */
export function TLink({ to, children, onClick, ...rest }) {
  const { go } = useTransitionNav();
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || isModified(e)) return;
        e.preventDefault();
        go(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

/** External link that opens in a new tab. */
export const Ext = ({ href, children, ...rest }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>
);

/** DOM canvas rendering of a project's poster cover, redrawn on resize. */
export function Cover({ project, index, className, label }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0;
    let alive = true;
    const draw = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      drawCover(canvas.getContext('2d'), canvas.width, canvas.height, project, index);
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => fontsReady().then(() => alive && draw()));
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(canvas);
    return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); };
  }, [project, index]);
  return (
    <canvas
      ref={ref}
      className={className}
      role="img"
      aria-label={label || `${project.name} — architecture poster`}
    />
  );
}

/** Larger, labelled SVG version of the architecture graph for case studies. */
export function ArchitectureDiagram({ architecture, title }) {
  if (!architecture?.nodes?.length) return null;
  const { nodes, edges = [] } = architecture;
  const CW = 262;
  const CH = 120;
  const NW = 166;
  const NH = 60;
  const maxX = Math.max(...nodes.map((n) => n.x));
  const minY = Math.min(...nodes.map((n) => n.y));
  const maxY = Math.max(...nodes.map((n) => n.y));
  const W = (maxX + 1) * CW;
  const H = (maxY - minY + 1) * CH + 40;
  const pos = Object.fromEntries(nodes.map((n) => [n.id, { cx: n.x * CW + CW / 2, cy: (n.y - minY) * CH + CH / 2, n }]));
  const markerId = `arr-${title?.replace(/\W/g, '') || 'd'}`;
  const labels = [];

  return (
    <div className="diagram">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title} architecture diagram`}>
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--fg-60)" />
          </marker>
        </defs>
        {edges.map(([from, to, label], i) => {
          const a = pos[from];
          const b = pos[to];
          if (!a || !b) return null;
          let d;
          let lx;
          let ly;
          let dashed = false;
          if (b.cx > a.cx) {
            const x1 = a.cx + NW / 2;
            const x2 = b.cx - NW / 2;
            const mx = (x1 + x2) / 2;
            d = `M${x1} ${a.cy} H${mx} V${b.cy} H${x2 - 2}`;
            lx = mx;
            ly = (a.cy === b.cy ? a.cy : b.cy) - 13;
          } else if (b.cx < a.cx) {
            const y = Math.max(a.cy, b.cy) + NH / 2 + 22;
            d = `M${a.cx} ${a.cy + NH / 2} V${y} H${b.cx} V${b.cy + NH / 2 + 2}`;
            lx = (a.cx + b.cx) / 2;
            ly = y - 7;
            dashed = true;
          } else {
            const dir = b.cy > a.cy ? 1 : -1;
            d = `M${a.cx} ${a.cy + (dir * NH) / 2} V${b.cy - (dir * NH) / 2 - dir * 2}`;
            lx = a.cx + 8;
            ly = (a.cy + b.cy) / 2;
          }
          if (label) labels.push({ key: i, label, lx, ly, start: b.cx === a.cx });
          return <path key={i} d={d} fill="none" stroke="var(--fg-60)" strokeWidth="1.3" strokeDasharray={dashed ? '5 4' : undefined} markerEnd={`url(#${markerId})`} />;
        })}
        {Object.values(pos).map(({ cx, cy, n }) => {
          const kind = n.kind || 'service';
          const fill = kind === 'broker' ? 'var(--accent)' : kind === 'external' ? 'rgba(236,223,204,0.08)' : 'var(--bg)';
          return (
            <g key={n.id}>
              <rect
                x={cx - NW / 2} y={cy - NH / 2} width={NW} height={NH}
                rx={kind === 'store' ? NH / 2 : 4}
                fill={fill}
                stroke={kind === 'broker' ? 'var(--accent)' : 'var(--fg-80)'}
                strokeWidth="1.3"
                strokeDasharray={kind === 'client' ? '6 4' : undefined}
              />
              <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="900" letterSpacing="0.02em" fill="var(--fg)" style={{ textTransform: 'uppercase' }}>
                {n.label}
              </text>
            </g>
          );
        })}
        {/* Labels go last, on a backing chip, so nodes and lines never cover them. */}
        {labels.map(({ key, label, lx, ly, start }) => {
          const w = label.length * 7.4 + 10;
          return (
            <g key={`l${key}`}>
              <rect x={start ? lx - 4 : lx - w / 2} y={ly - 9} width={w} height={17} rx={3} fill="#121510" />
              <text x={lx} y={ly + 1} textAnchor={start ? 'start' : 'middle'} dominantBaseline="middle" fontSize="11" fontWeight="700" letterSpacing="0.06em" fill="var(--fg-60)" style={{ textTransform: 'uppercase' }}>
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
