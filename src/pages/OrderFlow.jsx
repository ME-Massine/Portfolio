import React from 'react';
import { ProjectDetail } from '../components.jsx';
import { OrderFlowDiagram } from '../diagrams.jsx';

const data = {
  slug: 'orderflow',
  name: 'OrderFlow',
  oneliner: 'A microservice-based order processing system using asynchronous messaging for inter-service communication and idempotency keys for exactly-once order handling, with metrics exposed for observability.',
  role: 'Solo · backend + infra',
  year: '2024',
  status: 'Open-sourced',
  stack: ['Microservices', 'RabbitMQ', 'Spring Boot', 'PostgreSQL', 'Prometheus', 'Docker'],
  links: [{ label: 'github', href: 'https://github.com/ME-Massine' }],
  diagram: OrderFlowDiagram,
  problem: [
    'Order processing is the canonical example of why exactly-once is hard. A user clicks "place order" twice; the network hiccups; a worker crashes mid-flow. Each of these can produce duplicate effects — a double charge, a double shipment, a wrong inventory count — unless the system is designed to recognize and ignore retries.',
    'I built OrderFlow to work through that problem honestly: not by claiming exactly-once at the messaging layer, but by making the consumers idempotent enough that at-least-once delivery becomes acceptable.',
  ],
  approach: [
    'An API gateway accepts orders and publishes events to RabbitMQ. Inventory, payment, fulfillment, and notification services consume those events and react. Each service owns its own database and exposes an API only for queries, not for cross-service writes.',
    'Idempotency keys ride along with every event. Each consumer records the keys it has already processed; duplicate deliveries are detected and dropped. Prometheus scrapes counters from every service so I can see when retries spike.',
  ],
  decisions: [
    {
      title: 'Idempotency at the consumer, not the broker',
      body: 'RabbitMQ gives at-least-once. Trying to bolt exactly-once onto the broker is fragile. Making each consumer idempotent — record the key, drop duplicates — is the boring, robust answer.',
    },
    {
      title: 'Database-per-service',
      body: 'It\'s tempting to share a database across microservices for simplicity. I didn\'t. The whole point of services is independent change; a shared schema reintroduces every coupling I was trying to remove.',
    },
    {
      title: 'Events, not commands',
      body: 'The API gateway publishes "OrderPlaced", not "ChargePayment" or "ReserveInventory". Each service decides what to do with the event. Adding a new reaction (analytics, audit) means adding a new consumer, not editing the publisher.',
    },
    {
      title: 'Metrics from day one',
      body: 'Counters for orders received, events published, retries, failures. Without them, debugging async flows is mostly speculation. With them, you can usually point at the issue within a minute.',
    },
  ],
  learnings: [
    'The hardest part of microservices isn\'t writing them — it\'s resisting the urge to share things between them. Every shortcut becomes load-bearing.',
    'Idempotency was the concept I learned the most from. Once you internalize "design every consumer so retrying is safe," a whole category of distributed-systems pain goes away. It\'s not free, but it\'s very cheap compared to chasing exactly-once.',
  ],
  next: { slug: 'iot-health', name: 'IoT Health Monitoring Platform' },
};

export default function OrderFlow() {
  return <ProjectDetail {...data} />;
}
