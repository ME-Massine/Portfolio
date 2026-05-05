import React from 'react';
import { ProjectDetail } from '../components.jsx';
import { LearnovaDiagram } from '../diagrams.jsx';

const data = {
  slug: 'learnova',
  name: 'Learnova',
  oneliner: 'An online learning platform with dual-profile support — users switch between learner and instructor roles without separate accounts — including course management, live sessions, cloud media, and automated certificates.',
  role: 'Team · backend lead',
  year: '2024',
  status: 'Open-sourced',
  stack: ['Spring Boot', 'PostgreSQL', 'Cloud Storage', 'React', 'TypeScript', 'PDF generation'],
  links: [{ label: 'github', href: 'https://github.com/ME-Massine' }],
  diagram: LearnovaDiagram,
  problem: [
    'Most learning platforms treat learners and instructors as separate user types — separate logins, separate dashboards, sometimes separate apps. That fits how some products think, but it doesn\'t fit how people actually move through education: someone who teaches a course this semester might take one the next.',
    'The challenge was building a single-account model where roles are something you wear, not something you are — without leaking permissions between contexts.',
  ],
  approach: [
    'One user record carries multiple role profiles. The backend resolves the active profile per request and uses it to gate access to the right resources. Course content (videos, PDFs) lives in object storage with signed URLs, served via CDN; certificates are generated on completion by a small dedicated service.',
    'The module boundaries follow the domain: profile/identity, courses, sessions, certificates, media. Each one owns its data and exposes a narrow API. The frontend is a single React app that adapts based on the active profile.',
  ],
  decisions: [
    {
      title: 'Single account, switchable profile',
      body: 'Two accounts would have been simpler — but it\'s the wrong mental model for users. Modeling profile as a property of a user, not a separate identity, made the auth flow cleaner once I got past the initial design work.',
    },
    {
      title: 'Signed URLs over proxying media',
      body: 'Streaming course videos through the application would have killed performance. Using object storage with short-lived signed URLs lets the CDN do its job; the backend only authorizes access, not bytes.',
    },
    {
      title: 'Certificates as a separate service',
      body: 'PDF generation is slow and CPU-bound. Putting it behind an event ("course.completed") means slow PDF rendering can\'t degrade the rest of the app, and I can scale or replace it independently.',
    },
    {
      title: 'Domain-driven module boundaries',
      body: 'Five clear contexts (profiles, courses, sessions, certificates, media) instead of one big lump. The boundaries cost a little upfront but made every later change local instead of global.',
    },
  ],
  learnings: [
    'The dual-profile model was the most interesting part. Once I committed to "one user, many profiles," a lot of complexity I\'d planned for (cross-account links, role transfers) just vanished.',
    'Working in a team also taught me how much design work happens at the API boundary — the moment two people are writing on either side of an interface, every assumption has to be written down.',
  ],
  next: { slug: 'orderflow', name: 'OrderFlow' },
};

export default function Learnova() {
  return <ProjectDetail {...data} />;
}
