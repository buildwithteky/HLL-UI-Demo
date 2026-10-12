// Workbench.jsx — the "Vessel Turnaround Workbench" synthetic port demo.
//
// The simulation engine (map/graph/hours canvases, event feed, assistant
// cases) is the reference deck's vanilla-JS code, loaded with `?raw` imports.
// Every interactive control that has an existing library equivalent is NOT
// re-created: the segmented time/lens controls, Reset, Close, and the
// Approve / Overrule / Confirm actions are real <HLLButton> /
// <HLLOutlineButton> instances, portalled into the markup's slots. The
// engine finds them by the same ids / data-attributes it always used, so
// its behavior is unchanged. All CSS is scoped under `.wbx`.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HLLButton } from '../hll-button';
import { HLLOutlineButton } from '../hll-outline-button';
import markup from './workbench-markup.html?raw';
import core from './workbench-core.js?raw';
import map from './workbench-map.js?raw';
import ui from './workbench-ui.js?raw';
import extras from './workbench-extras.js?raw';
import './workbench-styles.css';
import './workbench.css';

const TIME = [
  ['live', 'Live', true],
  ['pause', 'Pause', false],
  ['jump', 'Jump to conflict', false],
];
const LENSES = [
  ['map', 'Map', true],
  ['graph', 'Graph', false],
  ['hours', 'Hours', false],
  ['agent', 'Assistants', false],
];

// Run the engine scripts once the markup + portalled buttons exist. rAF and
// timers are shadowed so every loop stops when the workbench unmounts.
function startEngine(control) {
  const raf = (cb) => (control.stopped ? 0 : requestAnimationFrame(cb));
  const timeout = (cb, ms, ...a) => setTimeout(() => !control.stopped && cb(...a), ms);
  [core, map, ui, extras].forEach((src) =>
    new Function('requestAnimationFrame', 'setTimeout', src)(raf, timeout)
  );
}

export default function Workbench({ onClose, onReset }) {
  const host = useRef(null);
  const [slots, setSlots] = useState(null);
  const control = useRef({ stopped: false });
  const started = useRef(false);
  const stopTimer = useRef(0);

  useLayoutEffect(() => {
    const q = (s) => host.current.querySelector(s);
    setSlots({
      timeSeg: q('#timeSeg'),
      lensSeg: q('#lensSeg'),
      reset: q('[data-slot="reset"]'),
      close: q('[data-slot="close"]'),
      approve: q('[data-slot="approve"]'),
      overrule: q('[data-slot="overrule"]'),
      confirm: q('[data-slot="confirm"]'),
    });
  }, []);

  useEffect(() => {
    if (!slots) return undefined;
    clearTimeout(stopTimer.current); // survives StrictMode's simulated remount
    if (!started.current) {
      started.current = true;
      startEngine(control.current);
    }
    return () => {
      stopTimer.current = setTimeout(() => { control.current.stopped = true; }, 0);
    };
  }, [slots]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // The engine toggles aria-pressed on the segmented buttons; mirror it into
  // React so the selected one uses a different library *variant* (no CSS).
  const [pressed, setPressed] = useState({ time: 'live', lens: 'map' });
  useEffect(() => {
    if (!slots) return undefined;
    const sync = () => {
      const cur = (root, attr) =>
        root.querySelector('[aria-pressed="true"]')?.getAttribute(attr) ?? null;
      setPressed((p) => {
        const next = { time: cur(slots.timeSeg, 'data-time'), lens: cur(slots.lensSeg, 'data-lens') };
        return next.time === p.time && next.lens === p.lens ? p : next;
      });
    };
    const mo = new MutationObserver(sync);
    [slots.timeSeg, slots.lensSeg].forEach((n) =>
      mo.observe(n, { attributes: true, attributeFilter: ['aria-pressed'], subtree: true })
    );
    return () => mo.disconnect();
  }, [slots]);

  const seg = (items, attr, current) =>
    items.map(([key, label, on]) => (
      <HLLOutlineButton
        key={key}
        variant={current === key ? 'hll-ontology' : 'hll-ai'}
        aria-pressed={on}
        {...{ [attr]: key }}
      >
        {label}
      </HLLOutlineButton>
    ));

  return (
    <div className="wbx" role="dialog" aria-label="Vessel Turnaround Workbench">
      <div ref={host} className="wbx-inner" dangerouslySetInnerHTML={{ __html: markup }} />
      {slots && (
        <>
          {createPortal(seg(TIME, 'data-time', pressed.time), slots.timeSeg)}
          {createPortal(seg(LENSES, 'data-lens', pressed.lens), slots.lensSeg)}
          {createPortal(
            <HLLOutlineButton variant="hll-ontology" id="resetWb" aria-label="Reset the demo" onClick={onReset}>
              Reset demo
            </HLLOutlineButton>,
            slots.reset
          )}
          {createPortal(
            <HLLOutlineButton variant="hll-ontology" id="closeWb" aria-label="Close the workbench" onClick={onClose}>
              Close
            </HLLOutlineButton>,
            slots.close
          )}
          {createPortal(<HLLButton variant="hll-ontology" id="approveBtn">Approve the plan</HLLButton>, slots.approve)}
          {createPortal(
            <HLLOutlineButton variant="hll-foundation" id="overruleBtn">Overrule</HLLOutlineButton>,
            slots.overrule
          )}
          {createPortal(
            <HLLOutlineButton variant="hll-trust" id="confirmOverrule" style={{ display: 'none' }}>
              Confirm overrule
            </HLLOutlineButton>,
            slots.confirm
          )}
        </>
      )}
    </div>
  );
}
