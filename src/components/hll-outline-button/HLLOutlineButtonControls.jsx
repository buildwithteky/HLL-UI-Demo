// HLLOutlineButtonControls — unrestricted live panel for the outline button.
// Every value the button reads is exposed: shape, per-state shader params
// (base + hover), effect toggles, cursor lens, interaction, render flags,
// typography/box/CSS, and every formerly-hardcoded shader constant
// (DEFAULT_TUNE). Inputs are plain text-backed numbers: any sign, decimals,
// exponents, zero, huge values — no min/max/clamp/range anywhere. Edits
// mutate the live definition in place; the shader re-reads it every frame.
import { useState } from 'react';
import { NumInput, ColorInput } from '../bottom-shader/BottomShaderControls.jsx';
import { getPath, setPath } from '../bottom-shader/bottom-shader-controls-schema.js';
import { DEFAULT_TUNE } from './hll-outline-button-runtime.js';
import '../bottom-shader/bottom-shader-controls.css';

const n = (label, path, step = 0.01) => ({ type: 'num', label, path, step });
const b = (label, path) => ({ type: 'bool', label, path });
const stepFor = (v) => {
  const a = Math.abs(v);
  return !a ? 0.01 : a >= 100 ? 1 : a >= 10 ? 0.5 : a >= 1 ? 0.1 : a >= 0.1 ? 0.01 : 0.001;
};
const pretty = (k) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

const STATE_PARAMS = [
  ['blur', 0.5], ['glowIntensity', 0.1], ['glowRadius', 0.05], ['bloom', 0.1], ['scatter', 0.1],
  ['fresnel', 0.1], ['noiseAmount', 0.01], ['noiseScale', 0.1], ['noiseSpeed', 0.05],
  ['chromatic', 0.001], ['fillOpacity', 0.05], ['opacity', 0.05], ['gradientAngle', 1], ['saturation', 0.05],
];
const EFFECTS = ['blur', 'glow', 'bloom', 'scatter', 'fresnel', 'noise', 'chromatic'];

const stateGroup = (state) => ({
  title: `${pretty(state)} state`,
  fields: [
    { type: 'colors', label: 'Gradient stop', path: `d.params.${state}.colors` },
    { type: 'color', label: 'Glow color', path: `d.params.${state}.glowColor` },
    ...STATE_PARAMS.map(([k, st]) => n(pretty(k), `d.params.${state}.${k}`, st)),
    ...EFFECTS.map((e) => b(`Effect on: ${e}`, `d.effects.${state}.${e}`)),
  ],
});

export const OUTLINE_GROUPS = [
  {
    title: 'Shape & Box',
    fields: [
      { type: 'select', label: 'Shape type', path: 'd.shape.type', options: ['circle', 'roundRect', 'polygon', 'star', 'mask'] },
      n('Shape size', 'd.shape.size'), n('Corner radius', 'd.shape.cornerRadius'),
      n('Sides', 'd.shape.sides', 1), n('Rotation (deg)', 'd.shape.rotation', 1),
      n('Stroke width (0 = filled)', 'd.shape.strokeWidth', 0.005),
      { type: 'text', label: 'Mask image src', path: 'd.shape.maskSrc' },
      n('Box height (px)', 'd.box.height', 1), n('Box width (px, unused: hugs label)', 'd.box.width', 1),
      n('Box scale', 'd.box.scale'), b('Box auto', 'd.box.auto'),
      n('Fixed CSS width (px, empty = hug label)', 'd.css.width', 1),
    ],
  },
  stateGroup('base'),
  stateGroup('hover'),
  {
    title: 'Global',
    fields: [n('Intensity', 'd.intensity'), b('Hover linked', 'd.hoverLinked'),
      b('Render: dissolve', 'd.render.dissolve'), b('Render: premultiplied', 'd.render.premultiplied')],
  },
  {
    title: 'Cursor Lens & Interaction',
    fields: [
      b('Hover enabled', 'd.interaction.hover'), b('Cursor light', 'd.interaction.cursorLight'),
      b('Click pulse', 'd.interaction.clickPulse'), b('Click flash (blink to white)', 'd.interaction.clickFlash'), b('Color on hover', 'd.interaction.colorOnHover'),
      n('Speed', 'd.interaction.speed', 0.5),
      n('Rest light X', 'd.interaction.lightPos.0'), n('Rest light Y', 'd.interaction.lightPos.1'),
      n('Focus radius', 'd.interaction.cursorFocusRadius'), n('Focus edge', 'd.interaction.cursorFocusEdge'),
      n('Cursor radius', 'd.interaction.cursorRadius'), n('Cursor edge', 'd.interaction.cursorEdge'),
      n('Cursor aspect', 'd.interaction.cursorAspect'), n('Cursor expand', 'd.interaction.cursorExpand'),
      n('Cursor color leak', 'd.interaction.cursorColorLeak'), n('Cursor transparency', 'd.interaction.cursorTransparency'),
    ],
  },
  {
    title: 'Label & Typography',
    fields: [
      { type: 'text', label: 'Label text (when no children)', path: 'd.text.content' },
      { type: 'text', label: 'Font family', path: 'd.text.fontFamily' },
      n('Font size', 'd.text.fontSize', 1), n('Font weight', 'd.text.fontWeight', 50),
      n('Letter spacing', 'd.text.letterSpacing', 0.25), n('Horizontal padding', 'd.text.padding', 1),
      n('Line height (empty = inherit)', 'd.css.lineHeight'),
      { type: 'text', label: 'Text transform (CSS)', path: 'd.css.textTransform' },
      { type: 'color', label: 'Label color', path: 'd.text.color' },
      { type: 'color', label: 'Label hover color', path: 'd.text.hoverColor' },
    ],
  },
  {
    title: 'Shader constants (formerly hardcoded)',
    fields: Object.keys(DEFAULT_TUNE).map((k) => n(pretty(k), `d.tune.${k}`, stepFor(DEFAULT_TUNE[k]))),
  },
];

