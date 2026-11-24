import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, Bell, Check, ChevronDown, ChevronRight, Copy, ExternalLink, Info, Pencil, Search, X } from 'lucide-react'
import OpenLayout, { GITHUB_URL } from './OpenLayout'
import { ShareButton } from './OpenHome'
import { AiActVerdict, CountryFlags, EuMark, FactPill, VendorFlags, inEu } from './parts'
import { Flag } from '../../components/CountryBadge'
import { FACTOR_HELP, GROUP_HELP } from '../../data/openDirectory/help'
import { countryName } from '../../data/universities'
import NotFound from '../NotFound'
import { ArticleLink } from './OpenLaw'
import { aiActFor } from '../../data/openDirectory/aiAct'
import { useAuth } from '../../auth'
import { EuFlag, Tip } from '../../components/ui'
import {
  FACTORS,
  FACTOR_GROUPS,
  OPEN_GROUPS,
  answerState,
  factorById,
  softenedByLocal,
  toneOf,
  type Fact,
  type Factor,
  type FactorGroup,
  type Tone,
} from '../../data/openDirectory/factors'
import {
  ALT_PREFERENCES,
  CATEGORY_LABELS,
  DEFAULT_PREFERENCE,
  parsePreference,
  type AltPreference,
  alternativesFor,
  capabilities,
  fact,
  familyOf,
  formatFact,
  isBlocked,
  isOwned,
  outboundUrl,
  summarySentence,
  toolById,
  universityCount,
  valueLabel,
  values,
  type Alternative,
  type DirectoryTool,
  type Family,
} from '../../data/openDirectory'

const SUMMARY = ['hosting_regions', 'trains_on_content', 'dpa', 'subprocessors_public', 'sso', 'vpat'] as const
/** Shorter labels for the key-facts strip. */
const SHORT: Record<string, string> = { hosting_regions: 'Data stored', trains_on_content: 'Trains on content', subprocessors_public: 'Sub-processors' }
/** Rows of the side-by-side table in the closest-match card. */
const COMPARE = [
  ['eu_residency', 'EU data'],
  ['trains_on_content', 'Trains on content'],
  ['dpa', 'DPA'],
  ['sso', 'SSO'],
  ['vpat', 'VPAT'],
] as const
const LOCAL_TIP = 'Shown amber instead of red: the vendor says the tool works with your files kept on your device, and cloud sync is optional.'
const OWNER_LINE = 'From Avidemic, the team behind this directory.'
const UNI_PREVIEW = 12
const ALL = 'ALL'
const EU = 'EU'
const CARDS_PREVIEW = 4

const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return u
  }
}
const shortUrl = (u: string) => {
  try {
    const x = new URL(u)
    return x.hostname.replace(/^www\./, '') + x.pathname.replace(/\/$/, '')
  } catch {
    return u
  }
}

