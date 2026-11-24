/**
 * The open directory dataset: every tool we know universities list
 * (data/peerTools*.ts, public listings only — our own customer records are
 * left out so Avidnote/Kahubi get no head start) joined with the research
 * records agents write to research/tools/<id>.json.
 *
 * Alternatives and "best match" come from one rule applied to every tool
 * (see alternativesFor). Nothing here may special-case a vendor.
 */
import { PEER_TOOLS, type PeerCategory, type PeerListing } from '../peerTools'
import { isEuEea } from '../../components/ui'
import { FACTORS, answerState, toneOf, type Fact, type ToolRecord } from './factors'
import { countryName } from '../universities'

const modules = import.meta.glob<{ default: ToolRecord }>('/research/tools/*.json', { eager: true })
const RECORDS: ToolRecord[] = Object.values(modules).map((m) => m.default)

export interface DirectoryTool {
  id: string
  name: string
  website: string
  category?: PeerCategory
  tagline?: string
  record?: ToolRecord
  /** Public listings only (each has a sourceUrl). */
  listings: PeerListing[]
}

/** A few research ids differ from the peer list's. */
const ALIASES: Record<string, string> = { 'otter-ai': 'otter' }

function build(): DirectoryTool[] {
  const byId = new Map<string, DirectoryTool>()
  for (const p of PEER_TOOLS) {
    byId.set(p.id, { id: p.id, name: p.name, website: p.website, category: p.category, listings: p.listings.filter((l) => l.sourceUrl).map(({ university, country, sourceUrl, retrievedAt }) => ({ university, country, sourceUrl, retrievedAt })) })
  }
  for (const r of RECORDS) {
    const id = byId.has(r.id) ? r.id : ALIASES[r.id] && byId.has(ALIASES[r.id]) ? ALIASES[r.id] : r.id
    const existing = byId.get(id)
    // The record's name wins when it is the more specific one ("ChatGPT (Free, Plus)" over "ChatGPT").
    const name = r.name && r.name !== existing?.name && r.name.startsWith(existing?.name ?? '') ? r.name : existing?.name || r.name
    if (existing) Object.assign(existing, { record: r, tagline: r.tagline, name, category: existing.category ?? r.category })
    else byId.set(id, { id, name: r.name, website: r.website, tagline: r.tagline, category: r.category, record: r, listings: [] })
  }
  return [...byId.values()].sort((a, b) => Number(Boolean(b.record)) - Number(Boolean(a.record)) || b.listings.length - a.listings.length || a.name.localeCompare(b.name))
}

export const DIRECTORY: DirectoryTool[] = build()

export const toolById = (id: string) => DIRECTORY.find((t) => t.id === id)

export function fact(t: DirectoryTool, id: string): Fact | undefined {
  return t.record?.facts[id]
}

export function values(f: Fact | undefined): string[] {
  if (!f) return []
  return Array.isArray(f.value) ? f.value.map(String) : [String(f.value)]
}

export function universityCount(t: DirectoryTool): number {
  return new Set(t.listings.map((l) => l.university)).size
}

const isCode = (c: string) => /^[A-Z]{2}$/.test(c)
const inEuEea = (c: string) => isEuEea(c) || c === 'EU'

/** Country of the ultimate owner, when the vendor is owned by another company (else empty). */
export function parentCountries(t: DirectoryTool): string[] {
  return values(fact(t, 'parent_country')).filter(isCode)
}

/**
 * Vendor established in the EU/EEA and, when it has a parent company, owned
 * from the EU/EEA too: an Irish subsidiary of a US company is not shown as EU,
 * because laws that reach the parent (e.g. the US CLOUD Act) reach it as well.
 */
export function isEuVendor(t: DirectoryTool): boolean {
  if (!values(fact(t, 'vendor_country')).some(inEuEea)) return false
  // The owner must be shown to be in the EU too, or there must be no separate owner.
  // An unknown owner gets no flag: the flag is a claim, and we can't back it.
  const parent = values(fact(t, 'parent_country'))
  if (parent.includes('not-applicable')) return true
  const codes = parent.filter(isCode)
  return codes.length > 0 && codes.every(inEuEea)
}

/** Content can be kept in the EU/EEA: by default, as an option, or the hosting is there. */
export function hasEuStorage(t: DirectoryTool): boolean {
  if (['default', 'option'].some((v) => values(fact(t, 'eu_residency')).includes(v))) return true
  return values(fact(t, 'hosting_regions')).some((c) => c === 'EU' || isEuEea(c))
}

