#!/usr/bin/env node
/**
 * Quality gate for research records: every evidence quote must appear
 * verbatim (whitespace and quote marks normalised) in a cached copy of the
 * page it cites. Catches paraphrased or invented quotes before anything is
 * published.
 *
 *   node research/verify.mjs            all tools
 *   node research/verify.mjs elicit     one tool
 *
 * Also checks option values against the factor catalogue. Exit code 1 when
 * anything fails, so it can run in CI.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FACTORS } from '../src/data/openDirectory/factors.ts'

/** Allowed for every factor: we looked and the vendor doesn't say. */
const UNIVERSAL = ['unknown', 'none-found', 'not-applicable']
const here = path.dirname(fileURLToPath(import.meta.url))
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// Test runs keep records in research/test/<arm>/tools/ and pages in research/cache/test/<arm>/<id>/:
//   node research/verify.mjs <id> --arm <arm>
const argv = process.argv.slice(2)
const armAt = argv.indexOf('--arm')
const arm = armAt >= 0 ? argv[armAt + 1] : null
const only = argv.find((a, i) => !a.startsWith('--') && (armAt < 0 || i !== armAt + 1))
const toolsDir = arm ? path.join(here, 'test', arm, 'tools') : path.join(here, 'tools')
const cacheRoot = arm ? path.join(here, 'cache', 'test', arm) : path.join(here, 'cache', 'tools')
const files = readdirSync(toolsDir).filter((f) => f.endsWith('.json') && (!only || f === `${only}.json`))
let failures = 0

for (const file of files) {
  const rec = JSON.parse(readFileSync(path.join(toolsDir, file), 'utf8'))
  const cacheDir = path.join(cacheRoot, rec.id)
  const pages = existsSync(cacheDir)
    ? readdirSync(cacheDir).map((f) => {
        const raw = readFileSync(path.join(cacheDir, f), 'utf8')
        const url = raw.match(/^URL: (.*)$/m)?.[1] ?? ''
        const final = raw.match(/^FINAL_URL: (.*)$/m)?.[1] ?? ''
        return { urls: [url, final], text: norm(raw) }
      })
    : []
  const all = pages.map((p) => p.text).join('\n')
  let ok = 0
  const problems = []
  for (const [id, fact] of Object.entries(rec.facts ?? {})) {
    const factor = FACTORS.find((f) => f.id === id)
    if (!factor) problems.push(`${id}: not in the factor catalogue`)
    else if (factor.options) {
      const vals = Array.isArray(fact.value) ? fact.value : [fact.value]
      const bad = vals.filter((v) => !factor.options.includes(String(v)) && !UNIVERSAL.includes(String(v)))
      if (bad.length) problems.push(`${id}: value ${JSON.stringify(bad)} not in options`)
    }
    for (const ev of fact.evidence ?? []) {
      if (!ev.quote) continue
      const q = norm(ev.quote)
      const cited = pages.filter((p) => p.urls.some((u) => u && (u === ev.url || u.replace(/\/$/, '') === ev.url.replace(/\/$/, ''))))
      if (cited.some((p) => p.text.includes(q))) ok++
      else if (all.includes(q)) {
        ok++
        problems.push(`${id}: quote found, but in a different cached page than ${ev.url}`)
      } else problems.push(`${id}: quote NOT FOUND in cache: "${ev.quote.slice(0, 80)}" (${ev.url})`)
    }
  }
  const hard = problems.filter((p) => /NOT FOUND|not in/.test(p)).length
  failures += hard
  console.log(`${rec.id}: ${ok} quotes verified, ${hard} failures, ${problems.length - hard} warnings`)
  for (const p of problems) console.log(`  - ${p}`)
}
process.exit(failures ? 1 : 0)