function jump(e: { preventDefault: () => void }, id: string) {
  e.preventDefault()
  const el = document.getElementById(id)
  if (!el) return
  const details = el instanceof HTMLDetailsElement ? el : el.closest('details')
  if (details && !details.open) details.open = true
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** A row stays expanded when it says something: an answer, or an amber/red gap. */
function isFolded(f: Factor, v: Fact | undefined, facts?: Record<string, Fact>) {
  const state = answerState(v)
  if (state === 'answered' || state === 'not-applicable') return false
  return toneOf(f, v, facts) === 'neutral' || state === 'not-checked'
}

export default function OpenTool() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const tool = toolById(id)
  useEffect(() => {
    if (tool) document.title = `${tool.name}: data location, AI training, DPA | Validemic`
  }, [tool])
  if (!tool) return <NotFound />
  const watchTo = user ? `/app/monitoring?watch=${encodeURIComponent(tool.id)}` : `/register?watch=${encodeURIComponent(tool.id)}`
  const facts = tool.record?.facts
  const blocked = isBlocked(tool)
  const readable = Boolean(tool.record) && !blocked
  const prefer = parsePreference(params.get('prefer'))
  const setPrefer = (p: AltPreference) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (p === DEFAULT_PREFERENCE) next.delete('prefer')
        else next.set('prefer', p)
        return next
      },
      { replace: true },
    )
  const { assessed, unassessed } = alternativesFor(tool, prefer)
  const summary = summarySentence(tool)
  const caps = capabilities(tool)
  const family = familyOf(tool)
  const groups = (Object.keys(FACTOR_GROUPS) as FactorGroup[]).map((g) => {
    const list = FACTORS.filter((f) => f.group === g)
    const answered = list.filter((f) => ['answered', 'not-applicable'].includes(answerState(facts?.[f.id]))).length
    const tones = list.map((f) => toneOf(f, facts?.[f.id], facts))
    const worst: Tone | undefined = tones.includes('bad') ? 'bad' : tones.includes('warn') ? 'warn' : undefined
    return { g, list, answered, worst }
  })
  const contents: ContentsSection[] = [
    {
      title: 'Overview',
      items: [
        ...(readable ? [{ id: 'summary', label: 'Key facts' }] : []),
        ...(family ? [{ id: 'family', label: family.label }] : []),
        ...(readable && aiActFor(tool.record?.id ?? tool.id) ? [{ id: 'law', label: 'EU AI Act and GDPR' }] : []),
        ...(universityCount(tool) ? [{ id: 'universities', label: 'Universities', meta: String(universityCount(tool)) }] : []),
      ],
    },
    {
      title: 'The checks',
      items: readable ? groups.map(({ g, list, answered, worst }) => ({ id: `group-${g}`, label: FACTOR_GROUPS[g], meta: `${answered}/${list.length}`, tone: worst, help: GROUP_HELP[g] })) : [],
    },
  ].filter((sec) => sec.items.length > 0)

  return (
    <OpenLayout>
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
        <nav className="flex items-center gap-1 text-xs text-ink-500">
          <Link to="/" className="hover:text-ink-800">
            Tools
          </Link>
          {tool.category && (
            <>
              <ChevronRight className="h-3 w-3 text-ink-400" />
              <Link to={`/?category=${tool.category}`} className="hover:text-ink-800">
                {CATEGORY_LABELS[tool.category]}
              </Link>
            </>
          )}
        </nav>

        {/* Header */}
        <header className="mt-2 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink-900">
              {tool.name} <EuMark t={tool} />
            </h1>
            <p className="mt-0.5 text-sm text-ink-600">{tool.tagline ?? (tool.category ? CATEGORY_LABELS[tool.category] : '')}</p>
            {caps.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1">
                {caps.slice(0, 6).map((c) => (
                  <li key={c} className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[11px] text-ink-600">
                    {valueLabel(c)}
                  </li>
                ))}
                {caps.length > 6 && <li className="px-1 py-0.5 text-[11px] text-ink-400">+{caps.length - 6}</li>}
              </ul>
            )}
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
              <a href={outboundUrl(tool, undefined, 'header')} target="_blank" rel="noopener" className="inline-flex items-center gap-0.5 underline-offset-2 hover:underline">
                {host(tool.website)} <ExternalLink className="h-3 w-3" />
              </a>
              {tool.record && <span>· Checked {tool.record.checkedAt}</span>}
              {universityCount(tool) > 0 && <span>· Listed by {universityCount(tool)} universities</span>}
              <span>·</span>
              <CiteButton tool={tool} />
              <span>·</span>
              <ShareButton />
            </p>
            {isOwned(tool) && <p className="mt-1 text-[11px] text-ink-400">{OWNER_LINE}</p>}
          </div>
          <Link
            to={watchTo}
            title="Free Validemic account"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-ink-400"
          >
            <Bell className="h-4 w-4" /> <span className="hidden sm:inline">Watch for changes</span>
          </Link>
        </header>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[220px_minmax(0,1fr)_300px]">
          {contents.length > 0 && (
            <aside className="hidden xl:block">
              <Contents sections={contents} />
            </aside>
          )}
          <div className="min-w-0">
            {!tool.record ? (
              <Notice tone="plain">
                Not checked yet. So far we only list which universities name {tool.name} on their public pages.{' '}
                <a
                  href={`${GITHUB_URL}/issues/new?labels=check-request&title=${encodeURIComponent(`Check request: ${tool.name}`)}&body=${encodeURIComponent(`Please check ${tool.name} (${tool.website}).`)}`}
                  target="_blank"
                  rel="noopener"
                  className="font-medium text-brand-700 hover:underline"
                >
                  Request this check
                </a>
                . Requests decide what we check next.
              </Notice>
            ) : blocked ? (
              <Notice tone="warn">{tool.name}'s site refuses automated reading, so none of its pages could be read yet. A person will check them in a normal browser. "Could not read" says nothing about the tool itself.</Notice>
            ) : (
              <>
                <div id="summary" className="scroll-mt-20">
                  {summary && <p className="mb-3 text-[15px] leading-relaxed text-ink-700">{summary}</p>}
                  <KeyFacts tool={tool} />
                  {SUMMARY.some((fid) => softenedByLocal(factorById(fid)!, fact(tool, fid), facts)) && (
                    <p className="mt-1.5 text-[11px] text-ink-500">
                      <Tip text={LOCAL_TIP} underline>
                        Amber, not red: works locally, sync optional
                      </Tip>
                    </p>
                  )}
                </div>
              </>
            )}

            {family && <FamilyPanel family={family} current={tool} />}

            {readable && <LawPanel tool={tool} />}

            {/* Phones: the closest match right under the key facts. */}
            {assessed[0] && (
              <div className="mt-5 lg:hidden">
                <AltCard a={assessed[0]} target={tool} top />
                {assessed.length > 1 && (
                  <button onClick={(e) => jump(e, 'alternatives')} className="mt-2 block w-full text-center text-xs text-ink-500 underline">
                    See all {assessed.length} alternatives
                  </button>
                )}
              </div>
            )}

            {readable && (
              <>
                <GroupBar groups={groups} hasAlternatives={assessed.length > 0} />
                <div className="mt-4 space-y-3">
                  {groups.map(({ g, list, answered }) => (
                    <FactGroup key={g} g={g} list={list} answered={answered} facts={facts!} />
                  ))}
                </div>
              </>
            )}

            {/* Institutions */}
            <p className="mt-8 rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-600">
              Assessing {tool.name} for your university?{' '}
              <Link to={`/institutions?tool=${encodeURIComponent(tool.id)}`} className="font-medium text-brand-700 hover:underline">
                Validemic for institutions <ArrowRight className="inline h-3 w-3" />
              </Link>{' '}
              <span className="text-ink-500">
                or{' '}
                <Link to={watchTo} className="underline hover:text-ink-800">
                  get an email when its terms change
                </Link>
                .
              </span>
            </p>

            <ListedBy tool={tool} />

            {/* Phones: the full alternatives list after the facts. */}
            {(assessed.length > 0 || unassessed.length > 0) && (
              <section id="alternatives" className="mt-8 scroll-mt-20 lg:hidden">
                <Alternatives tool={tool} assessed={assessed} unassessed={unassessed} prefer={prefer} onPrefer={setPrefer} skipFirst />
              </section>
            )}

            <div className="mt-8 flex flex-wrap gap-4 text-xs text-ink-500">
              <a href={`${GITHUB_URL}/issues/new?labels=correction&title=${encodeURIComponent(`Correction: ${tool.name}`)}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-ink-800">
                <Pencil className="h-3.5 w-3.5" /> Suggest a correction
              </a>
              {tool.record && (
                <a href={`${GITHUB_URL}/blob/main/research/tools/${tool.record.id}.json`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-ink-800">
                  <ExternalLink className="h-3.5 w-3.5" /> View the raw record
                </a>
              )}
            </div>
          </div>

          {/* Desktop sidebar: short enough to stay in view, no inner scroll. */}
          <aside className="hidden min-w-0 lg:block">
            <div className="lg:top-20 lg:[@media(min-height:760px)]:sticky">
              <Alternatives tool={tool} assessed={assessed} unassessed={unassessed} prefer={prefer} onPrefer={setPrefer} />
            </div>
          </aside>
        </div>
      </div>
    </OpenLayout>
  )
}

function Notice({ tone, children }: { tone: 'plain' | 'warn'; children: ReactNode }) {
  return <p className={`rounded-xl border px-4 py-3 text-sm ${tone === 'warn' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-ink-200 bg-ink-50 text-ink-600'}`}>{children}</p>
}

function KeyFacts({ tool }: { tool: DirectoryTool }) {
  const facts = tool.record?.facts
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-ink-200 sm:grid-cols-6 sm:divide-x sm:divide-ink-100">
      {SUMMARY.map((fid) => {
        const f = factorById(fid)!
        const v = fact(tool, fid)
        return (
          <div key={fid} onClick={(e) => jump(e, fid)} className="min-w-0 cursor-pointer px-2.5 py-1.5 transition hover:bg-ink-50 max-sm:border-b max-sm:border-r max-sm:border-ink-100">
            <div className="truncate text-[11px] text-ink-500">
              <Tip text={FACTOR_HELP[fid]} underline>
                <button type="button" onClick={(e) => e.stopPropagation()} className="cursor-help">
                  {SHORT[fid] ?? f.label}
                </button>
              </Tip>
            </div>
            <div className="mt-0.5 truncate">{fid === 'hosting_regions' && answerState(v) === 'answered' ? <CountryFlags codes={values(v)} /> : <FactPill fact={v} tone={toneOf(f, v, facts)} />}</div>
          </div>
        )
      })}
    </div>
  )
}

