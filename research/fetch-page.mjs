#!/usr/bin/env node
/**
 * Fetch a public page and cache its text so facts can be re-extracted later
 * without crawling again (e.g. when a factor is added to
 * src/data/openDirectory/factors.ts).
 *
 *   node research/fetch-page.mjs <bucket> <url> [--links]
 *
 * <bucket> is a tool id (tools/<id>) or a university slug (unis/<slug>).
 * Writes research/cache/<bucket>/<slug-of-url>.txt with a small header
 * (URL, final URL, status, date) and prints the path plus the page length.
 * --links also prints same-site links (for finding the privacy policy,
 * sub-processor list, trust page, software list...).
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchPage, htmlToText } from '../server/pages.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const [bucket, url, ...flags] = process.argv.slice(2)
if (!bucket || !url) {
  console.error('usage: node research/fetch-page.mjs <bucket> <url> [--links]')
  process.exit(2)
}

const slug = (u) =>
  u.replace(/^https?:\/\//, '').replace(/[?#].*$/, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 120) || 'index'

/** Headless Chromium for pages that only render with JavaScript. */
function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH
  const base = path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright')
  if (existsSync(base)) {
    for (const d of readdirSync(base).filter((n) => /^chromium-\d+$/.test(n)).sort().reverse()) {
      for (const p of [path.join(base, d, 'chrome-win64', 'chrome.exe'), path.join(base, d, 'chrome-linux', 'chrome'), path.join(base, d, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium')])
        if (existsSync(p)) return p
    }
  }
  for (const p of ['/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/google-chrome']) if (existsSync(p)) return p
  return null
}

function renderWithChrome(target) {
  const chrome = findChrome()
  if (!chrome) return null
  const r = spawnSync(chrome, ['--headless=new', '--disable-gpu', '--no-sandbox', '--virtual-time-budget=10000', '--dump-dom', target], { encoding: 'utf8', timeout: 45_000, maxBuffer: 30_000_000 })
  if (!r.stdout || r.stdout.length < 200) return null
  return htmlToText(r.stdout, target)
}

/** Text of a PDF (DPAs, VPATs and HECVATs are often PDFs). */
async function pdfText(bytes) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: true, isEvalSupported: false }).promise
  const out = []
  for (let i = 1; i <= doc.numPages; i++) {
    const content = await (await doc.getPage(i)).getTextContent()
    out.push(content.items.map((it) => ('str' in it ? it.str + (it.hasEOL ? '\n' : '') : '')).join(' '))
  }
  return out.join('\n\n').replace(/[ \t]+/g, ' ')
}

try {
  const page = await fetchPage(url, { timeoutMs: 25_000 })
  if ((page.kind === 'binary' && /pdf/i.test(page.contentType ?? '')) || (/\.pdf($|\?)/i.test(page.url) && !page.text)) {
    page.text = await pdfText(page.bytes)
    page.kind = 'pdf'
  }
  if (page.kind === 'html' && (page.text ?? '').length < 800) {
    const rendered = renderWithChrome(page.url)
    if (rendered && rendered.text.length > (page.text ?? '').length) {
      page.text = rendered.text
      page.links = rendered.links?.length ? rendered.links : page.links
      page.title = page.title || rendered.title
      page.kind = 'html (rendered)'
    }
  }
  const dir = path.join(here, 'cache', bucket)
  await mkdir(dir, { recursive: true })
  const file = path.join(dir, `${slug(page.url)}.txt`)
  const today = new Date().toISOString().slice(0, 10)
  const header = `URL: ${url}\nFINAL_URL: ${page.url}\nSTATUS: ${page.status}\nRETRIEVED: ${today}\nTITLE: ${page.title ?? ''}\n---\n`
  await writeFile(file, header + (page.text ?? ''), 'utf8')
  console.log(`saved ${path.relative(process.cwd(), file)} (${(page.text ?? '').length} chars, status ${page.status}, ${page.kind})`)
  // Bot protection: never try to get around it. Record and move on; a human
  // checks these pages (research/README.md, "blocked pages").
  if ([401, 403, 429].includes(page.status) || /request blocked|request could not be satisfied|access denied|verify you are (a )?human|captcha|attention required/i.test((page.text ?? '').slice(0, 3000)))
    console.log('BLOCKED: the site refuses automated reading. Try WebFetch once; if that fails too, record the factor as unknown with note "source blocked" and add the URL to blocked.txt.')
  if (flags.includes('--links')) {
    const host = new URL(page.url).hostname.replace(/^www\./, '')
    const seen = new Set()
    for (const l of page.links ?? []) {
      try {
        const h = new URL(l.href).hostname.replace(/^www\./, '')
        if (!h.endsWith(host) && !host.endsWith(h)) continue
        if (seen.has(l.href)) continue
        seen.add(l.href)
        console.log(`  ${l.href}  ${String(l.text ?? '').trim().slice(0, 60)}`)
      } catch {
        /* skip malformed */
      }
    }
  }
} catch (e) {
  console.error(`failed: ${e.message}`)
  process.exit(1)
}
