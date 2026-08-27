import { HLLButton } from './components/hll-button';
import { GradientRevealText } from './components/heading-anim';
import { Ripple } from './components/ripple';
import { CornerRipple } from './components/cornerripple';
import { OurPromise } from './components/our-promise';
import { Tag } from './components/tag';

// This demonstrates the actual reusable components — same imports a
// consumer app would use — not a separate demo-only implementation.
// `variant` is the only thing that changes between these; everything else
// (shape, blur, glow, motion, hover/click behavior, typography) is shared,
// and all three components (plus HLLButton) draw from the same
// enterprise/services/industries gradients.
export default function App() {
  return (
    <>
      {/* Buttons */}

      {/* <HLLButton variant="enterprise">Enterprise</HLLButton>
      <HLLButton variant="services">Services</HLLButton>
      <HLLButton variant="industries">Industries</HLLButton> */}

      {/* Text Animations */}

      {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <GradientRevealText text="Intelligence and Imagination" variant="enterprise" />
        <GradientRevealText text="Intelligence and Imagination" variant="services" />
        <GradientRevealText text="Intelligence and Imagination" variant="industries" />
      </div> */}

      {/* Ripple / CornerRipple */}
      {/* <Ripple variant="industries" /> */}
      {/* <Ripple variant="industries" /> */}
      {/* <CornerRipple variant="industries" /> */}

      {/* Tags */}
      <Tag variant="warm">Warm</Tag>
      <Tag variant="cool">Cool</Tag>

      {/* <OurPromise/> */}
    </>
  );
}