/**
 * Tools made by Avidemic AB, which maintains the directory. Labelled on their own
 * page and wherever they appear as an alternative; never ranked differently.
 */
export const OWNED_IDS = new Set(['kahubi', 'avidnote', 'validemic', 'docdemic'])
export const isOwned = (t: DirectoryTool) => OWNED_IDS.has(t.id)

/**
 * Outbound link to a tool's own site. Every vendor gets the same tags, so each
 * can see the referral in its own analytics (and we can see ours).
 */
export type LinkPosition = 'header' | 'closest-match' | 'alternative-row'

export function outboundUrl(t: DirectoryTool, from?: DirectoryTool, position?: LinkPosition): string {
  try {
    const u = new URL(t.website)
    u.searchParams.set('utm_source', 'validemic')
    u.searchParams.set('utm_medium', 'directory')
    u.searchParams.set('utm_campaign', from ? 'alternatives' : 'tool-page')
    if (from) u.searchParams.set('utm_content', from.id)
    if (position) u.searchParams.set('utm_term', position)
    return u.toString()
  } catch {
    return t.website
  }
}

/** Count of green minus red facts over every factor — the tie-breaker. */
export function factScore(t: DirectoryTool): number {
  if (!t.record) return 0
  let s = 0
  for (const f of FACTORS) {
    const tone = toneOf(f, t.record.facts[f.id], t.record.facts)
    if (tone === 'good') s += 1
    else if (tone === 'bad') s -= 1
  }
  return s
}

const NO_ANSWER = new Set(['unknown', 'none-found'])
const GENERIC_JOBS = new Set(['notes', 'storage', 'collaboration-docs'])

export function capabilities(t: DirectoryTool): string[] {
  return values(fact(t, 'capabilities')).filter((v) => !NO_ANSWER.has(v))
}

export interface Alternative {
  tool: DirectoryTool
  /** Share of the target's capabilities this tool also covers (0..1). */
  coverage: number
  covered: number
  of: number
  /** Each of the target's jobs and whether this tool does it, for the card. */
  uses: { id: string; has: boolean }[]
  score: number
  /** Its main use is the target's main use. */
  sameMain: boolean
  /** It does the target's main job, as its main use or as one of its jobs. */
  doesMain: boolean
  /** It meets the reader's preference (e.g. an EU company). */
  preferred: boolean
}

/**
 * What the reader wants most in an alternative. EU company is the default
 * because that is why most readers come; they can switch it. The same
 * preference applies to every tool and every vendor.
 */
export type AltPreference = 'eu-company' | 'eu-storage' | 'none'
export const ALT_PREFERENCES: { id: AltPreference; label: string; test?: (t: DirectoryTool) => boolean }[] = [
  { id: 'eu-company', label: 'EU company', test: (t) => isEuVendor(t) },
  { id: 'eu-storage', label: 'Data in the EU', test: (t) => hasEuStorage(t) },
  { id: 'none', label: 'No preference' },
]
export const DEFAULT_PREFERENCE: AltPreference = 'eu-company'
export const parsePreference = (v: string | null): AltPreference => (ALT_PREFERENCES.some((p) => p.id === v) ? (v as AltPreference) : DEFAULT_PREFERENCE)

/**
 * Alternatives to a tool. Same rule for every tool:
 *  1. Candidates must cover the target's main use, share its category, or
 *     do at least half of the target's specific jobs (notes and storage don't count).
 *  2. Ranked: tools built for the same main job that meet the reader's
 *     preference (EU company by default) first; then any tool built for the
 *     same main job (so an all-in-one tool listing many jobs does not
 *     outrank one built for it), then by how many of the target's jobs they also do,
 *     then by the fact score (green minus red), then by how many
 *     universities list them.
 * The first result is the "best match". Unassessed tools in the same
 * category come last, clearly marked.
 */
