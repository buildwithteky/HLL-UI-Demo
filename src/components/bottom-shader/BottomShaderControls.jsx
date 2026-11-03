// BottomShaderControls — unrestricted live control panel. Every field is a
// plain text-backed numeric input (any sign, decimals, exponents, zero,
// huge values); no min/max/clamp/range slider exists. Edits mutate the live
// settings object in place, so the running shader reacts on the next frame.
import { useState } from 'react';
import { GROUPS, getPath, setPath, defaultFor, DEFAULT_MASK_STOPS } from './bottom-shader-controls-schema.js';
import './bottom-shader-controls.css';

export function NumInput({ value, onChange, step, nullable, placeholder }) {
  const [text, setText] = useState(null); // non-null while the user is typing
  const shown = text ?? (value == null ? '' : String(value));
  const commit = (raw) => {
    setText(raw);
    if (raw.trim() === '' && nullable) return onChange(undefined);
    const v = Number(raw);
    if (raw.trim() !== '' && Number.isFinite(v)) onChange(v);
  };
  const nudge = (dir, e) => {
    const mult = e?.shiftKey ? 10 : e?.altKey ? 0.1 : 1;
    const next = (Number(value ?? placeholder ?? 0) || 0) + dir * step * mult;
    const v = Number(next.toPrecision(12));
    setText(null);
    onChange(v);
  };
  return (
    <span className="bsc-num">
      <button type="button" onClick={(e) => nudge(-1, e)} aria-label="decrease">−</button>
      <input
        type="text" inputMode="decimal" spellCheck={false} value={shown} placeholder={placeholder}
        onChange={(e) => commit(e.target.value)}
        onBlur={() => setText(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') { e.preventDefault(); nudge(1, e); }
          if (e.key === 'ArrowDown') { e.preventDefault(); nudge(-1, e); }
        }}
      />
      <button type="button" onClick={(e) => nudge(1, e)} aria-label="increase">+</button>
    </span>
  );
}

export function ColorInput({ value, onChange }) {
  const hex = /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000';
  return (
    <span className="bsc-color">
      <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} />
      <input type="text" value={value ?? ''} spellCheck={false} onChange={(e) => onChange(e.target.value)} />
    </span>
  );
}

export default function BottomShaderControls({ targets, groups = GROUPS, title = 'Bottom shader' }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(true);
  const [, bump] = useState(0);
  const target = targets[active];
  const root = { s: target.settings, c: target.config };

  const set = (path, value) => {
    if (path.startsWith('c.')) target.setConfig((c) => { const next = { ...c }; setPath({ c: next }, path, value); return next; });
    else { setPath(root, path, value); bump((x) => x + 1); }
  };

  const reset = (path) => {
    const d = defaultFor(path);
    if (path.startsWith('s.tune.')) set(path, d === null ? undefined : d);
  };

  const field = (f, i) => {
    let v = getPath(root, f.path);
    if (f.type === 'num') {
      const def = defaultFor(f.path);
      if (v === undefined && def != null) v = def;
      return (
        <label key={f.path} className="bsc-row" onDoubleClick={() => reset(f.path)} title="double-click label to reset">
          <span>{f.label}</span>
          <NumInput value={v} step={f.step} nullable={f.nullable || def === null} placeholder={def == null ? 'auto' : String(def)} onChange={(x) => set(f.path, x)} />
        </label>
      );
    }
    if (f.type === 'bool') {
      return (
        <label key={f.path} className="bsc-row">
          <span>{f.label}</span>
          <input type="checkbox" checked={!!v} onChange={(e) => set(f.path, e.target.checked)} />
        </label>
      );
    }
    if (f.type === 'select') {
      return (
        <label key={f.path} className="bsc-row">
          <span>{f.label}</span>
          <select value={v ?? f.options[0]} onChange={(e) => set(f.path, e.target.value)}>
            {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      );
    }
    if (f.type === 'color') {
      return (
        <label key={f.path} className="bsc-row"><span>{f.label}</span><ColorInput value={v} onChange={(x) => set(f.path, x)} /></label>
      );
    }
    if (f.type === 'colors') {
      const list = v || [];
      return (
        <div key={f.path} className="bsc-list">
          {list.map((c, idx) => (
            <div key={idx} className="bsc-row">
              <span>{f.label} {idx + 1}</span>
              <ColorInput value={c} onChange={(x) => set(f.path, list.map((o, j) => (j === idx ? x : o)))} />
              <button type="button" onClick={() => list.length > 1 && set(f.path, list.filter((_, j) => j !== idx))}>remove</button>
            </div>
          ))}
          <button type="button" onClick={() => set(f.path, [...list, list[list.length - 1] || '#ffffff'])}>+ add stop</button>
        </div>
      );
    }
    if (f.type === 'stops') {
      const list = v || DEFAULT_MASK_STOPS;
      return (
        <div key={f.path} className="bsc-list">
          <em>{f.label} (position % , alpha)</em>
          {list.map(([p, a], idx) => (
            <div key={idx} className="bsc-row">
              <span>Stop {idx + 1}</span>
              <NumInput value={p} step={1} onChange={(x) => set(f.path, list.map((o, j) => (j === idx ? [x, o[1]] : o)))} />
              <NumInput value={a} step={0.05} onChange={(x) => set(f.path, list.map((o, j) => (j === idx ? [o[0], x] : o)))} />
              <button type="button" onClick={() => set(f.path, list.filter((_, j) => j !== idx))}>×</button>
            </div>
          ))}
          <button type="button" onClick={() => set(f.path, [...list, [100, 1]])}>+ add stop</button>
        </div>
      );
    }
    return null;
  };

  const exportJson = () => navigator.clipboard?.writeText(JSON.stringify({ settings: target.settings, config: target.config }, null, 2));

  return (
    <aside className={`bsc${open ? '' : ' bsc--closed'}`}>
      <header>
        <strong>{title}</strong>
        <span>
          <button type="button" onClick={exportJson}>copy JSON</button>
          <button type="button" onClick={() => setOpen(!open)}>{open ? '–' : '+'}</button>
        </span>
      </header>
      {open && (
        <div className="bsc-body">
          {targets.length > 1 && (
            <div className="bsc-tabs">
              {targets.map((tg, i) => (
                <button key={tg.id} type="button" className={i === active ? 'on' : ''} onClick={() => setActive(i)}>{tg.label}</button>
              ))}
            </div>
          )}
          {groups.map((g) => (
            <details key={g.title} open>
              <summary>{g.title}</summary>
              {g.fields.map(field)}
            </details>
          ))}
        </div>
      )}
    </aside>
  );
}
