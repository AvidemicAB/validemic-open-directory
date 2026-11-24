#!/usr/bin/env node
/**
 * Web search for research agents through Staan (staan.ai), the EU search
 * index from Qwant and Ecosia. Use it to FIND a vendor's privacy policy, DPA,
 * sub-processor list or trust page; then read the page itself with
 * fetch-page.mjs. Snippets are for finding pages only: never quote them.
 *
 *   node research/search.mjs "deepl sub-processors"
 *   node research/search.mjs "site:deepl.com data processing agreement"
 *
 * Needs STAAN_API_KEY in research/.env.local (gitignored; never commit or print it).
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
function key() {
  if (process.env.STAAN_API_KEY) return process.env.STAAN_API_KEY
  try {
    const m = readFileSync(join(here, '.env.local'), 'utf8').match(/^STAAN_API_KEY=(.+)$/m)
    return m?.[1].trim()
  } catch {
    return undefined
  }
}

const q = process.argv.slice(2).join(' ').trim()
if (!q) {
  console.error('Usage: node research/search.mjs "<query>"')
  process.exit(2)
}
const k = key()
if (!k) {
  console.error('STAAN_API_KEY missing (research/.env.local). Fall back to your built-in web search.')
  process.exit(3)
}

const res = await fetch('https://api.staan.ai/v2/search/web', {
  method: 'POST',
  headers: { Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ q: q.slice(0, 400), market: 'en-us' }),
  signal: AbortSignal.timeout(15000),
}).catch((e) => ({ ok: false, status: 0, statusText: String(e) }))
if (!res.ok) {
  console.error(`Staan search failed: ${res.status} ${res.statusText}`)
  process.exit(4)
}
const data = await res.json()
const clean = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
const results = data?.web?.results ?? []
if (!results.length) console.log('(no results)')
results.forEach((r, i) => console.log(`${i + 1}. ${clean(r.title)}\n   ${r.url}\n   ${clean(r.snippet).slice(0, 200)}`))
