import React from 'react';

const ArrowDefs = ({ id }) => (
  <defs>
    <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--fg-3)" />
    </marker>
    <marker id={`${id}-arrow-accent`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
    </marker>
  </defs>
);

const DNode = ({ x, y, w = 120, h = 44, label, sub, kind = 'svc' }) => {
  const fill = kind === 'data' ? 'rgba(167,139,250,0.08)'
             : kind === 'evt'  ? 'rgba(245,158,11,0.08)'
             : kind === 'me'   ? 'var(--accent-soft)'
             : 'var(--bg-3)';
  const stroke = kind === 'data' ? 'rgba(167,139,250,0.5)'
               : kind === 'evt'  ? 'rgba(245,158,11,0.5)'
               : kind === 'me'   ? 'var(--accent)'
               : 'var(--border-strong)';
  const labelColor = kind === 'me' ? 'var(--accent-2)' : 'var(--fg)';
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={kind === 'data' ? h / 2 : 6}
        fill={fill} stroke={stroke} strokeWidth="1" />
      <text x={x + w / 2} y={y + h / 2 + (sub ? -3 : 4)} textAnchor="middle"
        fontFamily="var(--mono)" fontSize="11" fill={labelColor} fontWeight="600">{label}</text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle"
          fontFamily="var(--mono)" fontSize="9" fill="var(--fg-3)">{sub}</text>
      )}
    </g>
  );
};

const DEdge = ({ x1, y1, x2, y2, label, dashed, accent, idPrefix }) => {
  const stroke = accent ? 'var(--accent)' : 'var(--fg-3)';
  const marker = accent ? `${idPrefix}-arrow-accent` : `${idPrefix}-arrow`;
  return (
    <g>
      <path d={`M ${x1} ${y1} L ${x2} ${y2}`}
        stroke={stroke} strokeWidth="1.2" fill="none"
        strokeDasharray={dashed ? '4 3' : ''}
        markerEnd={`url(#${marker})`}
        opacity={accent ? 1 : 0.7} />
      {label && (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 5} textAnchor="middle"
          fontFamily="var(--mono)" fontSize="9" fill="var(--fg-3)">{label}</text>
      )}
    </g>
  );
};

const DiagramFrame = ({ children, viewBox = '0 0 880 420', height = 420 }) => (
  <div style={{
    background: 'var(--bg-2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '20px 24px',
    overflow: 'hidden',
  }}>
    <svg viewBox={viewBox} style={{ width: '100%', height, display: 'block' }}>
      {children}
    </svg>
  </div>
);

// ── 1. IoT Health Monitor ────────────────────────────────────────────
export const IoTDiagram = () => (
  <DiagramFrame>
    <ArrowDefs id="iot" />
    <DNode x={30}  y={40}  w={140} h={42} label="DEVICE SIM" sub="HR · SpO₂ · temp" kind="evt" />
    <DNode x={30}  y={120} w={140} h={42} label="DEVICE SIM" sub="patient #2" kind="evt" />
    <DNode x={30}  y={200} w={140} h={42} label="DEVICE SIM" sub="patient #3" kind="evt" />

    <DNode x={290} y={120} w={160} h={60} label="SPRING BOOT" sub="REST + WebSocket" kind="me" />

    <DNode x={520} y={40}  w={160} h={42} label="ANOMALY DETECT" sub="threshold rules" />
    <DNode x={520} y={120} w={160} h={42} label="ALERT SERVICE" sub="dispatch" />

    <DNode x={290} y={300} w={160} h={42} label="postgres" sub="vitals time-series" kind="data" />
    <DNode x={520} y={220} w={160} h={42} label="REACT CLIENT" sub="live dashboard" />

    <DEdge x1={170} y1={61}  x2={290} y2={140} label="HTTP" idPrefix="iot" />
    <DEdge x1={170} y1={141} x2={290} y2={150} idPrefix="iot" />
    <DEdge x1={170} y1={221} x2={290} y2={160} idPrefix="iot" />

    <DEdge x1={450} y1={140} x2={520} y2={61}  idPrefix="iot" />
    <DEdge x1={680} y1={61}  x2={680} y2={120} idPrefix="iot" />
    <DEdge x1={520} y1={141} x2={450} y2={150} idPrefix="iot" />
    <DEdge x1={370} y1={180} x2={370} y2={300} label="persist" idPrefix="iot" dashed />
    <DEdge x1={450} y1={155} x2={520} y2={235} label="ws push" idPrefix="iot" accent />
  </DiagramFrame>
);