function GroupBar({ groups, hasAlternatives }: { groups: { g: FactorGroup; list: readonly Factor[]; answered: number }[]; hasAlternatives: boolean }) {
  return (
    <div className="sticky top-14 z-10 -mx-4 mt-6 border-b border-ink-100 bg-surface px-4 sm:mx-0 sm:px-0 xl:hidden">
      <div className="relative">
        <div className="flex gap-1 overflow-x-auto py-2 pr-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {groups.map(({ g, list, answered }) => (
            <button key={g} onClick={(e) => jump(e, `group-${g}`)} className="shrink-0 rounded-full px-2.5 py-1 text-xs text-ink-700 hover:bg-ink-100">
              {FACTOR_GROUPS[g]} <span className="text-ink-400">{answered}/{list.length}</span>
            </button>
          ))}
          {hasAlternatives && (
            <button onClick={(e) => jump(e, 'alternatives')} className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 lg:hidden">
              Alternatives
            </button>
          )}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-surface to-transparent" />
      </div>
    </div>
  )
}

function FactGroup({ g, list, answered, facts }: { g: FactorGroup; list: readonly Factor[]; answered: number; facts: Record<string, Fact> }) {
  const [showFolded, setShowFolded] = useState(false)
  const shown = list.filter((f) => !isFolded(f, facts[f.id], facts))
  const folded = list.filter((f) => isFolded(f, facts[f.id], facts))
  return (
    <details id={`group-${g}`} open={OPEN_GROUPS.includes(g)} className="group scroll-mt-28 rounded-xl border border-ink-200 xl:scroll-mt-20">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5">
        <span className="text-sm font-semibold text-ink-900">{FACTOR_GROUPS[g]}</span>
        <span className="flex items-center gap-2 text-xs text-ink-500">
          {answered} of {list.length} answered
          <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
        </span>
      </summary>
      <div className="divide-y divide-ink-100 border-t border-ink-100">
        {(showFolded ? list : shown).map((f) => (
          <FactRow key={f.id} f={f} v={facts[f.id]} facts={facts} />
        ))}
        {folded.length > 0 && (
          <button onClick={() => setShowFolded((s) => !s)} className="block w-full px-4 py-2 text-left text-xs text-ink-500 hover:bg-ink-50">
            {showFolded ? (
              'Hide unanswered'
            ) : (
              <>
                <span className="font-medium text-ink-600">No answer ({folded.length}):</span> {folded.map((f) => f.label).join(', ')} · <span className="text-brand-700">Show</span>
              </>
            )}
          </button>
        )}
      </div>
    </details>
  )
}

