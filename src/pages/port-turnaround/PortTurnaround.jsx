// PortTurnaround.jsx — "Ship turnaround, in three slides" (Hyper Lychee Labs).
// Page assembled only from existing components: GradientRevealTextNormal
// (slide headings), Tag (named stack), HLLButton / HLLOutlineButton (slide
// controls + CTA). Layout follows the Figma site frames (1512px frame, 30px
// gutter, nav, hairline label/body rows, CTA band, footer); that layout glue
// lives in port-turnaround.css.
import { useCallback, useEffect, useState } from 'react';
import { GradientRevealTextNormal } from '../../components/heading-anim-normal';
import { HLLButton } from '../../components/hll-button';
import { HLLOutlineButton } from '../../components/hll-outline-button';
import { Tag } from '../../components/tag';
import { Workbench } from '../../components/workbench';
import '../../components/our-promise/our-promise.css'; // registers Aeonik Light + Sometype Mono
import './port-turnaround.css';

const STEPS = ['Problem', 'Approach', 'Demo'];

export const STAGES = [
  'Waiting at anchor',
  'Pilot and tug',
  'Berthing',
  'Cranes working the ship',
  'Container yard',
  'Gate and trucks',
  'Customs release',
  'Departure',
];
const STAGE_ROWS = ['What happens here', 'Who runs it', 'Which system records it', 'Where the time goes'];

// The five layers of the approach slide.
const LAYERS = [
  {
    name: 'Trust',
    tech: 'Lineage, role access, decision log',
    body: 'Lineage and sign-off. Every fact carries its source record and the transformation it went through; every decision carries a name, a time, and a typed reason. Access by role. The schema changes only through a governed, versioned process.',
  },
  {
    name: 'Kinetic',
    tech: 'LangGraph',
    body: 'Governed agentic workflows. Defined steps carried out with judgment inside each step: read the change, walk the connected picture, retrieve the governed records, check the rules, draft the action with its reasoning shown, then stop for a person to decide.',
  },
  {
    name: 'Ontology',
    tech: 'LinkML model, Neo4j graph',
    body: 'The written model of your operation. What a ship visit, a berth window, a crane assignment, a container move, a truck appointment, and a declaration are, and how they relate. Versioned like code, then filled with your real records as a knowledge graph.',
  },
  {
    name: 'Foundation',
    tech: 'Event pipelines, Splink record matching',
    body: 'Data engineering, integration, and analytics. Connect to the systems you already run and read records in place, standardize events onto one timeline, repair missing and inconsistent timestamps, match records across systems with a confidence score, and decompose turnaround per ship visit.',
  },
  {
    name: 'Momentum',
    tech: 'The operating rhythm',
    body: 'Model reviews with your operations people, match-quality reporting, new sources added on a cadence, and a documented handover so the model and the pipelines are yours.',
  },
];

export const PEOPLE = ["The duty manager's workbench", 'Planners', 'Existing dashboards, kept and fed', 'Downstream agents'];
export const SYSTEMS = [
  'Terminal operating system',
  'Port community platform',
  'Ship position feeds',
  'Gate and appointment systems',
  'Customs platform',
  'Manifests and inspection notes',
  'Radio and email logs',
];
export const BUILD_STEPS = [
  'Prove record matching on one small, non-sensitive slice.',
  'Model one narrow slice of meaning with your people.',
  'Build the graph.',
  'Add retrieval, simplest first.',
  'Add the assistant, with a person approving anything irreversible.',
  'Instrument from day one.',
];
export const STACK = ['LinkML', 'Splink', 'Neo4j', 'LangGraph'];


// Top-nav labels and footer columns as they appear in the Figma frames
// (nav items = the five menu-item variants; service list is the Services
// menu's draft sub-links, minus its duplicated "HLL Foundation" — see
// known-gaps). Plain text: no routes for these exist in this repo.
export const NAV = ['Services', 'Industries', 'Engagement', 'About', 'Contact'];
export const FOOTER_SITE = ['Home', 'About', 'Team', 'Engagement', 'Contact'];
export const FOOTER_SERVICES = ['HLL Kinetic', 'HLL Momentum', 'HLL Governance & Trust', 'HLL Foundation', 'HLL Motion'];