// ── 2. PulseStream ───────────────────────────────────────────────────
export const PulseStreamDiagram = () => (
  <DiagramFrame>
    <ArrowDefs id="ps" />
    <DNode x={30}  y={40}  w={130} h={40} label="PRODUCER" sub="iot gateway" kind="evt" />
    <DNode x={30}  y={110} w={130} h={40} label="PRODUCER" sub="device fleet" kind="evt" />
    <DNode x={30}  y={180} w={130} h={40} label="PRODUCER" sub="external api" kind="evt" />

    <DNode x={240} y={100} w={160} h={56} label="KAFKA" sub="topics · partitions" kind="me" />

    <DNode x={460} y={30}  w={160} h={40} label="CONSUMER" sub="anomaly detect" />
    <DNode x={460} y={90}  w={160} h={40} label="CONSUMER" sub="aggregator" />
    <DNode x={460} y={150} w={160} h={40} label="CONSUMER" sub="alerter" />
    <DNode x={460} y={210} w={160} h={40} label="DLQ" sub="replay" kind="evt" />

    <DNode x={680} y={50}  w={170} h={40} label="postgres" sub="windowed metrics" kind="data" />
    <DNode x={680} y={120} w={170} h={40} label="redis" sub="hot state" kind="data" />
    <DNode x={680} y={190} w={170} h={40} label="prometheus" sub="observability" />

    <DEdge x1={160} y1={60}  x2={240} y2={120} idPrefix="ps" />
    <DEdge x1={160} y1={130} x2={240} y2={130} idPrefix="ps" />
    <DEdge x1={160} y1={200} x2={240} y2={140} idPrefix="ps" />

    <DEdge x1={400} y1={120} x2={460} y2={50}  idPrefix="ps" accent />
    <DEdge x1={400} y1={128} x2={460} y2={110} idPrefix="ps" accent />
    <DEdge x1={400} y1={136} x2={460} y2={170} idPrefix="ps" accent />
    <DEdge x1={400} y1={150} x2={460} y2={230} idPrefix="ps" dashed />

    <DEdge x1={620} y1={50}  x2={680} y2={70}  idPrefix="ps" />
    <DEdge x1={620} y1={110} x2={680} y2={140} idPrefix="ps" />
    <DEdge x1={620} y1={170} x2={680} y2={210} idPrefix="ps" />
  </DiagramFrame>
);

// ── 3. E-Recruitment ─────────────────────────────────────────────────
export const ERecruitmentDiagram = () => (
  <DiagramFrame viewBox="0 0 880 380" height={380}>
    <ArrowDefs id="er" />
    <DNode x={30}  y={40}  w={120} h={40} label="ADMIN"     sub="manage" kind="evt" />
    <DNode x={30}  y={110} w={120} h={40} label="RECRUITER" sub="post jobs" kind="evt" />
    <DNode x={30}  y={180} w={120} h={40} label="APPLICANT" sub="apply" kind="evt" />

    <DNode x={210} y={110} w={140} h={48} label="JWT AUTH" sub="role guard" kind="me" />

    <DNode x={400} y={30}  w={150} h={40} label="JOBS API"          sub="CRUD" />
    <DNode x={400} y={90}  w={150} h={40} label="APPLICATIONS API"  sub="lifecycle" />
    <DNode x={400} y={150} w={150} h={40} label="USERS API"         sub="profiles" />
    <DNode x={400} y={210} w={150} h={40} label="NOTIFICATIONS"     sub="email events" />

    <DNode x={610} y={110} w={150} h={48} label="postgres" sub="relational" kind="data" />

    <DEdge x1={150} y1={60}  x2={210} y2={130} idPrefix="er" />
    <DEdge x1={150} y1={130} x2={210} y2={138} idPrefix="er" />
    <DEdge x1={150} y1={200} x2={210} y2={146} idPrefix="er" />

    <DEdge x1={350} y1={130} x2={400} y2={50}  idPrefix="er" accent />
    <DEdge x1={350} y1={134} x2={400} y2={110} idPrefix="er" accent />
    <DEdge x1={350} y1={138} x2={400} y2={170} idPrefix="er" accent />
    <DEdge x1={350} y1={142} x2={400} y2={230} idPrefix="er" accent />

    <DEdge x1={550} y1={50}  x2={610} y2={125} idPrefix="er" />
    <DEdge x1={550} y1={110} x2={610} y2={130} idPrefix="er" />
    <DEdge x1={550} y1={170} x2={610} y2={135} idPrefix="er" />
    <DEdge x1={550} y1={230} x2={610} y2={140} idPrefix="er" dashed />
  </DiagramFrame>
);

