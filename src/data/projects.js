export const TAGS = [
  { id: 'distributed', label: 'Distributed Systems' },
  { id: 'full-stack', label: 'Full-Stack' },
  { id: 'cloud-ai', label: 'Cloud & AI' },
  { id: 'mobile-web', label: 'Mobile & Web' },
];

export const PROJECTS = [
  // ---------------------------------------------------------------------------
  // 1. PulseStream
  // ---------------------------------------------------------------------------
  {
    slug: 'pulsestream',
    name: 'PulseStream',
    kicker: 'Cloud-native event platform',
    year: '2026',
    role: 'Internship at G-TEC Multiservice — backend & infrastructure',
    status: 'In progress',
    tags: ['distributed'],
    featured: true,
    stack: [
      'Java 25',
      'Spring Boot 4.1',
      'Kafka (KRaft)',
      'PostgreSQL 18',
      'Kubernetes',
      'Strimzi',
      'OpenTelemetry',
      'Prometheus',
      'Grafana',
    ],
    summary:
      'A Kafka-based platform that ingests IoT telemetry, detects anomalies and stores processed readings, with dead-letter routing, replay, tracing and metrics built in. The Kubernetes manifests are committed and live-cluster validation is the current phase.',
    links: [{ label: 'GitHub', href: 'https://github.com/ME-Massine/pulsestream' }],
    highlights: [
      'Ingestion and processing decoupled by topics: raw, processed, anomalies, DLQ',
      'Operator-triggered DLQ replay, bounded by offset snapshots so it cannot loop',
      'OpenTelemetry traces to Jaeger, Prometheus metrics, versioned Grafana dashboards',
      'Kubernetes manifests: Strimzi Kafka, HPAs, network policies, in-cluster tracing',
      'Six ADRs and a PROJECT_STATE file that separates implemented from validated',
    ],
    architecture: {
      nodes: [
        { id: 'sim', label: 'Devices / Sim', x: 0, y: 1, kind: 'client' },
        { id: 'ing', label: 'Ingestion', x: 1, y: 1, kind: 'service' },
        { id: 'kafka', label: 'Kafka · KRaft', x: 2, y: 1, kind: 'broker' },
        { id: 'proc', label: 'Processor', x: 3, y: 1, kind: 'service' },
        { id: 'pg', label: 'PostgreSQL 18', x: 4, y: 1, kind: 'store' },
        { id: 'dlq', label: 'DLQ topic', x: 2, y: 2, kind: 'broker' },
        { id: 'query', label: 'Query · WIP', x: 4, y: 2, kind: 'service' },
        { id: 'prom', label: 'Prometheus', x: 1, y: 3, kind: 'external' },
        { id: 'jaeger', label: 'OTel · Jaeger', x: 3, y: 3, kind: 'external' },
      ],
      edges: [
        ['sim', 'ing', 'HTTP'],
        ['ing', 'kafka', 'raw'],
        ['kafka', 'proc'],
        ['proc', 'pg', 'normal'],
        ['proc', 'dlq', 'on failure'],
        ['dlq', 'kafka', 'replay'],
        ['pg', 'query', 'planned'],
        ['ing', 'prom', 'metrics'],
        ['proc', 'jaeger', 'traces'],
      ],
    },
    overview: [
      'IoT telemetry is a stream problem: many producers, readings that keep arriving, and several consumers that each care about something different. A single service that accepts a request, checks it and writes to a database works until ingestion has to keep going while processing is slow, broken or being redeployed. During my internship at G-TEC Multiservice I built the version where those concerns are actually separated, and where you can see what the pipeline is doing.',
      'PulseStream is that platform. An ingestion service accepts telemetry over REST and publishes it to Kafka. A telemetry processor normalizes each event, runs threshold and sudden-deviation anomaly rules, persists normal readings to PostgreSQL and publishes processed and anomaly events to their own topics. It is not finished: the query-service is a deployable scaffold, anomalies are published but not yet persisted, and the Kubernetes deployment is implemented but still waiting on live-cluster validation.',
    ],
    approach: [
      'Kafka is the backbone, with four topics: telemetry.events.raw, .processed, .anomalies and .dlq. Both services are Spring Boot 4.1 on Java 25, the current LTS, which is the single JVM used for compiling, CI, CodeQL and the runtime image. Locally, one Docker Compose file brings up Kafka in KRaft mode (Confluent 8.3), PostgreSQL 18, Redis, Prometheus, Grafana and Jaeger. Events that fail processing go to the dead-letter topic, and a management endpoint on the processor replays selected events back into the raw topic.',
      'Observability was there from the start rather than added at the end: Actuator health and Prometheus endpoints on both services, OpenTelemetry instrumentation exporting OTLP traces (to Jaeger locally, to an OpenTelemetry Collector in the cluster), and Grafana dashboards kept as JSON in the repo. For Kubernetes I committed manifests for the services, Kafka through the Strimzi operator, in-cluster Prometheus, Grafana and tracing, CPU and custom-metric autoscalers, and network policies, along with PowerShell scripts that check each piece against a running cluster.',
    ],
    decisions: [
      {
        title: 'Kafka over RabbitMQ',
        body: 'RabbitMQ would have been quicker to set up, but I needed durable, replayable streams and independent consumer groups reading the same data. ADR 0001 records the trade-off: more operational weight and harder debugging in exchange for replay, buffering when consumers slow down, and partitioned horizontal scaling.',
      },
      {
        title: 'Replay is manual, selective and bounded',
        body: 'There is no automatic retry loop out of the DLQ. An operator starts a replay for specific eventIds, the listener snapshots partition end offsets first so it can never consume what it just republished, and replayed events keep their original eventId so persistence converges instead of creating duplicates. A replay that fails again is not sent back to the DLQ, which rules out a feedback loop.',
      },
      {
        title: 'Strimzi instead of a Helm chart for Kafka',
        body: 'The Bitnami chart installs Kafka but does not operate it, and its image catalog changed in 2025. Strimzi manages rolling restarts and configuration through custom resources, runs KRaft with no ZooKeeper, and lets me declare the four topics as KafkaTopic resources that sit in the same diff as the rest of the manifests.',
      },
      {
        title: 'Autoscaling with honest ceilings',
        body: 'The processor scales between 2 and 3 replicas, because the raw topic has 3 partitions and an extra consumer would sit idle. It scales on CPU for now, which I documented as a weak proxy for a consumer that is often waiting on I/O. Consumer lag is the right signal, but it is not exported yet.',
      },
    ],
    learnings: [
      'The most useful habit from this project was writing down what is implemented versus what is validated. Committing a manifest is not the same as watching it work in a cluster, and keeping PROJECT_STATE.md honest about that gap changed how I plan each phase. It also made known limitations visible, such as the in-memory deviation history that does not survive a consumer rebalance, instead of letting them hide.',
      'I also learned how much of distributed work is really contract work. Topic names, the event envelope, the dead-letter wrapper and the replay headers all had to be pinned down before the services could evolve on their own. Every time I tightened one of those contracts, debugging got easier.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2. MASID (private repo, freelance)
  // ---------------------------------------------------------------------------
  {
    slug: 'masid',
    name: 'MASID',
    kicker: 'Case coordination platform',
    year: '2026',
    role: 'Freelance, team of 2 — my part: cases, referrals, accounts, security',
    status: 'In progress — launching soon',
    tags: ['full-stack'],
    featured: true,
    stack: [
      'Laravel 12',
      'PHP 8.3',
      'Inertia',
      'React 19',
      'TypeScript',
      'MySQL',
      'Spatie Permission',
      'ClamAV',
      'Docker Compose',
      'Pest',
      'Playwright',
    ],
    summary:
      'A multilingual platform, built freelance for a Moroccan association, that gives migrant women and girls practical guidance and lets authorized institutions receive, assess, refer and follow their requests. I own the whole case-coordination side: intake, referrals, accounts, private files, audit and data retention.',
    links: [],
    highlights: [
      'Case journey: intake, inbox, assessment, assignment, notes, referral, closure, reopening',
      'Partners see referrals through a read-only projection; sensitive data never leaves the lead association',
      'Tracking with a reference and a hashed secret code, which never reveals whether a case exists',
      'Attachments quarantined and scanned by ClamAV, fail-closed, stored on a private disk',
      'Retention enforced at read time, three months after closure, and erased by a scheduled job',
      'Scripted backup and restore rehearsal that checks table checksums and file hashes',
    ],
    architecture: {
      nodes: [
        { id: 'public', label: 'Beneficiary', x: 0, y: 0, kind: 'client' },
        { id: 'staff', label: 'Staff', x: 0, y: 2, kind: 'client' },
        { id: 'site', label: 'Public guides', x: 1, y: 0, kind: 'service' },
        { id: 'intake', label: 'Help intake', x: 1, y: 1, kind: 'service' },
        { id: 'ws', label: 'Workspace', x: 1, y: 2, kind: 'service' },
        { id: 'cases', label: 'Cases', x: 2, y: 1, kind: 'service' },
        { id: 'queue', label: 'Queue · mail', x: 3, y: 0, kind: 'broker' },
        { id: 'db', label: 'MySQL', x: 3, y: 1, kind: 'store' },
        { id: 'files', label: 'Private files', x: 3, y: 2, kind: 'store' },
        { id: 'audit', label: 'Audit log', x: 3, y: 3, kind: 'store' },
        { id: 'av', label: 'ClamAV', x: 4, y: 2, kind: 'external' },
      ],
      edges: [
        ['public', 'site'],
        ['public', 'intake', 'request'],
        ['staff', 'ws', 'session'],
        ['site', 'intake', 'CTA'],
        ['intake', 'cases'],
        ['ws', 'cases', 'policies'],
        ['cases', 'queue', 'notify'],
        ['cases', 'db'],
        ['cases', 'files', 'attach'],
        ['cases', 'audit', 'record'],
        ['files', 'av', 'scan'],
      ],
    },
    overview: [
      'Migrant women and girls in Morocco often have to find their way through birth registration, residency, healthcare and schooling procedures with very little reliable information, and the associations that help them coordinate cases by phone and paper. MASID is a client project for one of those associations: a public guide to services and procedures in French, Arabic and English, plus a secure workspace where the association and a selected group of partner institutions handle each request.',
      'We are two developers, and each of us owns a full domain. My teammate owns public access: the guides, the institution directory and content administration. I own coordination and referral: accounts and permissions, institution memberships, the case journey from intake to closure, referrals to partners, beneficiary tracking, private attachments, audit recording, security and data retention. The web MVP is in its final phase before launch.',
    ],
    approach: [
      'It is one modular Laravel 12 application with Inertia and a React and TypeScript front end, so the two domains share sessions, localization (including Arabic right-to-left) and UI, but keep their own routes, services, pages and tables. A written shared contract defines the thirteen interfaces between them, such as how a case references a public service or institution by ULID, and any change that crosses the boundary needs a pull request reviewed by both of us.',
      'Access control never depends on a role name alone. Every request goes through Laravel Policies, account state, explicit permissions from Spatie Permission and institution scoping, and administrators get no bypass. Every audited mutation writes its audit entry in the same database transaction. Risky features such as intake, tracking, uploads and the directory ship behind flags that are off by default, development and staging use only synthetic data, and a Docker Compose staging stack with Caddy, a queue worker, a scheduler, Mailpit and ClamAV runs the full release rehearsal locally.',
    ],
    decisions: [
      {
        title: 'Custody stays with the association',
        body: 'Referring a case to a partner moves operational responsibility, not access to the record. Partner workers query referrals through an explicit SQL projection that returns only the reference, status and transfer time: no personal details, notes, history or attachment metadata. This came from a meeting with the client and their legal consultant, and making it a query boundary rather than a UI rule means a missing check cannot leak data.',
      },
      {
        title: 'Retention is enforced at read time',
        body: 'Sensitive case data must be deleted three months after a case is completed. The deadline is set at the first closure, and reopening or referring never extends it. Once the deadline passes, every staff view, partner view, tracking lookup and file download is refused, even if the cleanup job has not run yet. The scheduled erasure then removes the case, its dependent records and its private files, and failures stay visible and retryable.',
      },
      {
        title: 'Uploads are guilty until scanned',
        body: 'Attachments land in quarantine on a private disk under generated keys. ClamAV marks each file clean or infected, and a scanner outage is a third state that blocks downloads instead of letting them through. Downloads go through an authorized controller with headers that stop the browser from running the content.',
      },
      {
        title: 'A restore must not bring deleted cases back',
        body: 'Backups are only useful if restoring them is safe. The rehearsal script backs up MySQL and the private volume, restores them into a separate Compose project, then compares migrations, per-table checksums and file hashes. Before the restored environment accepts traffic it replays an encrypted deletion manifest, so cases erased after the backup stay erased.',
      },
    ],
    learnings: [
      'This is my first project with a real client, real legal constraints and a vulnerable user group, and it changed what I consider “done”. A feature is not finished when the happy path works; it is finished when its permissions, audit events, retention and failure modes are written down and tested. The repository has over 80 backend test files, plus Playwright journeys for accounts, cases, referrals and attachments.',
      'Owning a domain next to another developer’s also taught me to treat the boundary between us as an API. The shared contract and cross-reviewed pull requests felt slow at first, but they let us both move quickly inside our own areas without breaking each other’s work.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 3. OrderFlow
  // ---------------------------------------------------------------------------
  {
    slug: 'orderflow',
    name: 'OrderFlow',
    kicker: 'Reliable order messaging',
    year: '2026',
    role: 'Solo — backend',
    status: 'Released v0.10',
    tags: ['distributed'],
    featured: true,
    stack: [
      'Java 17',
      'Spring Boot 3',
      'RabbitMQ',
      'PostgreSQL',
      'Spring Data JPA',
      'Micrometer',
      'Docker Compose',
      'GitHub Actions',
      'JaCoCo + Codecov',
    ],
    summary:
      'An order service built milestone by milestone to practise messaging reliability on RabbitMQ: a transactional outbox, retries with backoff, a dead-letter queue and idempotent consumers, backed by layered tests and a coverage gate in CI.',
    links: [{ label: 'GitHub', href: 'https://github.com/ME-Massine/Orderflow' }],
    highlights: [
      'Transactional outbox: the order and its event are written in one transaction',
      'Outbox worker retries FAILED events with exponential backoff and a max attempt',
      'Idempotent consumer backed by a JPA store, so duplicates are caught after restarts',
      'Listener retries 3 times, then dead-letters with origin headers for diagnosis',
      'Web, JPA and service test layers; JaCoCo gate in CI with Codecov reports',
    ],
    architecture: {
      nodes: [
        { id: 'client', label: 'API Client', x: 0, y: 1, kind: 'client' },
        { id: 'api', label: 'Order Service', x: 1, y: 1, kind: 'service' },
        { id: 'pg', label: 'PostgreSQL', x: 1, y: 2, kind: 'store' },
        { id: 'worker', label: 'Outbox Worker', x: 2, y: 2, kind: 'service' },
        { id: 'rabbit', label: 'RabbitMQ', x: 3, y: 1, kind: 'broker' },
        { id: 'consumer', label: 'Consumer', x: 4, y: 1, kind: 'service' },
        { id: 'idem', label: 'Processed IDs', x: 4, y: 0, kind: 'store' },
        { id: 'dlq', label: 'order.dlq', x: 4, y: 2, kind: 'broker' },
      ],
      edges: [
        ['client', 'api', 'REST v1'],
        ['api', 'pg', 'order+event'],
        ['pg', 'worker', 'poll'],
        ['worker', 'rabbit', 'publish'],
        ['rabbit', 'consumer'],
        ['consumer', 'idem', 'dedupe'],
        ['consumer', 'dlq', 'retries out'],
      ],
    },
    overview: [
      'Order processing is the classic place where at-least-once delivery hurts. A client retries, the broker redelivers, a worker crashes halfway, or the broker is down at the exact moment an order is saved. Each of these can produce a lost event or a duplicate effect unless the system is designed to expect them.',
      'OrderFlow is a single Spring Boot service, built through tagged releases from v0.1 to v0.10, that works through those failure modes one at a time. It exposes a versioned REST API for orders and emits an OrderCreatedEvent for every new order. The reliability work sits around that event: how it leaves the service, how it is retried, and how the consumer stays safe when it arrives twice. A second service and a cross-service flow (inventory, payment) are the next milestone, not something it does today.',
    ],
    approach: [
      'The service follows a strict controller, service and repository layering, with DTOs kept separate from entities, a global exception handler that returns structured ApiError and ValidationError bodies, and OpenAPI docs. Creating an order writes the order row and an outbox_events row in the same transaction. A scheduled worker picks up PENDING and retry-eligible FAILED events, publishes them to RabbitMQ, and marks them PUBLISHED or FAILED with an attempt count and a failure reason.',
      'On the consuming side, a listener checks each eventId against a JPA-backed idempotency store before handling it. Spring AMQP retries failed messages three times with exponential backoff, then republishes them to a dead-letter queue with the original exchange and routing key attached as headers, and a dedicated DLQ consumer logs the full context. Micrometer counters track consumed, duplicate, failed, dead-lettered and outbox events. CI builds, tests, enforces coverage and uploads to Codecov.',
    ],
    decisions: [
      {
        title: 'Outbox instead of publishing in the request',
        body: 'Publishing straight to RabbitMQ after saving the order leaves a gap: the database commit succeeds, the publish fails, and the event is gone. Writing the event to an outbox table in the same transaction closes that gap. I tested it by stopping the broker: events were marked FAILED with their attempt count, then published once the broker came back.',
      },
      {
        title: 'Idempotency at the consumer, and persisted',
        body: 'RabbitMQ gives at-least-once delivery, so duplicates are expected, not exceptional. The first version used an in-memory store, which forgets everything on restart. Moving it to a JPA store in PostgreSQL means a redelivered message is still recognized after the service restarts.',
      },
      {
        title: 'A publisher abstraction around the broker',
        body: 'Domain code calls an EventPublisher interface. RabbitMQ is one implementation of it, so the order logic never touches AMQP types. That kept the service tests simple and leaves room to change transport later without editing business code.',
      },
      {
        title: 'Small versioned milestones',
        body: 'Each capability shipped as its own tagged release with its own tests: publisher, then consumer and retries, then the DLQ and metrics, then the outbox. Working in vertical slices meant the project was always in a working state, and the release history reads as a record of the reliability story.',
      },
    ],
    learnings: [
      'The biggest shift was treating failure as a normal input. Once I assumed every message could arrive twice and every publish could fail, the design questions became concrete: where is the event stored, who retries it, and how does the consumer know it has seen it before. The outbox and the idempotency store are not complicated, but they only work if you decide on them before the first incident.',
      'I also learned to test reliability by breaking things on purpose. Stopping RabbitMQ and watching outbox rows move from FAILED to PUBLISHED told me more than any unit test about whether the design held up.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 4. AI Student Support Navigator
  // ---------------------------------------------------------------------------
  {
    slug: 'student-support-navigator',
    name: 'AI Student Support Navigator',
    kicker: 'Imagine Cup AI assistant',
    year: '2025–26',
    role: 'Team project — my part: main developer',
    status: 'Live MVP',
    tags: ['cloud-ai'],
    featured: true,
    stack: [
      'Next.js 16',
      'React 19',
      'TypeScript',
      'Azure OpenAI',
      'Azure AI Content Safety',
      'Azure Cosmos DB',
      'Azure Communication Services',
      'Azure App Service',
      'GitHub Actions',
    ],
    summary:
      'A multilingual chat assistant that explains school rules, student rights and procedures to newly arrived students in English, French, Arabic or Spanish. Built on Azure OpenAI with Content Safety moderation for Microsoft Imagine Cup 2026, as a team entry where I was the main developer.',
    links: [
      { label: 'GitHub', href: 'https://github.com/ME-Massine/azure-ai-student-support' },
      {
        label: 'Live',
        href: 'https://ai-student-support-nav-apgqbwcjgya4fsad.swedencentral-01.azurewebsites.net/',
      },
    ],
    highlights: [
      'Streamed Azure OpenAI answers, scoped by a strict system prompt and usage policy',
      'Four languages and three modes: school rules, student rights, guidance',
      'Shared school chat where AI verdicts are posted as new messages, never edits',
      'Content Safety screens messages; flags and verifications are stored in Cosmos DB',
      'Deployed to Azure App Service through a GitHub Actions workflow',
    ],
    architecture: {
      nodes: [
        { id: 'student', label: 'Student', x: 0, y: 1, kind: 'client' },
        { id: 'ui', label: 'Next.js UI', x: 1, y: 1, kind: 'service' },
        { id: 'api', label: 'API routes', x: 2, y: 1, kind: 'service' },
        { id: 'aoai', label: 'Azure OpenAI', x: 3, y: 0, kind: 'external' },
        { id: 'safety', label: 'Content Safety', x: 3, y: 1, kind: 'external' },
        { id: 'cosmos', label: 'Cosmos DB', x: 3, y: 2, kind: 'store' },
        { id: 'acs', label: 'ACS chat', x: 3, y: 3, kind: 'external' },
      ],
      edges: [
        ['student', 'ui'],
        ['ui', 'api'],
        ['api', 'aoai', 'stream'],
        ['api', 'safety', 'moderate'],
        ['api', 'cosmos', 'metadata'],
        ['api', 'acs', 'deliver'],
      ],
    },
    overview: [
      'Students who have just arrived in a new school system, often in a language they are still learning, have to work out attendance rules, exam procedures and who to ask for help from documents written for people who already know the system. Teachers and counselors cannot give every student a personal explanation each time.',
      'The Navigator is a web chat that answers those questions in plain, age-appropriate language. The student picks a language (English, French, Arabic or Spanish) and a mode (school rules, student rights, or guidance) and gets a step-by-step answer. A second, shared school chat lets students talk to each other, with AI verification of messages against official rules and content moderation. We built it as a team for Microsoft Imagine Cup 2026, and I was the main developer. It is an MVP with demo school data.',
    ],
    approach: [
      'It is a single Next.js app with the backend in API routes. The assistant route builds a system prompt for the chosen language and mode, calls an Azure OpenAI deployment with streaming turned on, and turns the server-sent events into a plain text stream so answers appear as they are generated. A written usage policy sets the scope: institutional and administrative information only, no homework help, and no politics, religion, medical or legal advice.',
      'The shared chat keeps delivery and governance separate. Azure Communication Services is the transport layer (identities are simulated in the demo), and Cosmos DB stores threads, messages, AI verifications, moderation flags and official rule references. Azure AI Content Safety scores messages for hate, violence, self-harm and sexual content before they are published, and audit routes expose flags and verifications. A GitHub Actions workflow builds the app and deploys it to Azure App Service.',
    ],
    decisions: [
      {
        title: 'A narrow scope, enforced twice',
        body: 'A general chatbot in a school is a liability, so I wrote down what it may and may not answer and encoded that in the system prompt. Out-of-scope questions get a clear refusal, a short list of topics it can help with, and a pointer to school staff. For complex or ongoing problems it gently suggests talking to a counselor instead of trying to handle them itself.',
      },
      {
        title: 'The AI never edits a student’s message',
        body: 'In the shared chat, human messages are immutable. When the AI checks a message against school rules, its verdict is posted as a separate message and the verification is stored as its own record. That keeps a clear audit trail of who said what, which matters in a setting with minors.',
      },
      {
        title: 'Stream the answer',
        body: 'Waiting several seconds for a full completion feels broken, especially for a student who is already unsure. Streaming tokens from Azure OpenAI straight to the browser makes the assistant feel responsive without any extra infrastructure.',
      },
      {
        title: 'Keep transport and governance apart',
        body: 'ACS only delivers messages, while Cosmos DB holds everything needed for moderation and audit. Splitting them meant I could simulate the ACS identity for the demo without touching how verification and flags are stored.',
      },
    ],
    learnings: [
      'Most of the work on an AI feature turned out to be outside the model call. Deciding the scope, writing the refusal behavior, choosing what to log and making moderation part of the message flow took far more thought than calling Azure OpenAI. The prompt is the easy part; the policy around it is the product.',
      'It was also my first project deployed end to end on Azure, and wiring App Service, keys and a deployment workflow together taught me how much of shipping is configuration rather than code.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 5. IoT Health Monitoring Platform
  // ---------------------------------------------------------------------------
  {
    slug: 'iot-health',
    name: 'IoT Health Monitoring Platform',
    kicker: 'Real-time vitals monitoring',
    year: '2026',
    role: 'Solo — backend & frontend',
    status: 'Complete',
    tags: ['full-stack'],
    featured: true,
    stack: [
      'Java 17',
      'Spring Boot 3.5',
      'WebSocket (STOMP)',
      'PostgreSQL',
      'MQTT (Mosquitto)',
      'React 19',
      'Vite',
      'Python',
    ],
    summary:
      'A full-stack system where simulated medical devices send heart rate, temperature and SpO2 to a Spring Boot backend that stores each reading, raises threshold alerts and pushes both live to a React dashboard over WebSocket.',
    links: [{ label: 'GitHub', href: 'https://github.com/ME-Massine/IoT-Health-Monitoring-Platform' }],
    highlights: [
      'HTTP and optional MQTT ingestion converge on a single service method',
      'Warning and critical thresholds for heart rate, temperature and SpO2',
      'Global and per-patient STOMP topics, so the dashboard never polls',
      'Python simulator with gradual drift and 8 injectable anomaly scenarios',
      'Alert lifecycle: acknowledge, resolve, or dismiss as a false positive',
    ],
    architecture: {
      nodes: [
        { id: 'sim', label: 'Python sim', x: 0, y: 1, kind: 'client' },
        { id: 'mqtt', label: 'MQTT broker', x: 1, y: 0, kind: 'broker' },
        { id: 'ing', label: 'Ingestion', x: 2, y: 1, kind: 'service' },
        { id: 'alert', label: 'Alert rules', x: 3, y: 0, kind: 'service' },
        { id: 'ws', label: 'STOMP broker', x: 3, y: 1, kind: 'service' },
        { id: 'pg', label: 'PostgreSQL', x: 3, y: 2, kind: 'store' },
        { id: 'ui', label: 'React UI', x: 4, y: 1, kind: 'client' },
      ],
      edges: [
        ['sim', 'ing', 'HTTP POST'],
        ['sim', 'mqtt', 'publish'],
        ['mqtt', 'ing', 'subscribe'],
        ['ing', 'alert', 'evaluate'],
        ['ing', 'pg', 'save'],
        ['ing', 'ws', 'vitals'],
        ['alert', 'ws', 'alerts'],
        ['ws', 'ui', 'WebSocket'],
      ],
    },
    overview: [
      'Continuous patient monitoring depends on a data path that is easy to describe and fiddly to build: a device produces readings, something has to receive and check them, dangerous values must turn into alerts, and the people watching need to see all of it without refreshing a page. I wanted to build a small but complete version of that path.',
      'The platform simulates connected devices attached to patients, ingests their vital signs, detects abnormal heart rate, temperature and SpO2, and shows patients, history and alerts on a live dashboard. No hardware is needed: a Python simulator drives the whole demo. It does not try to be real medical software. It models the parts that matter for the backend: time-ordered readings, alert generation and low-latency push.',
    ],
    approach: [
      'The backend is a layered Spring Boot 3.5 service with thin controllers, a service layer that owns the ingestion pipeline, JPA entities for patients, devices, vital signs and alerts, and DTO mappers in between. Every reading goes through the same method: resolve the device to its patient, save the reading, evaluate the thresholds, save an alert if one is triggered, then publish to global and per-patient STOMP topics. Readings arrive over HTTP, or over MQTT when that path is turned on.',
      'The React dashboard subscribes through STOMP over SockJS and updates patient cards, charts and the alert center as messages arrive. The simulator registers device codes, checks them against the API at startup, and produces readings that drift gradually instead of jumping at random, with a configurable rate of injected anomalies. The REST API is documented with Swagger, and the services and controllers have unit tests.',
    ],
    decisions: [
      {
        title: 'Push over polling',
        body: 'Vitals are a stream, so clients should not be asking “anything new?” several times a second. Spring’s WebSocket support with STOMP gave me topic routing for free: a dashboard can follow every patient, or just one, without opening a new connection.',
      },
      {
        title: 'One pipeline, two transports',
        body: 'MQTT was added later as an optional path, enabled with a single config flag. Instead of a second ingestion flow, the MQTT listener calls the same service method as the HTTP endpoint, so storage, alerting and broadcasting behave the same whichever way a reading arrives.',
      },
      {
        title: 'The simulator lives outside the backend',
        body: 'Keeping devices in a separate Python process forced me to design the ingestion API as if real devices were calling it: versioned endpoints, validation, and rejecting unknown device codes. It also made demos and load easy: start more simulators.',
      },
      {
        title: 'Plain threshold rules',
        body: 'Three vitals with warning and critical bands do not need a rules engine. The thresholds are plain code in the alert service, mirrored in the frontend for status colors, and easy to cover with unit tests.',
      },
    ],
    learnings: [
      'Push is a contract. Once the dashboard depends on live updates, every backend change has to consider what happens to open subscriptions and topic names. I also found that time-series data rewards boring schemas: readings are written once and read by time range, so I kept them simple.',
      'If I took this further, I would move alerting behind a message broker so rules can scale separately from ingestion, and switch to a time-series store once volumes justified it. That decoupled version of the problem is what PulseStream explores.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 6. E-Recruitment System
  // ---------------------------------------------------------------------------
  {
    slug: 'e-recruitment',
    name: 'E-Recruitment System',
    kicker: 'Hiring workflow platform',
    year: '2026',
    role: 'Team of 2 — my part: most of the backend API',
    status: 'MVP',
    tags: ['full-stack'],
    featured: false,
    stack: [
      'Java 17',
      'Spring Boot 3.5',
      'Spring Security',
      'JWT',
      'Spring Data JPA',
      'PostgreSQL',
      'React 19',
      'TypeScript',
      'Tailwind CSS',
    ],
    summary:
      'A recruitment platform for candidates, recruiters and admins covering job offers, applications with status tracking, notifications and a candidate-to-job match score. We were a team of two, and I wrote most of the Spring Boot API.',
    links: [{ label: 'GitHub', href: 'https://github.com/MsdAmine/e-recrutement-system' }],
    highlights: [
      'Stateless JWT auth with role-based access for candidates, recruiters, admins',
      'Application workflow with a duplicate-apply guard and recruiter status updates',
      'Match score: 60% weighted rules, 40% embedding similarity, rules-only fallback',
      'Notifications on new applications and status changes, with read/unread state',
      'Integration guide written first so frontend work could proceed in parallel',
    ],
    architecture: {
      nodes: [
        { id: 'spa', label: 'React SPA', x: 0, y: 1, kind: 'client' },
        { id: 'jwt', label: 'JWT filter', x: 1, y: 1, kind: 'service' },
        { id: 'jobs', label: 'Job offers', x: 2, y: 0, kind: 'service' },
        { id: 'apps', label: 'Applications', x: 2, y: 1, kind: 'service' },
        { id: 'match', label: 'Matching', x: 2, y: 2, kind: 'service' },
        { id: 'notif', label: 'Notifications', x: 3, y: 1, kind: 'service' },
        { id: 'pg', label: 'PostgreSQL', x: 4, y: 1, kind: 'store' },
        { id: 'emb', label: 'Embeddings API', x: 3, y: 3, kind: 'external' },
      ],
      edges: [
        ['spa', 'jwt', 'Bearer'],
        ['jwt', 'jobs'],
        ['jwt', 'apps'],
        ['jwt', 'match'],
        ['apps', 'notif', 'status'],
        ['jobs', 'pg'],
        ['notif', 'pg'],
        ['match', 'emb', 'vectors'],
      ],
    },
    overview: [
      'Recruitment looks simple from the outside: post a job, receive applications, move candidates through stages. In practice every step has a different actor with different permissions. Candidates apply and follow their applications, recruiters manage their own offers and the people who applied to them, and admins supervise the platform. If the access model is wrong, everything built on top of it inherits the bug.',
      'This was a two-person project. I built most of the backend: the project foundation, registration and login, JWT authentication, the job offer, application and notification modules, candidate and recruiter profiles, pagination and dashboard summaries, plus the integration guide and part of the frontend. My teammate led most of the React frontend and the admin features. It is an MVP: the core workflows work end to end, and things like CV upload and a refresh-token flow are still missing.',
    ],
    approach: [
      'The backend is organized by domain package (auth, users, candidates, recruiters, jobs, applications, notifications, matching, admin), each with its own controller, service, repository and DTOs. A JWT filter authenticates every request, route rules handle the public versus authenticated split, and method-level security enforces roles per endpoint. Applying twice to the same offer is rejected, and recruiters can update an application’s status, which notifies the candidate.',
      'Matching combines a rule-based score (skills 40%, experience 25%, location 15%, salary 10%, contract type 10%) with a semantic score from text embeddings, weighted 60/40. Embeddings are cached, and if the provider is unavailable the match falls back to the rule-based score. The frontend is a React and TypeScript SPA with role-specific dashboards and protected routes.',
    ],
    decisions: [
      {
        title: 'Stateless JWT, not sessions',
        body: 'Sessions would have been simpler, but a separately developed SPA calling a REST API fits bearer tokens better, and I wanted to understand the JWT flow end to end. Expired and malformed tokens get a clean 401 instead of a stack trace. A refresh-token flow is on the list, not done.',
      },
      {
        title: 'Roles enforced next to the endpoint',
        body: 'Route-level rules cover the coarse split between public and authenticated, and method security handles the roles. Keeping the access rule beside the endpoint it protects makes it easy to review, instead of spreading checks through service code.',
      },
      {
        title: 'Hybrid matching with a fallback',
        body: 'A pure embedding score is hard to explain to a recruiter, and pure keyword rules miss obvious similarities. Combining a weighted rule score with semantic similarity gives a number that can be broken down, and falling back to the rules means matching still works when the embedding API is down or unconfigured.',
      },
      {
        title: 'Write the API contract down first',
        body: 'With backend and frontend built in parallel, I wrote a backend integration guide covering endpoints, payloads and role access, and we agreed not to change contracts without telling each other. It cost an afternoon and saved a lot of broken screens.',
      },
    ],
    learnings: [
      'Auth is an area where “almost right” is wrong. Building the JWT flow myself, including error handling for bad tokens, gave me a much clearer idea of what Spring Security does for me and what I would hand to an identity provider in a real product.',
      'Working on one side of an interface while someone else works on the other taught me that design happens at the boundary. Every assumption about a DTO had to be written down, and the times we skipped that were the times something broke.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 7. Learnova
  // ---------------------------------------------------------------------------
  {
    slug: 'learnova',
    name: 'Learnova',
    kicker: 'Online learning platform',
    year: '2026',
    role: 'Team of 2 — my part: most of the backend and frontend',
    status: 'Academic project — 4th-year PFA',
    tags: ['full-stack'],
    featured: false,
    stack: [
      'Java 17',
      'Spring Boot 3.5',
      'Spring Security',
      'JWT',
      'PostgreSQL',
      'React 19',
      'TypeScript',
      'Vite',
      'Cloudinary',
      'Jitsi',
      'OpenPDF',
    ],
    summary:
      'An online learning platform where one account can act as a learner or, once approved, an instructor. It covers courses with sections and lessons, enrollment and progress tracking, quizzes, live sessions on Jitsi and PDF certificates. Built by a team of two as our 4th-year PFA; I wrote most of the code.',
    links: [{ label: 'GitHub', href: 'https://github.com/MsdAmine/learnova-platform' }],
    highlights: [
      'One account, two profiles; the backend checks which profiles are available on every request',
      'Admin approval before anyone can publish courses as an instructor',
      'Content endpoints gated by enrollment; non-enrolled users get 404, not 403',
      'Live sessions with generated Jitsi rooms and idempotent attendance on join',
      'Cloudinary uploads go through the backend; certificates are rendered as PDFs on demand',
      'About 240 backend tests and a Vitest suite for the frontend',
    ],
    architecture: {
      nodes: [
        { id: 'spa', label: 'React app', x: 0, y: 1, kind: 'client' },
        { id: 'auth', label: 'JWT · profiles', x: 1, y: 1, kind: 'service' },
        { id: 'courses', label: 'Courses', x: 2, y: 0, kind: 'service' },
        { id: 'enroll', label: 'Enrollment', x: 2, y: 1, kind: 'service' },
        { id: 'live', label: 'Live sessions', x: 2, y: 2, kind: 'service' },
        { id: 'cert', label: 'Certificates', x: 3, y: 0, kind: 'service' },
        { id: 'pg', label: 'PostgreSQL', x: 3, y: 1, kind: 'store' },
        { id: 'jitsi', label: 'Jitsi', x: 3, y: 2, kind: 'external' },
        { id: 'media', label: 'Cloudinary', x: 1, y: 3, kind: 'external' },
      ],
      edges: [
        ['spa', 'auth', 'Bearer'],
        ['auth', 'courses', 'instructor'],
        ['auth', 'enroll', 'learner'],
        ['auth', 'live'],
        ['courses', 'cert', 'completed'],
        ['enroll', 'pg'],
        ['live', 'jitsi', 'room'],
        ['auth', 'media', 'uploads'],
      ],
    },
    overview: [
      'Most learning platforms treat learners and instructors as separate user types, with separate logins and dashboards. That does not match how people actually move through education: someone who teaches a course this semester might take one the next.',
      'Learnova is our 4th-year PFA, built by a team of two. A single account starts with a learner profile, can request instructor access, and after an admin approves it can switch between the two modes. I built most of it: authentication and profile switching, the instructor approval workflow, courses with sections and lessons, enrollment, live sessions, media uploads and most of the React frontend. My teammate built lesson progress, quizzes, the wishlist and the certificates backend.',
    ],
    approach: [
      'The backend is a Spring Boot modular monolith organized by domain (auth, user, profile, course, enrollment, live session, certificate, media), with decisions recorded as ADRs. Instructor endpoints check role, approval and course ownership, and editing an archived course returns a 409. Learner endpoints resolve the profile from the authenticated user, so no profile id ever appears in a URL.',
      'Live sessions generate a random Jitsi room, and joining checks enrollment and session status before recording attendance. Profile images and course thumbnails are validated and uploaded to Cloudinary by the backend, which keeps the credentials. Certificates are issued once a learner has finished every lesson and passed each published quiz, and the PDF is generated on demand with OpenPDF. The frontend is a React and TypeScript app on Vite, with route guards for learners, instructors and admins.',
    ],
    decisions: [
      {
        title: 'A profile you switch, not a second account',
        body: 'Two accounts would have been simpler to build, but they are the wrong model for users. The frontend remembers which profile is active, and the backend stays stateless: it lists the profiles a user may use and checks every switch and every request against roles and approval status.',
      },
      {
        title: '404 instead of 403 for course content',
        body: 'A learner who is not enrolled gets the same 404 for a course’s lessons, quizzes or progress as they would for a course that does not exist. That way the API does not reveal which content exists for courses they have not joined.',
      },
      {
        title: 'Media goes through the backend',
        body: 'Unsigned uploads straight from the browser to Cloudinary would have been quicker to wire up, but they expose the upload preset and skip validation. Uploads go through a MediaStorageService that checks the type and size first and cleans up the previous file on replacement.',
      },
      {
        title: 'Use Jitsi for live video',
        body: 'Building video calls was out of scope, so an ADR settled on Jitsi. The backend only owns scheduling, access and attendance, and the room opens in a new tab. It is a deliberately small first version: no embedding, no recurring sessions, no reminders.',
      },
    ],
    learnings: [
      'The dual-profile model was the most interesting part. Once we committed to “one user, many profiles”, a lot of complexity I had planned for, such as linking accounts and transferring roles, simply disappeared.',
      'We kept a CURRENT_STATE file that recorded what was implemented and what was still missing, and it made planning with two people much easier. It is the same habit I now use on PulseStream and MASID.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 8. WashFlow — Car Wash Management System
  // ---------------------------------------------------------------------------
  {
    slug: 'car-wash',
    name: 'WashFlow',
    kicker: 'Car wash management system',
    year: '2026',
    role: 'Team of 2 — my part: bookings, payments, staff ops',
    status: 'Live demo',
    tags: ['full-stack'],
    featured: false,
    stack: [
      'Java 17',
      'Spring Boot 3.5',
      'Spring Security',
      'JWT',
      'PostgreSQL',
      'React',
      'TypeScript',
      'Tailwind CSS',
    ],
    summary:
      'A booking and operations app for a small car wash. Customers book a service and time slot, admins assign washers and track payments, and washers work from a phone-friendly job queue. A two-person build with a Spring Boot API and a React front end.',
    links: [
      { label: 'GitHub', href: 'https://github.com/MsdAmine/Car-Wash-Management-System' },
      { label: 'Live', href: 'https://car-wash-management-system-lilac.vercel.app' },
    ],
    highlights: [
      'Booking lifecycle (pending, confirmed, completed, cancelled) enforced server-side',
      'Available-slot lookup and configurable operating hours',
      'Separate layouts per role: admin desktop, client booking, washer mobile queue',
      'Manual payment tracking, washer assignment, booking stats and activity heatmap',
    ],
    architecture: {
      nodes: [
        { id: 'customer', label: 'Customer', x: 0, y: 0, kind: 'client' },
        { id: 'admin', label: 'Admin', x: 0, y: 1, kind: 'client' },
        { id: 'washer', label: 'Washer', x: 0, y: 2, kind: 'client' },
        { id: 'spa', label: 'React SPA', x: 1, y: 1, kind: 'service' },
        { id: 'api', label: 'Spring API', x: 2, y: 1, kind: 'service' },
        { id: 'booking', label: 'Bookings', x: 3, y: 0, kind: 'service' },
        { id: 'pay', label: 'Payments', x: 3, y: 1, kind: 'service' },
        { id: 'dash', label: 'Dashboards', x: 3, y: 2, kind: 'service' },
        { id: 'pg', label: 'PostgreSQL', x: 4, y: 1, kind: 'store' },
      ],
      edges: [
        ['customer', 'spa'],
        ['admin', 'spa'],
        ['washer', 'spa'],
        ['spa', 'api', 'JWT'],
        ['api', 'booking'],
        ['api', 'pay'],
        ['api', 'dash'],
        ['booking', 'pg'],
        ['pay', 'pg'],
        ['dash', 'pg'],
      ],
    },
    overview: [
      'Small car washes often run on phone calls and paper. WashFlow replaces that with one structured workflow: a client picks a vehicle, a service and a slot, an admin assigns a washer, the washer marks the job done, and the admin tracks payments and the day’s activity. We built it as a team of two. My commits cover the booking workflow, wash service management, payment tracking, employee operations, dashboards, available slots, operating hours and password reset, along with frontend integration work.',
    ],
    approach: [
      'A Spring Boot API secured with JWT serves three roles. Bookings move through PENDING, CONFIRMED and COMPLETED, or to CANCELLED, and the server rejects any other transition. When a booking is created, its end time comes from the service duration and its total price from the service price at that moment. The React and TypeScript front end has a separate layout for each role, and CI builds both the backend and the frontend on every push.',
    ],
    decisions: [
      {
        title: 'The server owns the booking rules',
        body: 'Status transitions, the 30-minute to 90-day booking window, vehicle ownership and active-service checks all live in the API, not the UI. The price is copied onto the booking when it is made, so changing a service’s price later does not rewrite past bookings.',
      },
      {
        title: 'Density depends on the role',
        body: 'Admins work at a desk and need scannable data. Washers are on a phone in a parking lot and need today’s queue and nothing else. We wrote that down as design principles before redesigning the screens, which kept the three layouts from drifting into one generic dashboard.',
      },
      {
        title: 'Issue-sized pull requests',
        body: 'We broke the work into phases (services, bookings, payments, employee ops, dashboards) and each phase into numbered issues and small PRs. With two people working on the same codebase, that made reviews quick and merges uneventful.',
      },
    ],
    learnings: [
      'Modelling the booking as an explicit state machine early saved us from a whole class of bugs. Once only a few transitions were legal and the server enforced them, the UI could stay simple. Working in small, issue-linked PRs with a teammate also showed me how much smoother collaboration gets when every change is small enough to review in a few minutes.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 9. SkyCast
  // ---------------------------------------------------------------------------
  {
    slug: 'skycast',
    name: 'SkyCast',
    kicker: 'Android weather app',
    year: '2025',
    role: 'Solo — Android',
    status: 'Complete',
    tags: ['mobile-web'],
    featured: false,
    stack: ['Java', 'Android SDK', 'Retrofit 2', 'Gson', 'Glide', 'Fused Location', 'Material Components', 'OpenWeather API'],
    summary:
      'A native Android weather app in Java. Search any city or use the device’s GPS location to get current conditions from the OpenWeather API, shown in a Material UI with weather icons loaded on demand.',
    links: [{ label: 'GitHub', href: 'https://github.com/ME-Massine/SkyCast' }],
    highlights: [
      'City search and GPS lookup through FusedLocationProviderClient',
      'Retrofit and Gson map OpenWeather JSON to typed model classes',
      'Asynchronous calls with loading indicators and error handling',
      'Weather icons fetched from OpenWeather’s CDN with Glide',
    ],
    architecture: {
      nodes: [
        { id: 'user', label: 'User', x: 0, y: 1, kind: 'client' },
        { id: 'app', label: 'Android app', x: 1, y: 1, kind: 'service' },
        { id: 'gps', label: 'Fused Location', x: 1, y: 0, kind: 'external' },
        { id: 'retro', label: 'Retrofit', x: 2, y: 1, kind: 'service' },
        { id: 'ow', label: 'OpenWeather', x: 3, y: 1, kind: 'external' },
        { id: 'glide', label: 'Glide', x: 2, y: 2, kind: 'service' },
        { id: 'icons', label: 'Icon CDN', x: 3, y: 2, kind: 'external' },
      ],
      edges: [
        ['user', 'app', 'city / GPS'],
        ['app', 'gps', 'location'],
        ['app', 'retro'],
        ['retro', 'ow', 'GET'],
        ['app', 'glide'],
        ['glide', 'icons'],
      ],
    },
    overview: [
      'I built SkyCast to get comfortable with native Android in Java: XML layouts, runtime permissions, location services and calling a REST API from a mobile client. You type a city or tap to use your current location, and the app shows temperature, conditions and wind from the OpenWeather API.',
    ],
    approach: [
      'The code is split into data models, a Retrofit client and service interface, and two activities: a splash screen and the main screen. City search and coordinate lookup hit the two current-weather endpoints. For location, the app asks for the fine-location permission, reads the last known position from FusedLocationProviderClient, and calls the coordinate endpoint. Glide loads the condition icon from OpenWeather’s icon CDN.',
    ],
    decisions: [
      {
        title: 'Typed models over manual JSON parsing',
        body: 'Retrofit with a Gson converter maps the response straight onto small model classes (main, weather, wind, sys). Malformed fields become a compile-time question instead of a runtime crash, and the networking code stays short.',
      },
      {
        title: 'Last known location first',
        body: 'Using the fused provider’s last known location gives a near-instant result without keeping GPS active. For a weather app, a position from a few minutes ago is accurate enough.',
      },
    ],
    learnings: [
      'Mobile work made me think about failure from the user’s side: no network, permission denied, a city that does not exist. Each needed a visible state instead of a silent failure. Next on the list are a forecast view, saved cities with Room, and moving the screen logic to MVVM.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 10. FreelanceHub
  // ---------------------------------------------------------------------------
  {
    slug: 'freelancehub',
    name: 'FreelanceHub',
    kicker: 'Freelance marketplace',
    year: '2025',
    role: 'Team of 3 — my part: chat, AI tasks, email',
    status: 'Academic project',
    tags: ['mobile-web'],
    featured: false,
    stack: ['Python', 'Django', 'Django Channels', 'Redis', 'SQLite', 'Bootstrap', 'Together AI'],
    summary:
      'A Django marketplace where clients post missions and freelancers apply, track progress and chat in real time. Built by a team of three; I worked on the WebSocket chat, AI-generated task breakdowns and email notifications.',
    links: [{ label: 'GitHub', href: 'https://github.com/ME-Massine/FreelanceHub' }],
    highlights: [
      'Real-time client–freelancer chat over Django Channels with a Redis layer',
      'LLM-generated task breakdowns from a mission description',
      'Email notifications for proposals, plus accept/reject flows for applications',
      'Duplicate-application guard and freelancer profile picture uploads',
    ],
    architecture: {
      nodes: [
        { id: 'browser', label: 'Browser', x: 0, y: 1, kind: 'client' },
        { id: 'smtp', label: 'SMTP', x: 1, y: 0, kind: 'external' },
        { id: 'views', label: 'Django views', x: 1, y: 1, kind: 'service' },
        { id: 'channels', label: 'Channels', x: 1, y: 2, kind: 'service' },
        { id: 'ai', label: 'Together AI', x: 2, y: 0, kind: 'external' },
        { id: 'db', label: 'SQLite', x: 2, y: 1, kind: 'store' },
        { id: 'redis', label: 'Redis', x: 2, y: 2, kind: 'broker' },
      ],
      edges: [
        ['browser', 'views', 'HTTP'],
        ['browser', 'channels', 'WebSocket'],
        ['views', 'smtp', 'notify'],
        ['views', 'ai', 'task gen'],
        ['views', 'db'],
        ['channels', 'redis', 'groups'],
        ['channels', 'db', 'history'],
      ],
    },
    overview: [
      'FreelanceHub connects clients who post missions with freelancers who apply to them. Each side has its own dashboard: clients manage missions and applicants, and freelancers manage services, current missions and progress. We built it as a team of three for a Python course. My parts were the real-time chat, the AI task generation, the email notifications and the application accept/reject flow.',
    ],
    approach: [
      'It is a Django project with separate apps for clients, freelancers and chat, using server-rendered templates with Bootstrap. The chat runs on Django Channels behind Daphne, with a Redis channel layer for room groups; messages are stored so a room replays its history when you connect. When a client creates a mission, its description can be sent to an LLM through the Together API (Mixtral) to suggest a list of tasks for the freelancer.',
    ],
    decisions: [
      {
        title: 'Channels for chat, not polling',
        body: 'Polling an endpoint for new messages would have worked for a demo but felt sluggish. Django Channels let the chat share the same models and auth as the rest of the site, and the Redis layer handles fan-out to everyone in a room.',
      },
      {
        title: 'Notifications must not break the request',
        body: 'Proposal emails are sent with failures silenced, so a misconfigured mail server cannot stop a freelancer from applying. Notification is a side effect, so it should never decide whether the main action succeeds.',
      },
    ],
    learnings: [
      'This was my first time adding real-time features and an LLM call to a web app, and both taught me the same thing: anything outside your process, whether a socket, a mail server or a model API, needs a plan for when it is slow or down. It was also my first experience splitting a codebase between three people, which is where I started caring about clean merges.',
    ],
  },
];
