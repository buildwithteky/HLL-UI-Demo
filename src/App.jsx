import HllButton from './components/HllButton';
import { DEFINITION } from './components/HllButton/definition.js';

// Every value below (box size, label font size/weight/spacing, resting +
// hover color) comes straight from the preset's own definition — nothing
// here is a custom addition, it's just wiring the preset's own values
// through the host element the component needs.
const { box, text } = DEFINITION;

export default function App() {
  return (
    <HllButton
      as="button"
      className="hll-button"
      style={{
        width: box.width,
        height: box.height,
        '--fx-label-color': text.color,
        '--fx-label-hover-color': text.hoverColor,
      }}
    >
      <span
        className="hll-button__label"
        style={{
          fontFamily: text.fontFamily || 'inherit',
          fontSize: text.fontSize,
          fontWeight: text.fontWeight,
          letterSpacing: text.letterSpacing,
        }}
      >
        {text.content}
      </span>
    </HllButton>
  );
}
