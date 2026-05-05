import React from 'react';

const W = 280, H = 170;

const NodeRect = ({ x, y, w, h, label, sub, kind = 'svc' }) => {
  const fill = kind === 'me'   ? 'var(--accent-soft)'
             : kind === 'data' ? 'var(--bg-4)'
             : 'var(--bg-3)';
  const stroke = kind === 'me'   ? 'var(--accent)'
               : kind === 'data' ? 'var(--border-stronger)'
               : 'var(--border-strong)';
  const txt    = kind === 'me'   ? 'var(--accent)' : 'var(--fg-2)';
  const subTxt = 'var(--fg-3)';
  const isData = kind === 'data';
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={isData ? h / 2 : 6}
        fill={fill} stroke={stroke} strokeWidth="1" />
      <text x={x + w / 2} y={sub ? y + h / 2 - 1 : y + h / 2 + 3.5}
        textAnchor="middle" fontFamily="var(--mono)" fontSize="9.5" fill={txt}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle"
          fontFamily="var(--mono)" fontSize="7.5" fill={subTxt}>
          {sub}
        </text>
      )}
    </g>
  );
};

const Arrow = ({ x1, y1, x2, y2, accent, dashed }) => {
  const stroke = accent ? 'var(--accent)' : 'var(--fg-3)';
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={stroke} strokeWidth="1"
      strokeDasharray={dashed ? '3 2' : ''}
      markerEnd={`url(#${accent ? 'arrA' : 'arr'})`} />
  );
};

const Defs = () => (
  <defs>
    <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--fg-3)" />
    </marker>
    <marker id="arrA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--accent)" />
    </marker>
  </defs>
);

/* 1. IoT Health Monitoring
   Virtual Sensors → Spring Boot API → Postgres
   Spring Boot API → Alert Service → WS/STOMP → React Dashboard
*/
export const IoTMini = () => (
  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 170 }}>
    <Defs />
    <NodeRect x={6}   y={14}  w={62} h={20} label="sensor" />
    <NodeRect x={6}   y={44}  w={62} h={20} label="sensor" />
    <NodeRect x={6}   y={74}  w={62} h={20} label="sensor" />
    <text x={37} y={108} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fill="var(--fg-3)">virtual</text>

    <NodeRect x={94}  y={48}  w={70} h={36} label="API" sub="spring boot" kind="me" />

    <NodeRect x={186} y={14}  w={88} h={20} label="alert service" />
    <NodeRect x={186} y={44}  w={88} h={20} label="ws / stomp" />
    <NodeRect x={186} y={78}  w={88} h={20} label="react dashboard" />
    <NodeRect x={186} y={114} w={88} h={20} label="postgres" kind="data" />

    <Arrow x1={68} y1={24} x2={94} y2={56} />
    <Arrow x1={68} y1={54} x2={94} y2={64} />
    <Arrow x1={68} y1={84} x2={94} y2={72} />

    <Arrow x1={164} y1={56} x2={186} y2={24} />
    <Arrow x1={164} y1={64} x2={186} y2={54} accent />
    <Arrow x1={186} y1={54} x2={186} y2={78} accent dashed />
    <Arrow x1={164} y1={76} x2={186} y2={124} dashed />
  </svg>
);

/* 2. PulseStream
   Producers → Kafka → Ingestion → Processing → Postgres
   Processing → Anomaly Detection → Observability
*/
export const PulseStreamMini = () => (
  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 170 }}>
    <Defs />
    <NodeRect x={6}   y={20} w={50} h={18} label="producer" />
    <NodeRect x={6}   y={48} w={50} h={18} label="producer" />
    <NodeRect x={6}   y={76} w={50} h={18} label="producer" />

    <NodeRect x={70}  y={42} w={56} h={32} label="kafka" sub="topic" kind="me" />
    <NodeRect x={140} y={20} w={64} h={20} label="ingestion" />
    <NodeRect x={140} y={56} w={64} h={20} label="processing" />

    <NodeRect x={218} y={20}  w={56} h={20} label="anomaly" />
    <NodeRect x={218} y={56}  w={56} h={20} label="observ." />
    <NodeRect x={218} y={94}  w={56} h={20} label="postgres" kind="data" />
    <NodeRect x={140} y={104} w={64} h={20} label="dlq" />

    <Arrow x1={56} y1={29} x2={70} y2={52} />
    <Arrow x1={56} y1={57} x2={70} y2={58} />
    <Arrow x1={56} y1={85} x2={70} y2={64} />

    <Arrow x1={126} y1={52} x2={140} y2={30} accent />
    <Arrow x1={126} y1={62} x2={140} y2={66} accent />

    <Arrow x1={204} y1={30} x2={218} y2={30} accent />
    <Arrow x1={204} y1={66} x2={218} y2={30} accent dashed />
    <Arrow x1={204} y1={66} x2={218} y2={66} accent />
    <Arrow x1={204} y1={70} x2={218} y2={104} dashed />
    <Arrow x1={172} y1={76} x2={172} y2={104} dashed />
  </svg>
);

