// Reusable reveal animations.
//  <TextReveal>   word-by-word blur + fade, played when text enters the viewport
//  <ImageReveal>  height + blur image reveal (scrubbed, fit-to-viewport, or triggered)
//  useTextReveal / useImageReveal / useCardReveal   page-wide, auto-detecting hooks
export { default as TextReveal } from './TextReveal.jsx';
export { default as ImageReveal } from './ImageReveal.jsx';
export { useTextReveal, useImageReveal, useCardReveal } from './hooks.js';
export { TEXT_REVEAL_DEFAULTS } from './text-reveal-core.js';
export { IMAGE_REVEAL_DEFAULTS, IMAGE_TRIGGER_DEFAULTS } from './image-reveal-core.js';
