// Prints the factor catalogue as the agent prompt section: node research/dump-factors.ts
import { FACTORS, FACTOR_GROUPS } from '../src/data/openDirectory/factors.ts'
let g = ''
for (const f of FACTORS) {
  if (f.group !== g) { g = f.group; console.log(`\n## ${FACTOR_GROUPS[f.group]}`) }
  const opts = f.options ? ` Options: ${f.options.join(' | ')}.` : ''
  console.log(`- ${f.id} (${f.kind}): ${f.question}${opts}`)
}
