// MenuTriggerOverlay.jsx — Services.png as a fullscreen backdrop, with
// Shader (the same "BlockGL — jewel refraction" WebGL2 effect used
// everywhere else in this folder — see Shader.jsx, reused as-is, not
// forked) mounted on top of it — still no `mix-blend-mode`, just plain
// alpha compositing, but with `background.transparent: true` (see
// shader-runtime.js's `transparentBg`) so the image actually shows through
// wherever the effect chain itself doesn't paint, instead of Shader's
// default opaque plate hiding it completely. Shader's own host (shader.css's
// `.shader`) is already `position: fixed; inset: 0`, so it always covers
// the full viewport on its own regardless of this component's own layout —
// the image just needs to sit fullscreen behind it.
//
// This is a placeholder background — swap `servicesImg` for the actual
// menu-trigger UI once that's ready.
import Shader from './Shader.jsx';
import { BASE_SETTINGS } from './shader-definition.js';
import servicesImg from '../bottom-shader/Services.png';
import './menu-trigger-overlay.css';

// Cloned from BASE_SETTINGS rather than mutating the shared default (other
// Shader instances importing that same constant would otherwise see their
// background silently turn transparent too).
const TRANSPARENT_SETTINGS = { ...BASE_SETTINGS, background: { ...BASE_SETTINGS.background, transparent: true } };

export default function MenuTriggerOverlay({ variant = 'services', colors, style, ...rest }) {
  return (
    <div className="menu-trigger-overlay">
      <img src={servicesImg} alt="" className="menu-trigger-overlay__image" />
      <Shader
        variant={variant}
        colors={colors}
        settings={TRANSPARENT_SETTINGS}
        style={{ background: 'transparent', ...style }}
        {...rest}
      />
    </div>
  );
}