/** Label, answer, then the vendor's words with source and date, then our note. */
function FactRow({ f, v, facts }: { f: Factor; v?: Fact; facts: Record<string, Fact> }) {
  const state = answerState(v)
  return (
    <div id={f.id} className="grid scroll-mt-28 gap-1.5 px-4 py-2.5 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
      <div className="flex items-start gap-1 text-sm text-ink-700">
        <span>
          {f.label}
          {f.markets && <span className="ml-1 text-[10px] text-ink-400">{f.markets.join(' · ')}</span>}
        </span>
        <InfoTip text={FACTOR_HELP[f.id]} />
      </div>
      <div className="min-w-0 text-sm">
        <FactPill fact={v} tone={toneOf(f, v, facts)} label={formatFact(v) + (v?.footnote ? ' *' : '')} />
        {v?.footnote && (
          <p className="mt-1.5 text-[13px] leading-snug text-ink-700">
            <span className="font-semibold text-ink-900">* </span>
            {v.footnote}
          </p>
        )}
        {softenedByLocal(f, v, facts) && (
          <span className="ml-2 text-[11px] text-ink-500">
            <Tip text={LOCAL_TIP} underline>
              Works locally, sync optional
            </Tip>
          </span>
        )}
        {v?.evidence?.map((ev) => (
          <div key={`${ev.url}-${ev.quote}`} className="mt-2">
            {ev.quote && <blockquote className="border-l-2 border-ink-300 pl-3 text-[13px] leading-snug text-ink-700">“{ev.quote}”</blockquote>}
            <p className="mt-1 break-all pl-3 text-xs text-ink-500">
              <a href={ev.url} target="_blank" rel="noopener" className="underline decoration-ink-300 underline-offset-2 hover:text-brand-700">
                {shortUrl(ev.url)}
              </a>{' '}
              · retrieved {ev.retrievedAt}
            </p>
          </div>
        ))}
        {v?.note && (
          <p className="mt-1.5 text-xs text-ink-500">
            <span className="font-medium text-ink-600">{state === 'blocked' ? 'Why: ' : 'Our note: '}</span>
            {v.note}
          </p>
        )}
      </div>
    </div>
  )
}

