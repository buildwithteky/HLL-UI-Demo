// Copy for the Home page, taken from hll-website/src/data/home.ts.
// Images/videos live in /public/home. Client logos and impact-card images
// come from the website's CMS and are not available here, so they render as
// the same grey placeholders the site shows before the CMS is filled.
const svc = (v) => `/home/services/hll-${v}-demo.webp`;

export const NAV = [
  { label: 'Capabilities', variant: 'services' },
  { label: 'Industries', variant: 'industries' },
  { label: 'Engagements', variant: 'engagement' },
  { label: 'About', variant: 'about' },
  { label: 'Contact', variant: 'contact' },
];

export const HERO = {
  heading: 'We champion future-facing initiatives for an accelerated advancement.',
  ctaLabel: 'See our work',
  video: '/home/video/home-intro.mp4',
  poster: '/home/video/home-intro-poster.jpg',
};

export const WHAT_WE_DO = {
  eyebrow: 'Capabilities',
  title: 'What we do',
  items: [
    { label: 'Application', name: 'Applications', variant: 'application', description: 'We build applications that are a delight to use.' },
    { label: 'People & Policy', name: 'People & Policy', variant: 'people', description: 'The talent gap closed for you in under a week.' },
    { label: 'Trust & Governance', name: 'Trust & Governance', variant: 'trust', description: 'Could you show a regulator where that number came from?' },
    { label: 'AI', name: 'AI', variant: 'ai', description: 'Applied AI built to move from experimentation into real work.' },
    { label: 'Foundation', name: 'Data & Analytics', variant: 'foundation', description: 'Data your business can finally trust.' },
    { label: 'Ontology', name: 'Ontology', variant: 'ontology', description: 'A connected view of the knowledge and relationships in your business.' },
  ].map((i) => ({ ...i, image: svc(i.variant), glyph: `/home/services/hll-${i.variant}-glyph.svg` })),
};

export const CLIENTS = { eyebrow: 'Clients', title: 'Our Clients', logos: [] };

export const IMPACT = {
  eyebrow: 'Work',
  title: 'Our Impact',
  cards: [
    { title: 'DocuPet', tags: ['Applications'] },
    { title: 'McKinsey & Company', tags: ['People & Policy'] },
    { title: 'Galeries Lafayette', tags: ['Applications'] },
    { title: 'Wataniya', tags: ['People & Policy'] },
    { title: 'KTM', tags: ['Applications'] },
    { title: 'WeWork', tags: ['Applications'] },
  ],
  stats: [
    { value: '15+', label: 'Enterprise Clients' },
    { value: '$1B+', label: 'Revenue Impact Across Clients' },
  ],
  ctaLabel: 'View all work',
};

export const HOW_WE_WORK = {
  eyebrow: 'About',
  title: 'How we work',
  steps: [
    { id: 'shape', title: 'Shape', image: '/home/shape.webp', video: '/home/shape.mp4', body: 'We constantly push the envelope to help you define what needs to exist and translate ambiguity into a clear and dynamic future.' },
    { id: 'build', title: 'Build', image: '/home/build.webp', body: 'We leverage the collective momentum of our people along with future mental models to deliver impact-driven products and services.' },
    { id: 'evolve', title: 'Evolve', image: '/home/evolve.webp', video: '/home/evolve.mp4', body: 'We help organisations evolve using insights and by augmenting them with the right people. All with the intent of solving challenges with a future-forward mindset.' },
  ],
};

export const WHO_WE_ARE = {
  eyebrow: 'Team',
  title: 'Who are we',
  people: [
    { id: 'hannan-hakim', name: 'Hannan Hakim', role: 'Founding Partner' },
    { id: 'arjun-pathni', name: 'Arjun Pathni', role: 'Senior Partner' },
    { id: 'rima-sarkar', name: 'Rima Sarkar', role: 'Head Of Growth' },
    { id: 'nilesh-nalnikar', name: 'Nilesh Nalnikar', role: 'Senior Partner' },
  ],
  ctaLabel: 'View all team',
};

export const LAB = { eyebrow: 'Demo tool', title: 'Inside the Lab', background: '/home/lab-bg.webp' };

export const FOOTER = {
  headline: 'Let’s start a conversation',
  ctaLabel: 'Write to us',
  nav: ['Home', 'About', 'Team', 'Engagements', 'Contact'],
  services: ['Applications', 'People & Policy', 'Trust & Governance', 'Data & Analytics', 'AI', 'Ontology', 'Cloud'],
};

// Nav menu panels (hll-website nav-menu.tsx / data/industry-menu.ts).
export const MENU_SERVICES = [
  { name: 'Applications', variant: 'application' },
  { name: 'People & Policy', variant: 'people' },
  { name: 'Trust & Governance', variant: 'trust' },
  { name: 'Data & Analytics', variant: 'foundation' },
  { name: 'AI', variant: 'ai' },
  { name: 'Ontology', variant: 'ontology' },
];
export const MENU_INDUSTRIES = [
  { title: 'Financial Services', items: ['Banking', 'Insurance', 'Other Financial Services'] },
  { title: 'Commerce & Consumer', items: ['Retail Commerce & Brands', 'Travel & Hospitality', 'Pet Tech'] },
  { title: 'Health & Life Sciences', items: ['Healthcare', 'Pharmaceuticals'] },
  { title: 'Built Environment & Industry', items: ['Manufacturing', 'Real Estate', 'Logistics'] },
  { title: 'Government & Public Institutions', items: ['Public Sector & Government Services', 'International Organization'] },
  { title: 'Professional Services', items: ['Consulting Firms'] },
];
export const MENU_ABOUT = ['About', 'Team', 'Careers'];
export const MENU_NEWS = [
  'Fresh Recruit: John Doe joins HLL',
  'HLL to showcase work at SFCON2026',
  'HLL to showcase work at SFCON2026',
];
