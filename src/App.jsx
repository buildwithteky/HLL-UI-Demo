import { HLLButton } from './components/hll-button';
import { HLLOutlineButton } from './components/hll-outline-button';
import { GradientRevealTextSlow } from './components/heading-anim-slow';
import { GradientRevealTextNormal } from './components/heading-anim-normal';
import { Ripple } from './components/ripple';
import { CornerRipple } from './components/cornerripple';
import { OurPromise } from './components/our-promise';
import { Tag } from './components/tag';
import { Shader } from './components/shader';
import { BottomShader } from './components/bottom-shader';
import ServicesScrollDemo from './components/bottom-shader/ServicesScrollDemo.jsx';

// This demonstrates the actual reusable components — same imports a
// consumer app would use — not a separate demo-only implementation.
// `variant` is the only thing that changes between these; everything else
// (shape, blur, glow, motion, hover/click behavior, typography) is shared.
// HLLButton/HLLOutlineButton/Shader/BottomShader all draw from the same
// five top-nav menu-item gradients (services/industries/engagement/about/
// contact) plus the six per-service gradients (hll-ai/hll-trust/
// hll-foundation/hll-ontology/hll-people/hll-application).
export default function App() {
  return (
    <>
      {/* Buttons */}

      {/* <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 24 }}>
        <HLLButton variant="services">Services</HLLButton>
        <HLLButton variant="industries">Industries</HLLButton>
        <HLLButton variant="engagement">Engagement</HLLButton>
        <HLLButton variant="about">About</HLLButton>
        <HLLButton variant="contact">Contact</HLLButton>
      </div> */}

      {/* <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 24 }}>
        <HLLButton variant="hll-ai">HLL AI</HLLButton>
        <HLLButton variant="hll-trust">HLL Trust</HLLButton>
        <HLLButton variant="hll-foundation">HLL Foundation</HLLButton>
        <HLLButton variant="hll-ontology">HLL Ontology</HLLButton>
        <HLLButton variant="hll-people">HLL People</HLLButton>
        <HLLButton variant="hll-application">HLL Application</HLLButton>
      </div> */}

      {/* <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 24 }}>
        <HLLOutlineButton variant="services">Services</HLLOutlineButton>
        <HLLOutlineButton variant="industries">Industries</HLLOutlineButton>
        <HLLOutlineButton variant="engagement">Engagement</HLLOutlineButton>
        <HLLOutlineButton variant="about">About</HLLOutlineButton>
        <HLLOutlineButton variant="contact">Contact</HLLOutlineButton>
        <HLLOutlineButton variant="hll-ontology">Data Engineering</HLLOutlineButton>
      </div> */}

      {/* <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 24 }}>
        <HLLOutlineButton variant="hll-ai">HLL AI</HLLOutlineButton>
        <HLLOutlineButton variant="hll-trust">HLL Trust</HLLOutlineButton>
        <HLLOutlineButton variant="hll-foundation">HLL Foundation</HLLOutlineButton>
        <HLLOutlineButton variant="hll-ontology">HLL Ontology</HLLOutlineButton>
        <HLLOutlineButton variant="hll-people">HLL People</HLLOutlineButton>
        <HLLOutlineButton variant="hll-application">HLL Application</HLLOutlineButton>
      </div> */}

      {/* Text Animations */}

      {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <GradientRevealTextSlow text="Intelligence and Imagination" variant="hll-ai" />
        <GradientRevealTextSlow text="Intelligence and Imagination" variant="hll-trust" />
        <GradientRevealTextSlow text="Intelligence and Imagination" variant="hll-foundation" />
        <GradientRevealTextSlow text="Intelligence and Imagination" variant="hll-ontology" />
        <GradientRevealTextSlow text="Intelligence and Imagination" variant="hll-people" />
        <GradientRevealTextSlow text="Intelligence and Imagination" variant="hll-application" />
      </div> */}

      {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <GradientRevealTextNormal text="Intelligence and Imagination" variant="hll-ai" />
        <GradientRevealTextNormal text="Intelligence and Imagination" variant="hll-trust" />
        <GradientRevealTextNormal text="Intelligence and Imagination" variant="hll-foundation" />
        <GradientRevealTextNormal text="Intelligence and Imagination" variant="hll-ontology" />
        <GradientRevealTextNormal text="Intelligence and Imagination" variant="hll-people" />
        <GradientRevealTextNormal text="Intelligence and Imagination" variant="hll-application" />
      </div> */}

      {/* Ripple / CornerRipple */}
      {/* <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 24 }}>
        <Ripple variant="hll-ai" />
        <Ripple variant="hll-trust-and-governance" />
        <Ripple variant="hll-foundation" />
        <Ripple variant="hll-ontology" />
        <Ripple variant="hll-people-and-policy" />
        <Ripple variant="hll-application" />
      </div> */}
      {/* <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 24 }}>
        <CornerRipple variant="hll-ai" />
        <CornerRipple variant="hll-trust-and-governance" />
        <CornerRipple variant="hll-foundation" />
        <CornerRipple variant="hll-ontology" />
        <CornerRipple variant="hll-people-and-policy" />
        <CornerRipple variant="hll-application" />
      </div> */}

      {/* Tags */}
      {/* <Tag variant="warm">Warm</Tag>
      <Tag variant="cool">Cool</Tag> */}

      {/* <OurPromise/> */}

      {/* Shader — fixed fullscreen by default (shader.css); only one should
          be mounted at a time, they'd otherwise stack on top of each other. */}
      {/* <Shader variant="services" /> */}
      {/* <Shader variant="industries" /> */}
      {/* <Shader variant="engagement" /> */}
      {/* <Shader variant="about" /> */}
      {/* <Shader variant="contact" /> */}
      {/* <Shader variant="hll-ai" /> */}
      {/* <Shader variant="hll-trust" /> */}
      {/* <Shader variant="hll-foundation" /> */}
      {/* <Shader variant="hll-ontology" /> */}
      {/* <Shader variant="hll-people" /> */}
      {/* <Shader variant="hll-application" /> */}

      {/* BottomShader — fixed to the bottom of the viewport, full width, by
          default (bottom-shader.css); only one should be mounted at a time. */}
      {/* <BottomShader variant="services" /> */}
      {/* <BottomShader variant="industries" /> */}
      {/* <BottomShader variant="engagement" /> */}
      {/* <BottomShader variant="about" /> */}
      {/* <BottomShader variant="contact" /> */}
      {/* <BottomShader variant="hll-ai" /> */}
      {/* <BottomShader variant="hll-trust" /> */}
      {/* <BottomShader variant="hll-foundation" /> */}
      {/* <BottomShader variant="hll-ontology" /> */}
      {/* <BottomShader variant="hll-people" /> */}
      {/* <BottomShader variant="hll-application" /> */}

      {/* BottomShader scroll-transition demo — Services.png as the page's
          own scrollable content, BottomShader smoothly ramping up
          shatter.scale/amount and crossfading its hard-light blend into a
          plain cap once the page's actually scrolled to the end. See
          bottom-shader/ServicesScrollDemo.jsx. */}
          
      <ServicesScrollDemo />
    </>
  );
}
// 