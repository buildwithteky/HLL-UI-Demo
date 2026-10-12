// PortTurnaround.jsx — "Ship turnaround, in three slides" (Hyper Lychee Labs).
// Page assembled only from existing components: Ripple (backdrop),
// GradientRevealTextNormal (slide headings), Tag (named stack), HLLButton /
// HLLOutlineButton (navigation + CTA). Layout glue lives in port-turnaround.css.
import { useCallback, useEffect, useState } from 'react';
import { GradientRevealTextNormal } from '../../components/heading-anim-normal';
import { HLLButton } from '../../components/hll-button';
import { HLLOutlineButton } from '../../components/hll-outline-button';
import { Tag } from '../../components/tag';
import { Workbench } from '../../components/workbench';
import '../../components/our-promise/our-promise.css'; // registers Aeonik Light + Sometype Mono
import './port-turnaround.css';

const STEPS = ['Problem', 'Approach', 'Demo'];

const STAGES = [
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

const PEOPLE = ["The duty manager's workbench", 'Planners', 'Existing dashboards, kept and fed', 'Downstream agents'];
const SYSTEMS = [
  'Terminal operating system',
  'Port community platform',
  'Ship position feeds',
  'Gate and appointment systems',
  'Customs platform',
  'Manifests and inspection notes',
  'Radio and email logs',
];
const BUILD_STEPS = [
  'Prove record matching on one small, non-sensitive slice.',
  'Model one narrow slice of meaning with your people.',
  'Build the graph.',
  'Add retrieval, simplest first.',
  'Add the assistant, with a person approving anything irreversible.',
  'Instrument from day one.',
];
const STACK = ['LinkML', 'Splink', 'Neo4j', 'LangGraph'];

function Slide1() {
  return (
    <section className="pt-slide">
      <p className="pt-eyebrow">Ports and shipping logistics</p>
      <h1 className="pt-h1">
        <GradientRevealTextNormal
          text="How do you make the turnaround timing for the ship much faster?"
          variant="hll-ai"
          fontSize="64px"
        />
      </h1>
      <p className="pt-title">
        Our answer: <em>the delay hides in the handoffs.</em>
      </p>
      <p className="pt-muted">You asked us this at the booth. Three slides, and the third one runs.</p>

      <ol className="pt-stages">
        {STAGES.map((s, i) => (
          <li key={s}>
            <span className="pt-mono">{String(i + 1).padStart(2, '0')}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <ul className="pt-rowlabels">
        {STAGE_ROWS.map((r) => (
          <li key={r} className="pt-mono">{r}</li>
        ))}
      </ul>

      <p className="pt-para">
        Five parties run a port call on five systems. They coordinate by phone, email, and radio. Each system sees its
        own stage.
      </p>
      <p className="pt-title">Nothing sees the ship's whole stay.</p>
      <p className="pt-para">So the delay shows up one handoff too late.</p>
      <p className="pt-para">
        Saudi ports moved about 8.3 million standard container units in 2025; the national target is 40 million a year
        by 2030. That growth arrives through the same berths, so the capacity has to come out of the hours inside each
        port call.
      </p>
      <p className="pt-muted pt-mono">
        Sources: Saudi Ports Authority published figures, 2025. National Transport and Logistics Strategy.
      </p>

      <p className="pt-eyebrow">Who we are and where we sit</p>
      <h2 className="pt-title">We build the layer that sits exactly here.</h2>
      <p className="pt-para">
        Above the systems a port already runs. Before the decisions its people make. You asked how we mix the AI with
        the analytics itself: we build the analytics first, then put the AI to work on it, and a person signs.
      </p>
    </section>
  );
}

function Slide2() {
  return (
    <section className="pt-slide">
      <p className="pt-eyebrow">The approach</p>
      <h1 className="pt-h1">
        <GradientRevealTextNormal
          text="The layer Hyper Lychee Labs builds and runs"
          variant="hll-ontology"
          fontSize="64px"
        />
      </h1>
      <p className="pt-muted">Open source. On infrastructure you own.</p>

      <div className="pt-stack">
        <div className="pt-card">
          <p className="pt-eyebrow">Your people and operations</p>
          <ul className="pt-list">
            {PEOPLE.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        {LAYERS.map((l) => (
          <div className="pt-card" key={l.name}>
            <h3 className="pt-title">{l.name}</h3>
            <p className="pt-para">{l.body}</p>
            <p className="pt-muted pt-mono">{l.tech}</p>
          </div>
        ))}

        <div className="pt-card">
          <p className="pt-eyebrow">Your systems, read in place</p>
          <ul className="pt-list">
            {SYSTEMS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="pt-para">
        The workbench on the next slide is this layer made visible: one command center where structured and
        unstructured data, analytics, and governed agentic workflows meet, built for a duty manager to run a shorter
        port call.
      </p>

      <h2 className="pt-title">How this gets built</h2>
      <p className="pt-para">
        Synthetic data, real architecture. The demo runs invented numbers through the same components we deploy.
      </p>
      <p className="pt-title">The first proof arrives in weeks.</p>
      <ol className="pt-steps">
        {BUILD_STEPS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <p className="pt-eyebrow">Named stack</p>
      <div className="pt-chips">
        {STACK.map((s) => (
          <Tag key={s} variant="cool" removable={false}>{s}</Tag>
        ))}
      </div>

      <h2 className="pt-title">It might look like one more dashboard.</h2>
      <p className="pt-para">
        Dashboards already describe the day well. The missing piece is the drafted next action, reasoning on screen,
        waiting for a person to sign.
      </p>

      <h2 className="pt-title">Two honest limits</h2>
      <p className="pt-para">
        Grounding the AI in one governed picture reduces wrong answers and leaves fewer of them, never zero. A person
        stays in charge of every step that matters. And the picture is only as good as the events feeding it, which
        takes real integration work with the systems a port already runs.
      </p>
      <p className="pt-para">
        We have not run a port. We build the data layer under the people who do. The shape of the problem, many
        systems and no shared key, is the same one we work on in the region for government entities and for private
        sector companies.
      </p>
    </section>
  );
}

function Slide3({ onOpen }) {
  return (
    <section className="pt-slide">
      <p className="pt-eyebrow">The demo</p>
      <h1 className="pt-h1">
        <GradientRevealTextNormal
          text="Vessel Turnaround Workbench"
          variant="hll-application"
          fontSize="64px"
        />
      </h1>
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
      <p className="pt-muted pt-mono">Synthetic terminal. All data invented, modeled on public port-event standards.</p>

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
  // are not competing with the page's Ripple/buttons for GPU contexts.
  if (wb) {
    return <Workbench key={wb} onClose={() => setWb(0)} onReset={() => setWb((n) => n + 1)} />;
  }

  const Slide = SLIDES[i];
  return (
    <div className="pt-page">
      <header className="pt-header">
        <span className="pt-brand">Hyper Lychee Labs</span>
        <nav className="pt-nav" aria-label="Slides">
          {STEPS.map((s, n) => (
            <button
              key={s}
              type="button"
              className={`pt-navbtn pt-mono${n === i ? ' is-current' : ''}`}
              aria-current={n === i ? 'step' : undefined}
              onClick={() => go(n)}
            >
              {n + 1} {s}
            </button>
          ))}
        </nav>
      </header>

      <main className="pt-main">
        <Slide key={i} onOpen={() => setWb(1)} />
      </main>

      <footer className="pt-footer">
        <HLLOutlineButton variant="hll-ai" onClick={() => go(i - 1)} disabled={i === 0}>← Back</HLLOutlineButton>
        <span className="pt-muted pt-mono">Arrow keys or swipe</span>
        <HLLButton variant="hll-ai" onClick={() => go(i + 1)} disabled={i === SLIDES.length - 1}>Next →</HLLButton>
      </footer>
    </div>
  );
}
