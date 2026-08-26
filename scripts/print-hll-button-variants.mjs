// Dev-only doc helper — not part of the exported component package.
// Regenerates the "Variants" table in
// src/components/hll-button/README.md from the single source of truth
// (VARIANT_GRADIENTS in hll-button-variants.js), so adding a variant never
// requires hand-editing the docs table separately.
//
// Usage: node scripts/print-hll-button-variants.mjs
import { VARIANT_GRADIENTS } from '../src/components/hll-button/hll-button-variants.js';

const rows = Object.entries(VARIANT_GRADIENTS).map(
  ([name, { usage, colors }]) => `| \`${name}\` | ${usage} | ${colors.join(' → ')} |`
);

console.log('| Variant | Usage | Gradient |');
console.log('| --- | --- | --- |');
console.log(rows.join('\n'));
