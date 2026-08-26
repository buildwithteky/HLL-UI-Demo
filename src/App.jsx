import { HLLButton } from './components/hll-button';

// This demonstrates the actual reusable component — same import a consumer
// app would use — not a separate demo-only implementation. Variant is the
// only thing that changes between these; everything else (shape, blur,
// glow, hover/click behavior, typography) is shared.
export default function App() {
  return (
    <>
      <HLLButton variant="enterprise">Enterprise</HLLButton>
      <HLLButton variant="services">Services</HLLButton>
      <HLLButton variant="industries">Industries</HLLButton>
    </>
  );
}
