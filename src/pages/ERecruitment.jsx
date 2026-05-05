import React from 'react';
import { ProjectDetail } from '../components.jsx';
import { ERecruitmentDiagram } from '../diagrams.jsx';

const data = {
  slug: 'e-recruitment',
  name: 'E-Recruitment System',
  oneliner: 'A recruitment management platform covering the full hiring workflow — job posting, applications, status tracking — with JWT authentication and role-based access for admins, recruiters, and applicants.',
  role: 'Solo · backend',
  year: '2024',
  status: 'Open-sourced',
  stack: ['Spring Boot', 'PostgreSQL', 'JWT', 'RBAC', 'Spring Security', 'Docker'],
  links: [{ label: 'github', href: 'https://github.com/ME-Massine' }],
  diagram: ERecruitmentDiagram,
  problem: [
    'Recruitment workflows look simple from the outside — post a job, get applications, move candidates through stages — but every step has different actors with different permissions. Get the access model wrong and the rest of the system inherits the bug.',
    'I built this to take security seriously: a single auth service, JWTs as the only way through the gate, and role-aware endpoints across the application APIs.',
  ],
  approach: [
    'A single Spring Boot service organized around clear bounded contexts: jobs, applications, users, notifications. Authentication issues short-lived JWTs at login; every protected endpoint resolves the role and scopes the response accordingly. Notifications are emitted as application events and handled asynchronously to keep the API fast.',
    'Postgres is the single source of truth, with referential integrity enforced at the database level — recruitment data is highly relational and I wanted those guarantees in writing.',
  ],
  decisions: [
    {
      title: 'Stateless JWT, not session cookies',
      body: 'Session cookies would have been simpler, but I wanted to learn the JWT model end-to-end: signing, expiry, refresh, revocation trade-offs. Knowing why you\'d not use it is as useful as knowing how.',
    },
    {
      title: 'Role checks at the controller layer',
      body: 'I leaned on Spring Security\'s annotation-based checks for the primary access model. It keeps the rules visible next to the endpoint they protect, instead of scattered through service classes.',
    },
    {
      title: 'Application events for notifications',
      body: 'When an application changes state, I publish a domain event. A notification listener picks it up and sends email asynchronously. This keeps the request path clean and lets me add new reactions later without touching the application service.',
    },
    {
      title: 'DB-level integrity over service-level guards',
      body: 'Foreign keys, NOT NULL, and check constraints catch a class of bugs that would otherwise sneak through. They\'re not glamorous, but they pay off every time the application code has a bad day.',
    },
  ],
  learnings: [
    'Auth is one of those areas where "almost right" is wrong. Building the JWT flow myself — including the parts I eventually want to delegate to a real identity provider — gave me a much sharper sense of what a library is actually doing for me.',
    'The other lesson was about modeling: the recruitment domain has just enough state machines (application status, job lifecycle) that explicit modeling pays off. Every shortcut I took early came back as a bug later.',
  ],
  next: { slug: 'learnova', name: 'Learnova' },
};

export default function ERecruitment() {
  return <ProjectDetail {...data} />;
}