export function alternativesFor(target: DirectoryTool, prefer: AltPreference = DEFAULT_PREFERENCE): { assessed: Alternative[]; unassessed: DirectoryTool[] } {
  const caps = capabilities(target)
  const main = values(fact(target, 'primary_capability')).find((v) => !NO_ANSWER.has(v) && v !== 'other')
  const assessed: Alternative[] = []
  const test = ALT_PREFERENCES.find((p) => p.id === prefer)?.test
  for (const t of DIRECTORY) {
    if (t.id === target.id || !t.record) continue
    const theirs = new Set(capabilities(t))
    const doesMain = main ? theirs.has(main) || values(fact(t, 'primary_capability'))[0] === main : false
    const sameCategory = Boolean(target.category && target.category === t.category)
    const covered = caps.filter((c) => theirs.has(c)).length
    // Jobs nearly every tool has (notes, file storage) don't make two tools alternatives.
    const specific = caps.filter((c) => !GENERIC_JOBS.has(c))
    const half = specific.length > 0 && specific.filter((c) => theirs.has(c)).length / specific.length >= 0.5
    if (!doesMain && !sameCategory && !half) continue
    const primaryMatch = Boolean(main && values(fact(t, 'primary_capability'))[0] === main)
    assessed.push({ tool: t, covered, of: caps.length, uses: caps.map((id) => ({ id, has: theirs.has(id) })), coverage: caps.length ? covered / caps.length : 0, score: factScore(t), sameMain: primaryMatch, doesMain, preferred: Boolean(test?.(t)) })
  }
  const first = (a: Alternative) => Number(a.preferred && a.sameMain)
  assessed.sort((a, b) => first(b) - first(a) || Number(b.sameMain) - Number(a.sameMain) || b.coverage - a.coverage || b.score - a.score || universityCount(b.tool) - universityCount(a.tool))
  const unassessed = target.category
    ? DIRECTORY.filter((t) => !t.record && t.id !== target.id && t.category === target.category).slice(0, 6)
    : []
  return { assessed, unassessed }
}

/**
 * Offerings that run the same models under different terms. Each member is its
 * own researched record; the tool page shows them side by side so readers see
 * that "ChatGPT" is not one answer.
 */
export interface Family {
  id: string
  label: string
  intro: string
  /** route: how you reach the models, in plain words; how: one more line of context. */
  members: { id: string; route: string; how: string }[]
}

export const FAMILIES: Family[] = [
  {
    id: 'openai',
    label: 'One set of models, four ways in',
    intro:
      "ChatGPT, the OpenAI API and Azure OpenAI all run OpenAI's GPT models. The model is the same; the contract is not. Who you have the contract with, whether your content trains future models and where it is stored depend on which way in you use.",
    members: [
      { id: 'chatgpt', route: 'Personal ChatGPT account', how: 'Free or Plus, signed up at chatgpt.com' },
      { id: 'chatgpt-edu', route: 'ChatGPT through your university', how: 'Edu or Enterprise licence the institution buys' },
      { id: 'openai-api', route: 'Inside another app', how: 'A product that calls the OpenAI API' },
      { id: 'azure-openai', route: 'Through Microsoft Azure', how: 'Same models, hosted and contracted by Microsoft' },
    ],
  },
]

export function familyOf(t: DirectoryTool): Family | undefined {
  return FAMILIES.find((f) => f.members.some((m) => m.id === t.id))
}

/** Most tools a comparison holds side by side. */
export const COMPARE_MAX = 4

/** A tool plus its closest alternatives, for "Compare alternatives" (same rule as alternativesFor). */
export function compareSetFor(t: DirectoryTool, prefer: AltPreference = DEFAULT_PREFERENCE): string[] {
  const { assessed, unassessed } = alternativesFor(t, prefer)
  // Same kind of tool first (same category, checked or not), then tools that only share some jobs.
  const same = (x: DirectoryTool) => Boolean(t.category && x.category === t.category)
  const tools = assessed.map((a) => a.tool)
  return [t, ...tools.filter(same), ...unassessed, ...tools.filter((x) => !same(x))].slice(0, COMPARE_MAX).map((x) => x.id)
}

/**
 * Ready-made comparisons: per category, the first three tools in directory
 * order (checked first, then most university listings). Same rule for every
 * vendor; our own products appear only where that rule puts them.
 */
export function suggestedComparisons(): { key: string; title: string; ids: string[] }[] {
  const order: PeerCategory[] = ['reference', 'ai', 'transcription', 'meetings', 'survey', 'statistics', 'plagiarism', 'lms']
  return order
    .map((category) => ({ key: category, title: CATEGORY_LABELS[category], ids: DIRECTORY.filter((t) => t.category === category).slice(0, 3).map((t) => t.id) }))
    .filter((s) => s.ids.length >= 2)
}