// Figma "section row": an empty lead column, a label column, and a body
// column, under a 1px hairline (measured 606 / 250 / ~596 of the 1452 content width).
function Row({ label, children }) {
  return (
    <section className="pt-row">
      <p className="pt-label">{label}</p>
      <div className="pt-body">{children}</div>
    </section>
  );
}

// Section heading block: breadcrumb-style label, 64px heading, optional lead.
function Heading({ label, text, variant, children }) {
  return (
    <header className="pt-heading">
      <p className="pt-label pt-label--crumb">{label}</p>
      <h1 className="pt-h1">
        <GradientRevealTextNormal text={text} variant={variant} fontSize="64px" />
      </h1>
      {children}
    </header>
  );
}

function Slide1() {
  return (
    <section className="pt-slide">
      <Heading
        label="Ports and shipping logistics"
        text="How do you make the turnaround timing for the ship much faster?"
        variant="hll-ai"
      >
        <p className="pt-title">
          Our answer: <em>the delay hides in the handoffs.</em>
        </p>
        <p className="pt-muted">You asked us this at the booth. Three slides, and the third one runs.</p>
      </Heading>

      <Row label="One port call">
        <ol className="pt-stages">
          {STAGES.map((s, i) => (
            <li key={s}>
              <span className="pt-mono pt-muted">{String(i + 1).padStart(2, '0')}/{String(STAGES.length).padStart(2, '0')}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <ul className="pt-rowlabels">
          {STAGE_ROWS.map((r) => (
            <li key={r} className="pt-mono pt-muted">{r}</li>
          ))}
        </ul>
      </Row>

      <Row label="The problem">
        <p className="pt-para">
          Five parties run a port call on five systems. They coordinate by phone, email, and radio. Each system sees
          its own stage.
        </p>
        <p className="pt-title">Nothing sees the ship's whole stay.</p>
        <p className="pt-para">So the delay shows up one handoff too late.</p>
        <p className="pt-para">
          Saudi ports moved about 8.3 million standard container units in 2025; the national target is 40 million a
          year by 2030. That growth arrives through the same berths, so the capacity has to come out of the hours
          inside each port call.
        </p>
        <p className="pt-muted pt-mono">
          Sources: Saudi Ports Authority published figures, 2025. National Transport and Logistics Strategy.
        </p>
      </Row>

      <Row label="Who we are and where we sit">
        <h2 className="pt-title">We build the layer that sits exactly here.</h2>
        <p className="pt-para">
          Above the systems a port already runs. Before the decisions its people make. You asked how we mix the AI
          with the analytics itself: we build the analytics first, then put the AI to work on it, and a person signs.
        </p>
      </Row>
    </section>
  );
}

function Slide2() {
  return (
    <section className="pt-slide">
      <Heading label="The approach" text="The layer Hyper Lychee Labs builds and runs" variant="hll-ontology">
        <p className="pt-muted">Open source. On infrastructure you own.</p>
      </Heading>

      <Row label="Your people and operations">
        <ul className="pt-list">
          {PEOPLE.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </Row>

      {LAYERS.map((l, n) => (
        <Row key={l.name} label={`${String(n + 1).padStart(2, '0')}/${String(LAYERS.length).padStart(2, '0')}`}>
          <h3 className="pt-title">{l.name}</h3>
          <p className="pt-para">{l.body}</p>
          <p className="pt-muted pt-mono">{l.tech}</p>
        </Row>
      ))}

      <Row label="Your systems, read in place">
        <ul className="pt-list">
          {SYSTEMS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="pt-para">
          The workbench on the next slide is this layer made visible: one command center where structured and
          unstructured data, analytics, and governed agentic workflows meet, built for a duty manager to run a
          shorter port call.
        </p>
      </Row>

      <Row label="How this gets built">
        <p className="pt-para">
          Synthetic data, real architecture. The demo runs invented numbers through the same components we deploy.
        </p>
        <p className="pt-title">The first proof arrives in weeks.</p>
        <ol className="pt-steps">
          {BUILD_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="pt-label">Named stack</p>
        <div className="pt-chips">
          {STACK.map((s) => (
            <Tag key={s} variant="cool" removable={false}>{s}</Tag>
          ))}
        </div>
      </Row>

      <Row label="It might look like one more dashboard">
        <p className="pt-para">
          Dashboards already describe the day well. The missing piece is the drafted next action, reasoning on
          screen, waiting for a person to sign.
        </p>
      </Row>

      <Row label="Two honest limits">
        <p className="pt-para">
          Grounding the AI in one governed picture reduces wrong answers and leaves fewer of them, never zero. A
          person stays in charge of every step that matters. And the picture is only as good as the events feeding it,
          which takes real integration work with the systems a port already runs.
        </p>
        <p className="pt-para">
          We have not run a port. We build the data layer under the people who do. The shape of the problem, many
          systems and no shared key, is the same one we work on in the region for government entities and for private
          sector companies.
        </p>
      </Row>
    </section>
  );
}

function Slide3({ onOpen }) {
  return (
    <section className="pt-slide">
      <Heading label="The demo" text="Vessel Turnaround Workbench" variant="hll-application" />
      <Row label="Live demo">
        <p className="pt-para">
          A synthetic Red Sea container terminal, running live. Watch a berth conflict form across three systems, then
          watch the assistant walk the connected picture, draft the fix, and wait. The assistant drafts. A person
          decides and signs.
        </p>
        <div>
          <HLLButton variant="hll-application" onClick={onOpen}>
            Open the workbench
          </HLLButton>
        </div>
        <p className="pt-muted pt-mono">
          Synthetic terminal. All data invented, modeled on public port-event standards.
        </p>
      </Row>
    </section>
  );
}

const SLIDES = [Slide1, Slide2, Slide3];

export default function PortTurnaround() {
  const [i, setI] = useState(0);
  const [wb, setWb] = useState(0); // 0 = closed; otherwise a run counter (Reset bumps it)
  const go = useCallback((n) => setI(Math.max(0, Math.min(SLIDES.length - 1, n))), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i, go]);

  // The workbench replaces the page while open, so its many WebGL buttons
  // are not competing with the page's buttons/tags for GPU contexts.
  if (wb) {
    return <Workbench key={wb} onClose={() => setWb(0)} onReset={() => setWb((n) => n + 1)} />;
  }

  const Slide = SLIDES[i];
  return (
    <div className="pt-page">
      <header className="pt-header">
        <span className="pt-brand">Hyper Lychee Labs</span>
        <ul className="pt-menu pt-label" aria-label="Site sections">
          {NAV.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </header>

      <nav className="pt-tabs" aria-label="Slides">
        {STEPS.map((s, n) => (
          <button
            key={s}
            type="button"
            className={`pt-tab pt-label${n === i ? ' is-current' : ''}`}
            aria-current={n === i ? 'step' : undefined}
            onClick={() => go(n)}
          >
            {n + 1} {s}
          </button>
        ))}
      </nav>

      <main className="pt-main">
        <Slide key={i} onOpen={() => setWb(1)} />
      </main>

      <div className="pt-controls">
        <HLLOutlineButton variant="hll-ai" onClick={() => go(i - 1)} disabled={i === 0}>← Back</HLLOutlineButton>
        <span className="pt-muted pt-mono">Arrow keys or swipe</span>
        <HLLButton variant="hll-ai" onClick={() => go(i + 1)} disabled={i === SLIDES.length - 1}>Next →</HLLButton>
      </div>

      <section className="pt-cta">
        <h2 className="pt-cta__title">Let’s start a conversation</h2>
        <HLLButton variant="contact">Write to us</HLLButton>
      </section>

      <footer className="pt-footer">
        <span className="pt-footer__brand">Hyper Lychee Labs</span>
        <ul className="pt-footer__col pt-label">
          {FOOTER_SITE.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <ul className="pt-footer__col pt-label">
          <li className="pt-muted">Services</li>
          {FOOTER_SERVICES.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <p className="pt-footer__legal pt-label">© Hyper Lychee Labs 2026</p>
      </footer>
    </div>
  );
}
