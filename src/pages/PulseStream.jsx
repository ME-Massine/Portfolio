import React from 'react';
import { ProjectDetail } from '../components.jsx';
import { PulseStreamDiagram } from '../diagrams.jsx';

const data = {
  slug: 'pulsestream',
  name: 'PulseStream',
  oneliner: 'A cloud-native event processing platform built around Kafka, designed for IoT telemetry ingestion and anomaly detection at high throughput, with integrated observability.',
  role: 'Solo · backend + infra',
  year: '2025',
  status: 'In progress',
  stack: ['Kafka', 'Spring Boot', 'Docker', 'Prometheus', 'Grafana', 'PostgreSQL', 'Redis'],
  links: [{ label: 'github', href: 'https://github.com/ME-Massine' }],
  diagram: PulseStreamDiagram,
  problem: [
    'After building the IoT health monitor, I wanted to push myself on the parts that platform glossed over: what happens when ingestion needs to scale beyond what one Spring Boot service can handle, when consumers fail mid-message, and when you actually need to see what the pipeline is doing.',
    'PulseStream is the deliberate, harder version of that problem — telemetry from many producers landing in a stream that fan out to multiple independent consumers, with the operability story taken seriously from day one.',
  ],
  approach: [
    'Kafka sits at the center as the durable log. Producers write to partitioned topics; consumers (anomaly detection, aggregation, alerting) form independent consumer groups. Each consumer is a small Spring Boot service that owns its own datastore — Postgres for windowed metrics, Redis for hot state.',
    'The whole thing runs in Docker, with Prometheus scraping metrics from every service and Grafana dashboards I actually use while developing. A dead-letter queue catches messages that fail repeatedly and lets me replay them after fixing the bug.',
  ],
  decisions: [
    {
      title: 'Kafka over a lighter broker',
      body: 'RabbitMQ would have been faster to set up, but I specifically wanted partitioned, replayable streams and the consumer-group model. Treating the log as the source of truth changes how you reason about replays and back-pressure.',
    },
    {
      title: 'One service per consumer concern',
      body: 'It would have been easier to put all consumers in one process. I kept them separate because that\'s where the real lessons live: independent deploys, independent scaling, and the discipline of a clear contract between services.',
    },
    {
      title: 'Observability before features',
      body: 'I wired Prometheus and Grafana before any business logic. Watching consumer lag in real time changed how I designed the consumers — you stop optimizing for throughput in the abstract and start optimizing for the metric you can see.',
    },
    {
      title: 'DLQ + replay over best-effort handling',
      body: 'Failed messages go to a DLQ topic with the original payload, the error, and a retry counter. Replays read from the DLQ. It\'s slightly more work than just logging-and-moving-on, and it pays for itself the first time you ship a bug.',
    },
  ],
  learnings: [
    'The hardest part isn\'t writing producers and consumers — it\'s keeping the system honest about its own state. Lag, retries, DLQ depth, partition skew: until you can see those, you\'re guessing.',
    'I also got a feel for how much of "distributed" is really about clear contracts. Every time I tightened the schema between two services, debugging got easier. Every time I let it drift, something downstream broke in confusing ways.',
  ],
  next: { slug: 'e-recruitment', name: 'E-Recruitment System' },
};

export default function PulseStream() {
  return <ProjectDetail {...data} />;
}
