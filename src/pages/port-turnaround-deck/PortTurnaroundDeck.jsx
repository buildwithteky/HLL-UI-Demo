// PortTurnaroundDeck.jsx — client presentation for the Port Turnaround client,
// rebuilt on design-specs/hll-design-values-extracted.md. Composed only from
// existing components (GradientRevealTextNormal, Tag, HLLButton,
// HLLOutlineButton, Workbench); shared lists are reused from PortTurnaround.jsx.
// Paragraph copy is condensed from the existing page into ~7–8-word lines
// (spec content rule); no new facts are introduced.
//
// Open items vs. the spec (see summary): "AG Functional" and Aeonik Medium are
// not registered in this repo, so the secondary role uses Sometype Mono (the
// design-system's Functional UI Text) and the eyebrow renders in Aeonik Regular.
import { useCallback, useEffect, useState } from 'react';
import { GradientRevealTextNormal } from '../../components/heading-anim-normal';
import { HLLButton } from '../../components/hll-button';
import { HLLOutlineButton } from '../../components/hll-outline-button';
import { Tag } from '../../components/tag';
import { Workbench } from '../../components/workbench';
import '../../components/our-promise/our-promise.css'; // registers Aeonik Light/Regular + Sometype Mono
import {
  STAGES, PEOPLE, SYSTEMS, BUILD_STEPS, STACK, NAV, FOOTER_SITE, FOOTER_SERVICES,
} from '../port-turnaround/PortTurnaround.jsx';
import './port-turnaround-deck.css';

const STEPS = ['Problem', 'Approach', 'Demo'];
const pad = (n) => String(n).padStart(2, '0');

// Layer copy: one short paragraph per line, optional sub-list (14px list style).
const LAYERS = [
  { name: 'Trust', tech: 'Lineage, role access, decision log',
    paras: ['Every fact carries its source record.', 'Every decision carries a name and time.', 'Access by role. Schema changes are governed.'] },
  { name: 'Kinetic', tech: 'LangGraph',
    paras: ['Governed agentic workflows, judgment inside each step.', 'The assistant drafts the action, reasoning shown.', 'Then it stops for a person.'] },
  { name: 'Ontology', tech: 'LinkML model, Neo4j graph',
    paras: ['The written model of your operation.', 'Versioned like code.', 'Filled with your records as a graph.'] },
  { name: 'Foundation', tech: 'Event pipelines, Splink record matching',
    paras: ['Data engineering, integration, and analytics.'],
    list: ['Read records in place', 'Standardize events onto one timeline', 'Repair missing timestamps', 'Match records with a confidence score', 'Decompose turnaround per ship visit'] },
  { name: 'Momentum', tech: 'The operating rhythm',
    paras: ['Model reviews with your operations people.', 'Match-quality reporting and new sources.', 'A documented handover, so it is yours.'] },
];

// Section: index over eyebrow in the label column, 123px from the body.
function Section({ index, total, eyebrow, children }) {
  return (
    <section className="pd-section">
      <div className="pd-section__label">
        <p className="pd-index">{pad(index)}/{pad(total)}</p>
        <p className="pd-eyebrow">{eyebrow}</p>
      </div>
      <div className="pd-section__body">{children}</div>
    </section>
  );
}

const Paras = ({ lines }) => (
  <div className="pd-paras">
    {lines.map((l) => <p key={l} className="pd-p">{l}</p>)}
  </div>
);

const List = ({ items, ordered }) => {
  const Tagname = ordered ? 'ol' : 'ul';
  return <Tagname className="pd-list">{items.map((s) => <li key={s}>{s}</li>)}</Tagname>;
};

function Heading({ eyebrow, text, variant, children }) {
  return (
    <header className="pd-heading">
      <p className="pd-eyebrow pd-muted">{eyebrow}</p>
      <h1 className="pd-h1">
        <GradientRevealTextNormal text={text} variant={variant} fontSize="var(--hll-h1-size)" />
      </h1>
      {children}
    </header>
  );
}

function Slide1() {
  const N = 3;
  return (
    <section className="pd-slide">
      <Heading eyebrow="Ports and shipping logistics" text="How do you make the turnaround timing for the ship much faster?" variant="hll-ai">
        <p className="pd-title">Our answer: the delay hides in the handoffs.</p>
        <p className="pd-p pd-muted">You asked at the booth. Three slides; the third runs.</p>
      </Heading>

      <Section index={1} total={N} eyebrow="One port call">
        <div className="pd-cols">
          <ol className="pd-list">
            {STAGES.map((s, i) => (
              <li key={s}><span className="pd-secondary">{pad(i + 1)}/{pad(STAGES.length)}</span> {s}</li>
            ))}
          </ol>
        </div>
      </Section>

      <Section index={2} total={N} eyebrow="The problem">
        <Paras lines={['Five parties, five systems, one port call.', 'They coordinate by phone, email, and radio.', 'Each system sees only its own stage.']} />
        <p className="pd-title">Nothing sees the ship's whole stay.</p>
        <Paras lines={['So the delay shows up too late.']} />
        <div className="pd-stats">
          <div className="pd-stat-pair">
            <p className="pd-stat">8.3M</p>
            <p className="pd-list">Standard container units moved by Saudi ports in 2025</p>
          </div>
          <div className="pd-stat-pair">
            <p className="pd-stat">40M</p>
            <p className="pd-list">National yearly target by 2030</p>
          </div>
        </div>
        <Paras lines={['That growth arrives through the same berths.', 'Capacity must come from hours inside each call.']} />
        <p className="pd-secondary">Sources: Saudi Ports Authority published figures, 2025. National Transport and Logistics Strategy.</p>
      </Section>

      <Section index={3} total={N} eyebrow="Who we are">
        <h2 className="pd-title">We build the layer that sits exactly here.</h2>
        <Paras lines={['Above the systems a port already runs.', 'Before the decisions its people make.', 'We build the analytics first.', 'Then we put the AI to work.', 'A person signs every decision.']} />
      </Section>
    </section>
  );
}