export default function HLLOutlineButtonControls({ targets, groups = OUTLINE_GROUPS, title = 'Outline button', onChange }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(true);
  const [, bump] = useState(0);
  const target = targets[active];
  const root = { d: target.def };

  const set = (path, value) => {
    setPath(root, path, value);
    bump((x) => x + 1);
    onChange?.(target);
  };

  const field = (f) => {
    const v = getPath(root, f.path);
    const def = f.path.startsWith('d.tune.') ? DEFAULT_TUNE[f.path.slice(7)] : undefined;
    const row = (control) => <label key={f.path} className="bsc-row"><span>{f.label}</span>{control}</label>;
    if (f.type === 'num') {
      return (
        <label key={f.path} className="bsc-row" onDoubleClick={() => def !== undefined && set(f.path, undefined)} title={def !== undefined ? `default ${def} — double-click label to reset` : undefined}>
          <span>{f.label}</span>
          <NumInput value={v ?? def} step={f.step} nullable placeholder={def === undefined ? 'unset' : String(def)} onChange={(x) => set(f.path, x)} />
        </label>
      );
    }
    if (f.type === 'bool') return row(<input type="checkbox" checked={!!v} onChange={(e) => set(f.path, e.target.checked)} />);
    if (f.type === 'text') return row(<input type="text" value={v ?? ''} spellCheck={false} onChange={(e) => set(f.path, e.target.value || (f.path.endsWith('maskSrc') ? null : ''))} />);
    if (f.type === 'select') return row(<select value={v ?? f.options[0]} onChange={(e) => set(f.path, e.target.value)}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>);
    if (f.type === 'color') return row(<ColorInput value={v} onChange={(x) => set(f.path, x)} />);
    if (f.type === 'colors') {
      const list = v || [];
      return (
        <div key={f.path} className="bsc-list">
          {list.map((c, i) => (
            <div key={i} className="bsc-row">
              <span>{f.label} {i + 1}</span>
              <ColorInput value={c} onChange={(x) => set(f.path, list.map((o, j) => (j === i ? x : o)))} />
              <button type="button" onClick={() => list.length > 2 && set(f.path, list.filter((_, j) => j !== i))}>remove</button>
            </div>
          ))}
          {/* the shader holds at most 6 stops (MAX_COLOR_STOPS / MAX_STOPS) */}
          <button type="button" onClick={() => list.length < 6 && set(f.path, [...list, list[list.length - 1] || '#ffffff'])}>+ add stop (max 6, shader array size)</button>
        </div>
      );
    }
    return null;
  };

  return (
    <aside className={`bsc${open ? '' : ' bsc--closed'}`}>
      <header>
        <strong>{title}</strong>
        <span>
          <button type="button" onClick={() => navigator.clipboard?.writeText(JSON.stringify(target.def, null, 2))}>copy JSON</button>
          <button type="button" onClick={() => setOpen(!open)}>{open ? '–' : '+'}</button>
        </span>
      </header>
      {open && (
        <div className="bsc-body">
          {targets.length > 1 && (
            <div className="bsc-tabs" style={{ flexWrap: 'wrap' }}>
              {targets.map((tg, i) => <button key={tg.id} type="button" className={i === active ? 'on' : ''} onClick={() => setActive(i)}>{tg.label}</button>)}
            </div>
          )}
          {groups.map((g) => <details key={g.title} open={g.title === 'Shape & Box'}><summary>{g.title}</summary>{g.fields.map(field)}</details>)}
        </div>
      )}
    </aside>
  );
}
