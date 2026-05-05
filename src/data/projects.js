export const PROJECTS = [
  {
    slug: 'iot-health',
    name: 'IoT Health Monitoring Platform',
    summary: 'Full-stack platform that simulates connected medical devices streaming patient vitals to a Spring Boot backend. Real-time WebSocket push to a React dashboard, with threshold-based alerting on incoming readings.',
    highlights: [
      'WebSocket + STOMP for sub-second vital updates to clients',
      'Append-only Postgres schema indexed for time-range reads',
      'In-process threshold rules — easy to test, easy to swap',
    ],
    stack: ['Java', 'Spring Boot', 'WebSocket', 'PostgreSQL', 'React'],
  },
  {
    slug: 'pulsestream',
    name: 'PulseStream',
    summary: 'Cloud-native event-processing platform built around Kafka. Decoupled producers and consumers, separate ingestion and processing services, and observability wired in from day one.',
    highlights: [
      'Independent consumer groups per concern (anomaly, aggregate, alert)',
      'Dead-letter queue with replay for failed messages',
      'Prometheus + Grafana wired before any business logic',
    ],
    stack: ['Kafka', 'Spring Boot', 'Docker', 'Prometheus', 'PostgreSQL', 'Redis'],
  },
  {
    slug: 'e-recruitment',
    name: 'E-Recruitment System',
    summary: 'Recruitment platform covering the full hiring workflow — job postings, candidate applications, status tracking — with JWT authentication and role-based access for admins, recruiters, and applicants.',
    highlights: [
      'Stateless JWT with refresh and revocation flow',
      'Annotation-based role checks at the controller layer',
      'Application events power asynchronous notifications',
    ],
    stack: ['Spring Boot', 'PostgreSQL', 'JWT', 'RBAC'],
  },
  {
    slug: 'learnova',
    name: 'Learnova',
    summary: 'Online learning platform with a single-account, dual-profile model — users switch between learner and instructor without separate logins. Course management, live sessions via Jitsi, and media uploads to Cloudinary.',
    highlights: [
      'One user, many profiles — role as a property, not an identity',
      'Direct media uploads to Cloudinary with signed URLs',
      'Certificates generated asynchronously on course.completed',
    ],
    stack: ['Spring Boot', 'PostgreSQL', 'Cloudinary', 'Jitsi', 'React'],
  },
  {
    slug: 'orderflow',
    name: 'OrderFlow',
    summary: 'Microservice-based order processing system using RabbitMQ for asynchronous communication. Idempotency keys make retries safe, and a metrics endpoint exposes consumer health for observability.',
    highlights: [
      'Idempotency at the consumer, backed by a dedicated store',
      'Database-per-service — no shared schemas across boundaries',
      'Failed messages routed to a DLQ; metrics exposed for scraping',
    ],
    stack: ['Microservices', 'RabbitMQ', 'Spring Boot', 'PostgreSQL', 'Prometheus'],
  },
];

export const STACK = [
  {
    layer: 'Languages',
    blurb: 'Day-to-day for backend work and tooling.',
    items: ['Java', 'TypeScript', 'SQL', 'Bash'],
  },
  {
    layer: 'Backend',
    blurb: 'Spring Boot is my default — REST, WebSocket, JWT auth.',
    items: ['Spring Boot', 'REST', 'WebSocket', 'JWT'],
  },
  {
    layer: 'Messaging',
    blurb: 'Kafka for streaming and decoupled services, RabbitMQ for task queues.',
    items: ['Kafka', 'RabbitMQ'],
  },
  {
    layer: 'Data',
    blurb: 'PostgreSQL for primary storage, Redis for caching and ephemeral state.',
    items: ['PostgreSQL', 'Redis'],
  },
  {
    layer: 'Frontend',
    blurb: 'Comfortable shipping UIs when the backend needs one.',
    items: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    layer: 'Infrastructure',
    blurb: 'Docker for local + CI parity, GitHub Actions, Vercel for static hosts.',
    items: ['Docker', 'GitHub Actions', 'Vercel'],
  },
  {
    layer: 'Practices',
    blurb: 'How I think about systems — bounded contexts, async by default, observability first.',
    items: ['Event-driven design', 'Clean architecture', 'Testing', 'Observability'],
  },
];