export const CATEGORY_LABELS: Record<PeerCategory, string> = {
  reference: 'Reference management',
  ai: 'AI research tools',
  survey: 'Surveys',
  statistics: 'Statistics and analysis',
  meetings: 'Meetings and video',
  lms: 'Learning platforms',
  plagiarism: 'Plagiarism checking',
  exam: 'Exams',
  transcription: 'Transcription',
  storage: 'Storage and sharing',
  productivity: 'Productivity',
}

/** One-word labels for the type-of-tool chips. */
export const CATEGORY_SHORT: Record<PeerCategory, string> = {
  ai: 'AI tools',
  exam: 'Exams',
  lms: 'Learning',
  meetings: 'Meetings',
  plagiarism: 'Plagiarism',
  productivity: 'Productivity',
  reference: 'References',
  statistics: 'Statistics',
  storage: 'Storage',
  survey: 'Surveys',
  transcription: 'Transcription',
}

/** Chip order: AI tools first, then A to Z. */
export const CATEGORY_CHIP_ORDER: PeerCategory[] = [
  'ai',
  ...(Object.keys(CATEGORY_SHORT) as PeerCategory[]).filter((c) => c !== 'ai').sort((a, b) => CATEGORY_SHORT[a].localeCompare(CATEGORY_SHORT[b])),
]

const VALUE_LABELS: Record<string, string> = {
  'none-found': 'Not found',
  'not-applicable': 'Not applicable',
  'general-ai-chat': 'AI chat',
  'interview-transcription': 'Transcription',
  'paper-chat': 'Chat with papers',
  'summarize-papers': 'Paper summaries',
  'systematic-review': 'Systematic reviews',
  'citation-graph': 'Citation maps',
  'reference-management': 'Reference management',
  'citation-formatting': 'Citation formatting',
  'academic-writing': 'Academic writing',
  'qualitative-coding': 'Qualitative coding',
  'data-visualization': 'Data visualisation',
  'data-management-plan': 'Data management plans',
  'collaboration-docs': 'Shared documents',
  'video-meetings': 'Video meetings',
  'lecture-capture': 'Lecture capture',
  'plagiarism-check': 'Plagiarism check',
  'ai-detection': 'AI detection',
  'e-signature': 'E-signature',
  'coding-assistant': 'Coding assistant',
  'literature-search': 'Literature search',
  'optional-sync': 'Yes, sync optional',
  unknown: 'Not stated',
  'on-request': 'On request',
  'enterprise-only': 'Enterprise only',
  'self-serve': 'Self-serve',
  'opt-out': 'Opt-out',
  'opt-in': 'Opt-in',
  'de-identified': 'De-identified data',
  'not-needed': 'Not needed (EU)',
  'contact-only': 'Contact only',
  'page-only': 'Page update only',
  'trial-only': 'Trial only',
  'public-summary': 'Public summary',
  'bug-bounty': 'Bug bounty',
  'full-public': 'Full, public',
  'lite-public': 'Lite, public',
  'none-needed': 'Not needed',
  dpf: 'EU-US DPF',
  sccs: 'SCCs',
  bcrs: 'BCRs',
  'soc2-type2': 'SOC 2 Type II',
  'soc2-type1': 'SOC 2 Type I',
  iso27001: 'ISO 27001',
  iso27701: 'ISO 27701',
  iso27017: 'ISO 27017',
  iso27018: 'ISO 27018',
  iso42001: 'ISO 42001',
  'cyber-essentials': 'Cyber Essentials',
  'csa-star': 'CSA STAR',
  'bsi-c5': 'BSI C5',
  saml: 'SAML',
  oidc: 'OIDC',
  lti: 'LTI',
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'Google Cloud',
  'azure-openai': 'Azure OpenAI',
  openai: 'OpenAI',
  '2.2-aa': 'WCAG 2.2 AA',
  '2.1-aa': 'WCAG 2.1 AA',
  '2.0-aa': 'WCAG 2.0 AA',
  'none-claimed': 'None claimed',
  edugain: 'eduGAIN',
  swamid: 'SWAMID',
  incommon: 'InCommon',
  ukfed: 'UK Federation',
  aaf: 'AAF',
}