function Alternatives({
  tool,
  assessed,
  unassessed,
  prefer,
  onPrefer,
  skipFirst = false,
}: {
  tool: DirectoryTool
  assessed: Alternative[]
  unassessed: DirectoryTool[]
  prefer: AltPreference
  onPrefer: (p: AltPreference) => void
  skipFirst?: boolean
}) {
  const [all, setAll] = useState(false)
  const pref = ALT_PREFERENCES.find((p) => p.id === prefer)!
  const noneMatch = prefer !== 'none' && assessed.length > 0 && !assessed.some((a) => a.preferred && a.sameMain)
  const rest = assessed.slice(1)
  const rows = all ? rest : rest.slice(0, CARDS_PREVIEW - 1)
  return (
    <div>
      <h2 className="text-sm font-semibold text-ink-900">Alternatives to {tool.name}</h2>
      <p className="mt-0.5 text-xs text-ink-500">
        {prefer === 'none' ? 'Same main use first' : `${pref.label} first`}, then the uses they cover, then the facts.{' '}
        <Link to="/open/methodology#alternatives" className="underline hover:text-ink-800">
          How we rank
        </Link>
      </p>
      <div role="radiogroup" aria-label="Prefer" className="mt-2 flex flex-wrap items-center gap-1">
        <span className="mr-0.5 text-[11px] text-ink-500">Prefer</span>
        {ALT_PREFERENCES.map((p) => (
          <button
            key={p.id}
            role="radio"
            aria-checked={p.id === prefer}
            onClick={() => onPrefer(p.id)}
            className={`rounded-full border px-2 py-0.5 text-[11px] transition ${p.id === prefer ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 text-ink-600 hover:border-ink-400'}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {noneMatch && <p className="mt-2 text-xs text-ink-500">No checked tool built for the same main job matches “{pref.label}” yet. Showing the closest ones.</p>}
      <div className="mt-3 space-y-2">
        {!skipFirst && assessed[0] && <AltCard a={assessed[0]} target={tool} top />}
        {rows.map((a) => (
          <AltCard key={a.tool.id} a={a} target={tool} />
        ))}
        {rest.length > CARDS_PREVIEW - 1 && (
          <button onClick={() => setAll((v) => !v)} className="text-xs font-medium text-brand-700 hover:underline">
            {all ? 'Show fewer' : `Show all ${assessed.length}`}
          </button>
        )}
        {assessed.length === 0 && unassessed.length === 0 && <p className="text-sm text-ink-500">No comparable tools checked yet.</p>}
        {unassessed.length > 0 && (
          <div className="pt-1">
            <p className="text-xs text-ink-500">Same category, not checked yet</p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {unassessed.map((t) => (
                <li key={t.id}>
                  <Link to={`/open/tools/${t.id}`} className="rounded-full border border-ink-200 px-2.5 py-0.5 text-xs text-ink-600 hover:border-ink-400">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * One alternative as a compact card: name, uses covered, two key facts. The top
 * result of the ranking rule (whoever it is) is marked "Closest match" and gets
 * the filled button. "Compare" opens the side-by-side facts in place.
 */
function AltCard({ a, target, top = false }: { a: Alternative; target: DirectoryTool; top?: boolean }) {
  const [open, setOpen] = useState(false)
  const t = a.tool
  const free = values(fact(t, 'free_plan')).includes('yes')
  return (
    <div className={`rounded-xl border bg-surface p-3 ${top ? 'border-brand-400 ring-1 ring-brand-400' : 'border-ink-200'}`}>
      {top && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700">Closest match</p>}
      <div className="flex items-start justify-between gap-2">
        <Link to={`/open/tools/${t.id}`} className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-ink-900 hover:text-brand-700">
          <span className="truncate">{t.name}</span> <EuMark t={t} small />
        </Link>
        <span className="shrink-0 text-xs text-ink-500">{a.of > 0 ? `${a.covered}/${a.of} uses` : ''}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {(['trains_on_content', 'dpa'] as const).map((fid) => {
          const f = factorById(fid)!
          const v = fact(t, fid)
          return <FactPill key={fid} fact={v} tone={toneOf(f, v, t.record?.facts)} label={`${fid === 'dpa' ? 'DPA' : 'Trains'}: ${formatFact(v)}`} />
        })}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="inline-flex items-center gap-0.5 text-xs font-medium text-ink-600 hover:text-ink-900">
          Compare <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
        </button>
        {top ? (
          <a
            href={outboundUrl(t, target, 'closest-match')}
            target="_blank"
            rel="noopener"
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-700"
          >
            {free ? 'Try free' : 'Visit site'} <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <a href={outboundUrl(t, target, 'alternative-row')} target="_blank" rel="noopener" className="text-xs text-ink-500 hover:text-ink-800">
            {host(t.website)} ↗
          </a>
        )}
      </div>
      {isOwned(t) && <p className="mt-1.5 text-[11px] text-ink-400">{OWNER_LINE}</p>}
      {open && <AltCompare a={a} target={target} />}
    </div>
  )
}

/** The expanded part of an alternative card: which uses it covers, and the key facts side by side. */
function AltCompare({ a, target }: { a: Alternative; target: DirectoryTool }) {
  const t = a.tool
  return (
    <div className="mt-2 border-t border-ink-100 pt-2">
      {a.uses.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-2.5 gap-y-0.5 text-xs" aria-label={`Which of ${target.name}'s uses ${t.name} covers`}>
          {a.uses.map((u) => (
            <li key={u.id} className={`inline-flex items-center gap-0.5 ${u.has ? 'text-ink-700' : 'text-ink-400'}`}>
              {u.has ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-ink-400" />}
              {valueLabel(u.id)}
            </li>
          ))}
        </ul>
      )}
      <table className="mt-2 w-full table-fixed text-xs">
        <thead>
          <tr className="text-left text-ink-500">
            <th className="w-[34%] pb-1 font-normal"></th>
            <th className="truncate pb-1 font-normal">{target.name}</th>
            <th className="truncate pb-1 font-medium text-ink-700">{t.name}</th>
          </tr>
        </thead>
        <tbody>
          {COMPARE.map(([fid, label]) => {
            const f = factorById(fid)!
            return (
              <tr key={fid} className="border-t border-ink-100">
                <td className="py-1.5 pr-1 text-ink-600">{label}</td>
                <td className="py-1.5 pr-1">
                  <CompareCell f={f} tool={target} />
                </td>
                <td className="py-1.5">
                  <CompareCell f={f} tool={t} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CompareCell({ f, tool }: { f: Factor; tool: DirectoryTool }) {
  const v = fact(tool, f.id)
  if (!tool.record || isBlocked(tool)) return <span className="text-ink-400">–</span>
  return <FactPill fact={v} tone={toneOf(f, v, tool.record.facts)} />
}

function CiteButton({ tool }: { tool: DirectoryTool }) {
  const [done, setDone] = useState(false)
  const date = tool.record?.checkedAt ?? new Date().toISOString().slice(0, 10)
  const text = `Validemic (${date.slice(0, 4)}). ${tool.name}: data location, AI training, DPA and sign-in, checked ${date}. Avidemic AB. ${window.location.origin}/#/open/tools/${tool.id}`
  return (
    <button
      onClick={() => {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            setDone(true)
            setTimeout(() => setDone(false), 1800)
          })
          .catch(() => window.prompt('Copy this citation', text))
      }}
      className="inline-flex items-center gap-1 hover:text-ink-800"
    >
      <Copy className="h-3 w-3" /> {done ? 'Copied' : 'Cite'}
    </button>
  )
}

/** An (i) that shows the explanation at once on hover, and on tap (focus) on phones. */
function InfoTip({ text }: { text?: string }) {
  if (!text) return null
  return (
    <Tip text={text}>
      <button type="button" aria-label={text} className="mt-0.5 rounded-full text-ink-300 transition hover:text-ink-600 focus:text-ink-600">
        <Info className="h-3.5 w-3.5" />
      </button>
    </Tip>
  )
}

const TONE_DOT: Partial<Record<Tone, string>> = { bad: 'bg-rose-500', warn: 'bg-amber-400' }
const TONE_TIP: Partial<Record<Tone, string>> = { bad: 'Has at least one red item', warn: 'Has at least one amber item' }

type ContentsItem = { id: string; label: string; meta?: string; tone?: Tone; help?: string }
type ContentsSection = { title: string; items: ContentsItem[] }

/** Contents list on wide screens: sticks while you scroll, marks where you are, two labelled sections. */
function Contents({ sections }: { sections: ContentsSection[] }) {
  const items = sections.flatMap((sec) => sec.items)
  const [active, setActive] = useState(items[0]?.id)
  const ids = items.map((i) => i.id).join(',')
  useEffect(() => {
    const els = ids.split(',').map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el))
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-72px 0px -65% 0px' },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [ids])
  return (
    <nav aria-label="On this page" className="[@media(min-height:720px)]:sticky [@media(min-height:720px)]:top-20">
      {sections.map((sec, i) => (
        <div key={sec.title} className={i ? 'mt-6' : ''}>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">{sec.title}</p>
          <ul className="space-y-px border-l border-ink-200">
            {sec.items.map((it) => (
              <li key={it.id}>
                <button
                  onClick={(e) => {
                    setActive(it.id)
                    jump(e, it.id)
                  }}
                  aria-current={active === it.id ? 'location' : undefined}
                  className={`-ml-px flex w-full items-center gap-2 border-l-2 py-1.5 pl-3.5 pr-1 text-left text-[13px] leading-5 transition ${
                    active === it.id ? 'border-brand-600 font-medium text-ink-900' : 'border-transparent text-ink-600 hover:border-ink-300 hover:text-ink-900'
                  }`}
                >
                  <Tip text={it.help} className="min-w-0 flex-1">
                    {it.label}
                  </Tip>
                  {it.tone && TONE_DOT[it.tone] && (
                    <Tip text={TONE_TIP[it.tone]}>
                      <span className={`block h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[it.tone]}`} />
                    </Tip>
                  )}
                  {it.meta && <span className="w-7 shrink-0 text-right text-[11px] tabular-nums text-ink-400">{it.meta}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/**
 * Which universities list the tool: country tabs (EU/EEA as one), a search
 * when the list is long, and a compact grid. Each name links to the page it
 * was seen on.
 */
function ListedBy({ tool }: { tool: DirectoryTool }) {
  const [tab, setTab] = useState(ALL)
  const [q, setQ] = useState('')
  const [all, setAll] = useState(false)
  const listings = useMemo(() => [...new Map(tool.listings.map((l) => [l.university, l])).values()], [tool])
  const tabs = useMemo(() => {
    const counts = new Map<string, number>()
    for (const l of listings) counts.set(l.country, (counts.get(l.country) ?? 0) + 1)
    const eu = listings.filter((l) => inEu(l.country)).length
    return [{ code: ALL, n: listings.length }, ...(eu && eu < listings.length ? [{ code: EU, n: eu }] : []), ...[...counts].sort((a, b) => b[1] - a[1]).map(([code, n]) => ({ code, n }))]
  }, [listings])
  const needle = q.trim().toLowerCase()
  const filtered = listings.filter((l) => (tab === ALL || (tab === EU ? inEu(l.country) : l.country === tab)) && (!needle || l.university.toLowerCase().includes(needle)))
  const shown = all ? filtered : filtered.slice(0, UNI_PREVIEW)
  const n = listings.length
  if (n === 0) return null

  return (
    <section id="universities" className="mt-8 scroll-mt-20">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 className="text-sm font-semibold text-ink-900">
          Listed by {n || 'no'} {n === 1 ? 'university' : 'universities'}
        </h2>
        {tab !== ALL && (
          <Link to={`/?in=${tab}`} className="inline-flex items-center gap-0.5 text-xs font-medium text-brand-700 hover:underline">
            Other tools {tab === EU ? 'EU / EEA' : countryName(tab, 'en')} universities list <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <p className="mt-0.5 text-xs text-ink-500">Named on the university's own public page. Listed means only that. Click a name to open that page.</p>
      {n > 0 && (
        <>
          {n > 8 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1">
              {tabs.map((t) => (
                <button
                  key={t.code}
                  onClick={() => {
                    setTab(t.code)
                    setAll(false)
                  }}
                  aria-pressed={tab === t.code}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition ${
                    tab === t.code ? 'bg-ink-900 text-ink-50' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                  }`}
                >
                  {t.code === EU ? <EuFlag className="h-2.5 w-3.5" /> : t.code !== ALL && <Flag code={t.code.toLowerCase()} className="h-2.5 w-3.5" />}
                  {t.code === ALL ? 'All' : t.code === EU ? 'EU / EEA' : t.code}
                  <span className={tab === t.code ? 'text-ink-300' : 'text-ink-400'}>{t.n}</span>
                </button>
              ))}
              <div className="relative ml-auto w-full sm:w-48">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Find a university"
                  aria-label="Find a university"
                  className="h-7 w-full rounded-lg border border-ink-200 bg-surface pl-7 pr-2 text-xs outline-none placeholder:text-ink-400 focus:border-brand-400"
                />
              </div>
            </div>
          )}
          <ul className="mt-2 grid gap-x-4 border-t border-ink-100 pt-1 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((l) => (
              <li key={l.university} className="min-w-0">
                <Tip text={`Seen on ${host(l.sourceUrl ?? '')}, ${l.retrievedAt}`} className="block">
                  <a href={l.sourceUrl} target="_blank" rel="noopener" className="group flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-ink-700 hover:bg-ink-50 hover:text-brand-700">
                    <span className="w-5 shrink-0 text-[10px] text-ink-400">{l.country}</span>
                    <span className="truncate">{l.university}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 text-ink-300 opacity-0 group-hover:opacity-100" />
                  </a>
                </Tip>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && <p className="py-3 text-xs text-ink-500">No university matches.</p>}
          {filtered.length > UNI_PREVIEW && (
            <button onClick={() => setAll((v) => !v)} className="mt-1 px-1.5 text-xs font-medium text-brand-700 hover:underline">
              {all ? 'Show fewer' : `Show all ${filtered.length}`}
            </button>
          )}
        </>
      )}
    </section>
  )
}

const ROLE_LINE: Record<string, string> = {
  processor: 'as processor: handles your data on your instructions',
  controller: 'as controller: decides itself how your data is used',
  mixed: 'partly controller, partly processor',
}
const EU_OPTION: Record<string, string> = { default: 'EU by default', option: 'EU storage available', 'enterprise-only': 'EU storage on enterprise plans', no: 'No EU storage option' }

/**
 * Ways into the same models, side by side. Rows are routes ("personal account",
 * "through your university"), not brands, so a reader sees at once that it is one
 * model under different contracts.
 */
function FamilyPanel({ family, current }: { family: Family; current: DirectoryTool }) {
  const members = family.members.map((m) => ({ ...m, tool: toolById(m.id) })).filter((m): m is typeof m & { tool: DirectoryTool } => Boolean(m.tool))
  if (members.length < 2) return null
  const head = (id: string, label: string) => (
    <th className="px-3 py-2 align-bottom font-medium leading-tight">
      <Tip text={FACTOR_HELP[id]} underline>
        {label}
      </Tip>
    </th>
  )
  return (
    <section id="family" className="mt-6 scroll-mt-20">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 className="text-base font-semibold text-ink-900">{family.label}</h2>
        <Link to={`/open/compare?t=${members.map((m) => m.tool.id).join(',')}`} className="text-xs font-medium text-brand-700 hover:underline">
          Compare all facts
        </Link>
      </div>
      <p className="mt-0.5 max-w-3xl text-sm leading-relaxed text-ink-600">{family.intro}</p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-ink-200">
        <table className="w-full min-w-[640px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[25%]" />
            <col className="w-[27%]" />
            <col className="w-[15%]" />
            <col className="w-[18%]" />
            <col className="w-[15%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 text-[11px] uppercase tracking-wide text-ink-500">
              <th className="px-3 py-2 align-bottom font-medium">Way in</th>
              {head('vendor_entity', 'Your contract is with')}
              {head('trains_on_content', 'Trains on content')}
              {head('hosting_regions', 'Data stored')}
              {head('dpa', 'DPA')}
            </tr>
          </thead>
          <tbody>
            {members.map(({ tool: t, route, how }) => {
              const here = t.id === current.id
              const entity = fact(t, 'vendor_entity')
              const role = values(fact(t, 'role'))[0]
              const host = fact(t, 'hosting_regions')
              const eu = values(fact(t, 'eu_residency'))[0]
              const pill = (id: string) => {
                const f = factorById(id)!
                const v = fact(t, id)
                return <FactPill fact={v} tone={toneOf(f, v, t.record?.facts)} />
              }
              return (
                <tr key={t.id} className={`border-b border-ink-100 align-top last:border-0 ${here ? 'bg-brand-50/50' : ''}`}>
                  <td className="px-3 py-3">
                    <div className="font-semibold leading-snug text-ink-900">{route}</div>
                    <div className="mt-0.5 text-xs leading-snug text-ink-500">{how}</div>
                    <div className="mt-1 text-xs">
                      {here ? (
                        <span className="font-medium text-ink-700">{t.name} · this page</span>
                      ) : (
                        <Link to={`/open/tools/${t.id}`} className="font-medium text-brand-700 hover:underline">
                          {t.name}
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-[13px] leading-snug text-ink-800">{answerState(entity) === 'answered' ? formatFact(entity) : <span className="text-ink-400">Not stated</span>}</div>
                    <div className="mt-1">
                      <VendorFlags t={t} />
                    </div>
                    {role && ROLE_LINE[role] && <div className="mt-1 text-xs leading-snug text-ink-500">{ROLE_LINE[role]}</div>}
                  </td>
                  <td className="px-3 py-3">{pill('trains_on_content')}</td>
                  <td className="px-3 py-3">
                    {answerState(host) === 'answered' ? <CountryFlags codes={values(host)} /> : pill('hosting_regions')}
                    {eu && EU_OPTION[eu] && <div className="mt-1 text-xs leading-snug text-ink-500">{EU_OPTION[eu]}</div>}
                  </td>
                  <td className="px-3 py-3">{pill('dpa')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const GDPR_ROLE: Record<string, string> = {
  processor: 'Acts as a processor for your content. Your university is the controller and needs a data processing agreement with it.',
  controller: 'Says it is a controller for your content. The university cannot instruct it as it would a processor, and users have their own contract with the vendor.',
  mixed: 'A processor for some data and a controller for other data, for example analytics or model training.',
  unknown: 'Does not say whether it acts as a processor or a controller for your content.',
}

const GDPR_PREFIX = { role: 'Role', dpa: 'DPA', transfer_mechanism: 'Transfers' } as const

/**
 * The tool against the two laws, in two one-line rows: the AI Act class and
 * the GDPR basics. Reasons, quotes and article links fold out on demand.
 */
function LawPanel({ tool }: { tool: DirectoryTool }) {
  const a = aiActFor(tool.record?.id ?? tool.id)
  const facts = tool.record?.facts
  if (!a || !facts) return null
  const role = values(fact(tool, 'role'))[0]
  return (
    <section id="law" className="mt-5 scroll-mt-20 divide-y divide-ink-100 rounded-lg border border-ink-200 text-sm">
      <LawRow
        label="EU AI Act"
        summary={<AiActVerdict a={a} />}
      >
        <p>{a.why}</p>
        {a.gpaiProvider && <p className="text-ink-500">{a.gpaiProvider} is also a provider of general-purpose AI models, with its own duties under Chapter V.</p>}
        {a.vendor ? (
          <p className="text-ink-600">
            <span className="font-medium text-ink-800">The company says:</span> {a.vendor.says}{' '}
            <span className="italic text-ink-500">“{a.vendor.quote}”</span>{' '}
            <a href={a.vendor.url} target="_blank" rel="noopener" className="text-ink-500 underline hover:text-ink-800">
              {host(a.vendor.url)}
            </a>
          </p>
        ) : (
          <p className="text-ink-500">{tool.name} does not state an AI Act classification on the pages we read.</p>
        )}
        <LawLinks>
          {a.refs.map((r) => (
            <ArticleLink key={r} law="ai-act" refId={r} />
          ))}
          <Link to="/open/law/ai-act" className="text-ink-600 hover:text-ink-900 hover:underline">
            How we classify →
          </Link>
        </LawLinks>
      </LawRow>
      <LawRow
        label="GDPR"
        summary={(['role', 'dpa', 'transfer_mechanism'] as const).map((fid) => {
          const f = factorById(fid)!
          return (
            <span key={fid} className="inline-flex max-w-[14rem]">
              <FactPill fact={fact(tool, fid)} tone={toneOf(f, fact(tool, fid), facts)} label={`${GDPR_PREFIX[fid]}: ${formatFact(fact(tool, fid))}`} />
            </span>
          )
        })}
      >
        <p>{GDPR_ROLE[role ?? 'unknown'] ?? GDPR_ROLE.unknown}</p>
        <LawLinks>
          <ArticleLink law="gdpr" refId="Art. 28" />
          <ArticleLink law="gdpr" refId="Art. 44" />
          <ArticleLink law="gdpr" refId="Art. 46" />
          <Link to="/open/law/gdpr" className="text-ink-600 hover:text-ink-900 hover:underline">
            How GDPR applies →
          </Link>
        </LawLinks>
      </LawRow>
    </section>
  )
}

function LawRow({ label, summary, children }: { label: string; summary: ReactNode; children: ReactNode }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2 hover:bg-ink-50 [&::-webkit-details-marker]:hidden">
        <span className="w-16 shrink-0 text-xs font-medium text-ink-500">{label}</span>
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">{summary}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-400 transition group-open:rotate-180" />
      </summary>
      <div className="space-y-1.5 px-3 pb-3 text-[13px] leading-relaxed text-ink-700 sm:pl-[5.5rem]">{children}</div>
    </details>
  )
}

function LawLinks({ children }: { children: ReactNode }) {
  return <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">{children}</p>
}
