import React from 'react';
import { ProjectDetail } from '../components.jsx';
import { IoTDiagram } from '../diagrams.jsx';

const data = {
  slug: 'iot-health',
  name: 'IoT Health Monitoring Platform',
  oneliner: 'A full-stack platform that simulates connected medical devices streaming patient vitals to a Spring Boot backend, with real-time anomaly detection and WebSocket push to the frontend.',
  role: 'Solo · backend + frontend',
  year: '2025',
  status: 'Open-sourced',
  stack: ['Java', 'Spring Boot', 'WebSocket', 'PostgreSQL', 'React', 'TypeScript', 'Docker'],
  links: [{ label: 'github', href: 'https://github.com/ME-Massine' }],
  diagram: IoTDiagram,
  problem: [
    'Hospitals and clinics increasingly rely on connected devices for continuous patient monitoring, but the data path — from device to display — is rarely simple. I wanted to build a small but realistic version of that path: simulated devices producing vitals, a backend that ingests and validates them, threshold-based alerting, and a live dashboard that updates without polling.',
    'The goal wasn\'t to replace real medical hardware. It was to model the surface area: time-ordered sensor data, alert generation, and pushing state to clients with low latency.',
  ],
  approach: [
    'I split the system into three concerns: device simulation (producers), a Spring Boot service (ingest + alerting + persistence), and a React dashboard (live view). Devices send vitals over HTTP; the backend persists each reading, evaluates threshold rules in-process, and pushes both vitals and alerts to subscribed clients over WebSocket.',
    'I chose WebSocket over polling because vitals streams want push semantics — clients shouldn\'t have to ask "anything new yet?" twenty times a second. The PostgreSQL schema is intentionally narrow and append-only, indexed by (device_id, timestamp) for sequential reads.',
  ],
  decisions: [
    {
      title: 'WebSocket over Server-Sent Events',
      body: 'SSE was tempting for its simplicity, but I wanted bidirectional channels so clients could subscribe to specific patients/alert categories without tearing down connections. Spring\'s WebSocket + STOMP support made the routing model clean.',
    },
    {
      title: 'In-process threshold rules, not a rules engine',
      body: 'For five vitals and a handful of thresholds, a full rules engine would have been overkill. I kept the rules as plain Java objects with clear boundaries — easy to test, easy to swap for something heavier later.',
    },
    {
      title: 'Append-only schema',
      body: 'Vital readings are never updated. Modeling them as immutable rows simplifies reasoning, makes time-range queries straightforward, and matches how real time-series stores work even if I\'m using vanilla Postgres.',
    },
    {
      title: 'Device simulation as a separate service',
      body: 'Keeping simulators outside the backend forced me to design the ingestion API as if real devices would call it — versioned endpoints, schema validation, basic auth. It also made load testing trivial: spin up more simulators.',
    },
  ],
  learnings: [
    'Two things stuck with me. First, push is a contract — once clients depend on real-time updates, every backend change has to consider what happens to open subscriptions. Second, schemas for time-series data benefit from being boring: append-only, narrow, and indexed for the queries you actually run.',
    'If I rebuild this, I\'d move alerting onto a message broker so the rules service can scale independently of ingestion, and I\'d swap in a proper time-series store once volumes justify it. PulseStream is partly the answer to that thought experiment.',
  ],
  next: { slug: 'pulsestream', name: 'PulseStream' },
};

export default function IoTHealth() {
  return <ProjectDetail {...data} />;
}