// ── 4. Learnova ──────────────────────────────────────────────────────
export const LearnovaDiagram = () => (
  <DiagramFrame viewBox="0 0 880 380" height={380}>
    <ArrowDefs id="lv" />
    <DNode x={30}  y={130} w={140} h={56} label="USER" sub="learner ⇄ instructor" kind="me" />

    <DNode x={230} y={30}  w={150} h={40} label="PROFILE SVC"      sub="role switch" />
    <DNode x={230} y={90}  w={150} h={40} label="COURSES API"      sub="curriculum" />
    <DNode x={230} y={150} w={150} h={40} label="SESSIONS API"     sub="live schedule" />
    <DNode x={230} y={210} w={150} h={40} label="CERTIFICATES SVC" sub="auto-issue" />
    <DNode x={230} y={270} w={150} h={40} label="MEDIA SVC"        sub="upload/sign" />

    <DNode x={440} y={30}  w={140} h={40} label="postgres" sub="users · roles" kind="data" />
    <DNode x={440} y={90}  w={140} h={40} label="postgres" sub="courses" kind="data" />
    <DNode x={440} y={150} w={140} h={40} label="postgres" sub="sessions" kind="data" />
    <DNode x={440} y={270} w={140} h={40} label="object store" sub="video · pdf" kind="data" />

    <DNode x={640} y={150} w={150} h={48} label="CDN" sub="signed urls" />
    <DNode x={640} y={230} w={150} h={48} label="PDF GEN" sub="cert template" />

    <DEdge x1={170} y1={150} x2={230} y2={50}  idPrefix="lv" />
    <DEdge x1={170} y1={155} x2={230} y2={110} idPrefix="lv" />
    <DEdge x1={170} y1={160} x2={230} y2={170} idPrefix="lv" />
    <DEdge x1={170} y1={165} x2={230} y2={230} idPrefix="lv" />
    <DEdge x1={170} y1={170} x2={230} y2={290} idPrefix="lv" />

    <DEdge x1={380} y1={50}  x2={440} y2={50}  idPrefix="lv" />
    <DEdge x1={380} y1={110} x2={440} y2={110} idPrefix="lv" />
    <DEdge x1={380} y1={170} x2={440} y2={170} idPrefix="lv" />
    <DEdge x1={380} y1={290} x2={440} y2={290} idPrefix="lv" />

    <DEdge x1={580} y1={290} x2={640} y2={170} idPrefix="lv" accent />
    <DEdge x1={305} y1={250} x2={640} y2={250} idPrefix="lv" dashed accent label="on completion" />
  </DiagramFrame>
);

// ── 5. OrderFlow ─────────────────────────────────────────────────────
export const OrderFlowDiagram = () => (
  <DiagramFrame viewBox="0 0 880 380" height={380}>
    <ArrowDefs id="of" />
    <DNode x={30}  y={150} w={120} h={48} label="API GATEWAY" sub="orders" kind="me" />

    <DNode x={210} y={150} w={140} h={48} label="rabbitmq" sub="events" kind="evt" />

    <DNode x={400} y={30}  w={140} h={42} label="ORDER SVC"     sub="idempotent" />
    <DNode x={400} y={90}  w={140} h={42} label="INVENTORY SVC" sub="reserve" />
    <DNode x={400} y={150} w={140} h={42} label="PAYMENT SVC"   sub="charge" />
    <DNode x={400} y={210} w={140} h={42} label="FULFILLMENT"   sub="ship" />
    <DNode x={400} y={270} w={140} h={42} label="NOTIFICATIONS" sub="email" />

    <DNode x={600} y={50}  w={140} h={42} label="postgres" sub="orders" kind="data" />
    <DNode x={600} y={110} w={140} h={42} label="postgres" sub="inventory" kind="data" />
    <DNode x={600} y={170} w={140} h={42} label="postgres" sub="payments" kind="data" />
    <DNode x={600} y={230} w={140} h={42} label="prometheus" sub="metrics" />

    <DEdge x1={150} y1={174} x2={210} y2={174} label="publish" idPrefix="of" accent />
    <DEdge x1={350} y1={170} x2={400} y2={50}  idPrefix="of" accent dashed />
    <DEdge x1={350} y1={172} x2={400} y2={110} idPrefix="of" accent dashed />
    <DEdge x1={350} y1={174} x2={400} y2={170} idPrefix="of" accent dashed />
    <DEdge x1={350} y1={176} x2={400} y2={230} idPrefix="of" accent dashed />
    <DEdge x1={350} y1={178} x2={400} y2={290} idPrefix="of" accent dashed />

    <DEdge x1={540} y1={50}  x2={600} y2={70}  idPrefix="of" />
    <DEdge x1={540} y1={110} x2={600} y2={130} idPrefix="of" />
    <DEdge x1={540} y1={170} x2={600} y2={190} idPrefix="of" />
    <DEdge x1={540} y1={230} x2={600} y2={250} idPrefix="of" dashed />
  </DiagramFrame>
);