/* 3. E-Recruitment
   Candidate / Recruiter → REST API → Auth/RBAC → Postgres
   Application Service → Notification Service
*/
export const ERecruitmentMini = () => (
  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 170 }}>
    <Defs />
    <NodeRect x={6}   y={28}  w={62} h={20} label="candidate" />
    <NodeRect x={6}   y={70}  w={62} h={20} label="recruiter" />

    <NodeRect x={92}  y={20}  w={66} h={28} label="REST API" kind="me" />
    <NodeRect x={92}  y={62}  w={66} h={28} label="auth / rbac" sub="JWT" />

    <NodeRect x={180} y={14}  w={88} h={20} label="application svc" />
    <NodeRect x={180} y={44}  w={88} h={20} label="notification svc" />
    <NodeRect x={180} y={88}  w={88} h={20} label="postgres" kind="data" />

    <Arrow x1={68} y1={38} x2={92} y2={34} />
    <Arrow x1={68} y1={80} x2={92} y2={76} />
    <Arrow x1={125} y1={48} x2={125} y2={62} accent />

    <Arrow x1={158} y1={30} x2={180} y2={24} />
    <Arrow x1={180} y1={34} x2={180} y2={44} accent dashed />
    <Arrow x1={158} y1={76} x2={180} y2={98} dashed />
    <Arrow x1={158} y1={34} x2={180} y2={98} dashed />
  </svg>
);

/* 4. Learnova
   Learner / Instructor → Spring Boot API → Course Mgmt → Postgres
   Media Upload → Cloudinary
   Live Sessions → Jitsi
*/
export const LearnovaMini = () => (
  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 170 }}>
    <Defs />
    <NodeRect x={6}   y={28}  w={62} h={20} label="learner" />
    <NodeRect x={6}   y={70}  w={62} h={20} label="instructor" />

    <NodeRect x={92}  y={48}  w={70} h={32} label="API" sub="spring boot" kind="me" />

    <NodeRect x={186} y={14}  w={88} h={20} label="course mgmt" />
    <NodeRect x={186} y={44}  w={88} h={20} label="media upload" />
    <NodeRect x={186} y={74}  w={88} h={20} label="live sessions" />
    <NodeRect x={186} y={108} w={88} h={20} label="postgres" kind="data" />

    <text x={244} y={144} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fill="var(--accent)">→ cloudinary</text>
    <text x={244} y={156} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fill="var(--accent)">→ jitsi</text>

    <Arrow x1={68} y1={38} x2={92} y2={58} />
    <Arrow x1={68} y1={80} x2={92} y2={70} />

    <Arrow x1={162} y1={56} x2={186} y2={24} />
    <Arrow x1={162} y1={62} x2={186} y2={54} accent />
    <Arrow x1={162} y1={68} x2={186} y2={84} accent />
    <Arrow x1={162} y1={74} x2={186} y2={118} dashed />
  </svg>
);

/* 5. OrderFlow
   Order API → RabbitMQ → Order Consumer → Postgres
   Consumer → Idempotency Store → Metrics / DLQ
*/
export const OrderFlowMini = () => (
  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 170 }}>
    <Defs />
    <NodeRect x={6}   y={56} w={56} h={28} label="order api" kind="me" />
    <NodeRect x={76}  y={56} w={64} h={28} label="rabbitmq" />
    <NodeRect x={154} y={56} w={70} h={28} label="consumer" />

    <NodeRect x={238} y={20}  w={36} h={20} label="metrics" />
    <NodeRect x={238} y={50}  w={36} h={20} label="dlq" />
    <NodeRect x={238} y={92}  w={36} h={20} label="db" kind="data" />

    <NodeRect x={154} y={106} w={70} h={20} label="idempotency" />

    <Arrow x1={62} y1={70} x2={76} y2={70} accent />
    <Arrow x1={140} y1={70} x2={154} y2={70} accent />

    <Arrow x1={224} y1={64} x2={238} y2={30} />
    <Arrow x1={224} y1={68} x2={238} y2={60} dashed />
    <Arrow x1={224} y1={76} x2={238} y2={100} accent />

    <Arrow x1={189} y1={84} x2={189} y2={106} accent dashed />
    <Arrow x1={189} y1={126} x2={189} y2={140} />
    <text x={189} y={150} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fill="var(--fg-3)">store · retry-safe</text>
  </svg>
);