function Slide2() {
  const N = LAYERS.length + 4;
  return (
    <section className="pd-slide">
      <Heading eyebrow="The approach" text="The layer Hyper Lychee Labs builds and runs" variant="hll-ontology">
        <p className="pd-p pd-muted">Open source. On infrastructure you own.</p>
      </Heading>

      <Section index={1} total={N} eyebrow="Your people and operations">
        <List items={PEOPLE} />
      </Section>

      {LAYERS.map((l, n) => (
        <Section key={l.name} index={n + 2} total={N} eyebrow={l.tech}>
          <h3 className="pd-title">{l.name}</h3>
          <div className="pd-group">
            <Paras lines={l.paras} />
            {l.list && <List items={l.list} />}
          </div>
        </Section>
      ))}

      <Section index={LAYERS.length + 2} total={N} eyebrow="Your systems, read in place">
        <List items={SYSTEMS} />
        <Paras lines={['The workbench makes this layer visible.', 'Built for a duty manager.']} />
      </Section>

      <Section index={LAYERS.length + 3} total={N} eyebrow="How this gets built">
        <Paras lines={['Synthetic data, real architecture.', 'The first proof arrives in weeks.']} />
        <List items={BUILD_STEPS} ordered />
        <p className="pd-eyebrow pd-muted">Named stack</p>
        <div className="pd-chips">
          {STACK.map((s) => <Tag key={s} variant="cool" removable={false}>{s}</Tag>)}
        </div>
      </Section>

      <Section index={N} total={N} eyebrow="Two honest limits">
        <Paras lines={['Grounding reduces wrong answers, never to zero.', 'A person owns every step that matters.', 'The picture needs real integration work.', 'We have not run a port.', 'We build the data layer beneath those who do.']} />
      </Section>
    </section>
  );
}

function Slide3({ onOpen }) {
  return (
    <section className="pd-slide">
      <Heading eyebrow="The demo" text="Vessel Turnaround Workbench" variant="hll-application" />
      <Section index={1} total={1} eyebrow="Live demo">
        <Paras lines={['A synthetic Red Sea container terminal, live.', 'Watch a berth conflict form across systems.', 'The assistant drafts the fix, then waits.', 'A person decides and signs.']} />
        <HLLButton variant="hll-application" onClick={onOpen}>Open the workbench</HLLButton>
        <p className="pd-secondary">Synthetic terminal. All data invented, modeled on public port-event standards.</p>
      </Section>
    </section>
  );
}

const SLIDES = [Slide1, Slide2, Slide3];

export default function PortTurnaroundDeck() {
  const [i, setI] = useState(0);
  const [wb, setWb] = useState(0);
  const go = useCallback((n) => setI(Math.max(0, Math.min(SLIDES.length - 1, n))), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i, go]);

  // Workbench replaces the page while open (keeps WebGL contexts down).
  if (wb) return <Workbench key={wb} onClose={() => setWb(0)} onReset={() => setWb((n) => n + 1)} />;

  const Slide = SLIDES[i];
  return (
    <div className="pd-page">
      <header className="pd-header">
        <span className="pd-brand">Hyper Lychee Labs</span>
        <ul className="pd-menu pd-nav" aria-label="Site sections">
          {NAV.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </header>

      <nav className="pd-tabs" aria-label="Slides">
        {STEPS.map((s, n) => (
          <button key={s} type="button" className={`pd-tab pd-nav${n === i ? ' is-current' : ''}`}
            aria-current={n === i ? 'step' : undefined} onClick={() => go(n)}>
            {n + 1} {s}
          </button>
        ))}
      </nav>

      <main className="pd-main"><Slide key={i} onOpen={() => setWb(1)} /></main>

      <div className="pd-controls">
        <HLLOutlineButton variant="hll-ai" onClick={() => go(i - 1)} disabled={i === 0}>← Back</HLLOutlineButton>
        <span className="pd-secondary">Arrow keys</span>
        <HLLButton variant="hll-ai" onClick={() => go(i + 1)} disabled={i === SLIDES.length - 1}>Next →</HLLButton>
      </div>

      <section className="pd-cta">
        <h2 className="pd-cta__title">Let’s start a conversation</h2>
        <HLLButton variant="contact">Write to us</HLLButton>
      </section>

      <footer className="pd-footer">
        <span className="pd-footer__brand">Hyper Lychee Labs</span>
        <ul className="pd-footer__col pd-nav">{FOOTER_SITE.map((l) => <li key={l}>{l}</li>)}</ul>
        <ul className="pd-footer__col pd-nav">
          <li>Services</li>
          {FOOTER_SERVICES.map((l) => <li key={l}>{l}</li>)}
        </ul>
        <p className="pd-footer__legal pd-nav">© Hyper Lychee Labs 2026</p>
      </footer>
    </div>
  );
}