export function valueLabel(v: string): string {
  if (VALUE_LABELS[v]) return VALUE_LABELS[v]
  if (/^[A-Z]{2}$/.test(v) || /^\d{4}(-\d{2}){0,2}$/.test(v)) return v
  const s = v.replace(/-/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatFact(f: Fact | undefined): string {
  if (!f) return 'Not researched yet'
  if (typeof f.value === 'number') return String(f.value)
  return values(f)
    .flatMap((v) => (v === 'other' && f.others?.length ? f.others : [valueLabel(v)]))
    .join(', ')
}

/** Every recorded fact unread because the vendor's pages refused automated reading. */
export function isBlocked(t: DirectoryTool) {
  const facts = Object.values(t.record?.facts ?? {})
  return facts.length > 0 && facts.every((f) => answerState(f) === 'blocked')
}

const regionName = (c: string) => (c === 'EU' ? 'the EU' : c === 'US' ? 'the US' : c === 'UK' || c === 'GB' ? 'the UK' : /^[A-Z]{2}$/.test(c) ? countryName(c, 'en') : c)

const TRAINS_PHRASE: Record<string, string> = {
  no: "says it doesn't train AI on your content",
  'opt-in': 'trains AI on your content only if you opt in',
  'opt-out': 'trains AI on your content unless you opt out',
  yes: 'says it may train AI on your content',
  'de-identified': 'may train AI on de-identified content',
}

const DPA_PHRASE: Record<string, string> = {
  public: 'publishes a DPA',
  'self-serve': 'offers a DPA you can sign online',
  'on-request': 'offers a DPA on request',
  'enterprise-only': 'offers a DPA on enterprise plans',
  'none-found': 'has no DPA we could find',
}

/**
 * One plain sentence built only from recorded facts (no adjectives, no
 * verdict), for people skimming and for AI search to quote.
 */
export function summarySentence(t: DirectoryTool): string | null {
  if (!t.record || isBlocked(t)) return null
  const parts: string[] = []
  const hosting = fact(t, 'hosting_regions')
  if (answerState(hosting) === 'answered') {
    const r = values(hosting).map(regionName)
    parts.push(`stores data in ${r.length > 1 ? r.slice(0, -1).join(', ') + ' and ' + r[r.length - 1] : r[0]}`)
  }
  parts.push(TRAINS_PHRASE[values(fact(t, 'trains_on_content'))[0]] ?? "doesn't say whether it trains AI on your content")
  parts.push(DPA_PHRASE[values(fact(t, 'dpa'))[0]] ?? "doesn't say whether it offers a DPA")
  const last = parts.pop()
  const local = values(fact(t, 'local_first'))[0]
  const tail = local === 'yes' ? ' It works with your files kept on your device.' : local === 'optional-sync' ? ' It can be used locally, with cloud sync optional.' : ''
  return `${t.name} ${parts.join(', ')}, and ${last}.${tail}`
}

export interface UniversityEntry {
  name: string
  country: string
  /** Tools in the directory this university lists. */
  tools: number
}

/** Every university with a public listing, most tools first. */
export const UNIVERSITIES: UniversityEntry[] = (() => {
  const m = new Map<string, UniversityEntry>()
  for (const t of DIRECTORY)
    for (const l of t.listings) {
      const u = m.get(l.university) ?? { name: l.university, country: l.country, tools: 0 }
      u.tools++
      m.set(l.university, u)
    }
  return [...m.values()].sort((a, b) => b.tools - a.tools || a.name.localeCompare(b.name))
})()

/** Text a search matches: name, tagline, category and what the tool does. */
export function searchText(t: DirectoryTool): string {
  return [t.name, t.tagline ?? '', t.category ? CATEGORY_LABELS[t.category] : '', ...capabilities(t).map(valueLabel)].join(' ').toLowerCase()
}

/** The open dataset as one JSON file, for the "Open data" download. */
export function datasetJson(): string {
  return JSON.stringify(
    {
      name: 'Validemic open directory',
      licence: 'CC BY-SA 4.0',
      attribution: 'Validemic (Avidemic AB), https://validemic.com',
      generated: new Date().toISOString().slice(0, 10),
      tools: DIRECTORY.map((t) => ({ id: t.id, name: t.name, website: t.website, category: t.category, listedBy: t.listings, record: t.record ?? null })),
    },
    null,
    2,
  )
}
