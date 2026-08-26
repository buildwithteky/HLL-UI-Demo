import { HLLButton } from './components/hll-button';
import GradientRevealTextA from './components/heading-anim/GradientRevealText-A.jsx';
import GradientRevealTextB from './components/heading-anim/GradientRevealText-B.jsx';
import Ripple from './components/ripple/Ripple.jsx';

// This demonstrates the actual reusable component — same import a consumer
// app would use — not a separate demo-only implementation. Variant is the
// only thing that changes between these; everything else (shape, blur,
// glow, hover/click behavior, typography) is shared.
export default function App() {
  return (
    <>
      {/* Buttons */}

      {/* <HLLButton variant="enterprise">Enterprise</HLLButton>
      <HLLButton variant="services">Services</HLLButton>
      <HLLButton variant="industries">Industries</HLLButton> */}

      {/* Text Animations */}

      {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <GradientRevealTextA text="Intelligence and Imagination" />
        <GradientRevealTextB text="Intelligence and Imagination" />
      </div> */}

      {/* Ripple */}
      <Ripple />
    </>
  );
}
