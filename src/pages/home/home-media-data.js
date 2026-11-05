// Data for the media variant: the base Home copy plus the media the website
// homepage shows. Client logos, team photos and the hero/step media are the
// site's own files. Impact-card images are CMS uploads on the site and aren't
// in the repo, so each card uses the still of its capability.
export * from './home-data.js';
import { CLIENTS as C0, IMPACT as I0, WHO_WE_ARE as W0 } from './home-data.js';

const logos = [
  { name: 'KTM', logo: '/home/clients/logo-ktm.png' },
  { name: 'McKinsey & Company', logo: '/home/clients/logo-mckinsey.png' },
];
// The marquee needs enough logos to fill the row; the pair repeats.
export const CLIENTS = { ...C0, logos: [...logos, ...logos, ...logos, ...logos] };

const still = { Applications: '/home/services/hll-application-demo.webp', 'People & Policy': '/home/services/hll-people-demo.webp' };
export const IMPACT = { ...I0, cards: I0.cards.map((c) => ({ ...c, image: still[c.tags[0]] })) };

export const WHO_WE_ARE = { ...W0, people: W0.people.map((p) => ({ ...p, photo: `/home/team/${p.id}.webp` })) };
