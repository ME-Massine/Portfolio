export const PROFILE = {
  name: 'Massine Amakhtari',
  occupation: 'Backend engineer',
  location: 'Rabat, Morocco',
  timeZone: 'Africa/Casablanca',
  status: 'Open for PFE · Feb 2027',
  statusLong: 'Looking for a 6-month PFE internship starting February 2027',
  email: 'massine000@gmail.com',
  cv: '/Massine-Amakhtari-CV.pdf',
  portrait: '/images/massine.jpg',
  headline: 'Backend engineer — distributed systems, event-driven & cloud-native architecture',
  socials: [
    { label: 'GitHub', href: 'https://github.com/ME-Massine' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/massine-amakhtari-48b815261/' },
  ],
  intro:
    'I’m a final-year software engineering student at EMSI in Rabat. I build backend systems — Java and Spring Boot, Kafka and RabbitMQ, PostgreSQL, Docker and Kubernetes — and I care most about the parts users never see: how data moves between services, how systems stay consistent under failure, and how you can tell what they’re doing.',
  about: [
    'I got pulled toward the backend the first time I had to figure out how a simple CRUD app actually behaves under concurrent requests. Since then the questions I find most interesting are about failure: what happens when a consumer dies mid-message, when a retry runs twice, when two services disagree about the state of an order.',
    'Most of my recent work is in Java with Spring Boot, but I treat the language as a tool. What I focus on is clean module boundaries, picking the right messaging pattern for the problem — Saga, Outbox, idempotent consumers, dead-letter queues — and wiring observability in before features so the system can explain itself.',
    'Outside of coursework I build projects end to end, from the first architecture sketch to Kubernetes manifests and CI. I’m looking for a team that ships serious systems, where I can keep learning from people who’ve operated them — and contribute carefully while I do.',
  ],
  experience: [
    {
      period: '2026 — present',
      title: 'Freelance Full-Stack Developer',
      place: 'MASID — case coordination platform',
      desc: 'Building the case-coordination side of a multilingual platform for a Moroccan association, in a team of two: accounts and permissions, the case and referral workflow, private attachments, audit and data retention, on Laravel, Inertia and React.',
    },
    {
      period: '3rd-year PFA · 6 weeks',
      title: 'Software Engineering Intern',
      place: 'MAMSI Consulting & Event',
      desc: 'Contributed to backend development and feature implementation. Translated business requirements into technical solutions and worked with stakeholders to deliver production-ready features.',
    },
  ],
  education: [
    {
      period: '2022 — 2027',
      title: 'Engineering Degree, Software Development',
      place: 'EMSI — École Marocaine des Sciences de l’Ingénieur, Rabat',
      desc: 'Final year of the engineering cycle. Distributed systems, databases, software architecture, networks and algorithms.',
    },
  ],
  certifications: [
    {
      period: 'June 2024',
      title: 'ALX Software Engineering — Back-End Track',
      place: 'ALX',
      desc: 'Backend development, API architecture, database systems and DevOps fundamentals.',
    },
    {
      period: 'April 2025',
      title: 'Python for Data Science, AI & Development',
      place: 'IBM · Coursera',
      desc: 'Python for data analysis, scientific computing and AI fundamentals.',
    },
  ],
  skills: [
    { group: 'Core', items: ['Distributed systems', 'Event-driven architecture', 'Microservices'] },
    { group: 'Languages', items: ['Java', 'SQL', 'JavaScript / TypeScript', 'PHP', 'Python'] },
    { group: 'Backend', items: ['Spring Boot', 'Laravel', 'REST API design', 'WebSocket', 'JWT / RBAC'] },
    { group: 'Messaging', items: ['Apache Kafka', 'RabbitMQ'] },
    { group: 'Data', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
    { group: 'Cloud & DevOps', items: ['Docker', 'Kubernetes', 'GitHub Actions', 'Azure'] },
    { group: 'Observability', items: ['Prometheus', 'Grafana', 'OpenTelemetry', 'Micrometer'] },
    { group: 'Patterns', items: ['Saga', 'Outbox', 'Idempotency', 'DLQ & replay'] },
  ],
  languages: ['Arabic — native', 'French — fluent', 'English — fluent', 'Spanish — basic'],
};
