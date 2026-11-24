import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ExternalLink, Info, Plus, Search, X } from 'lucide-react'
import OpenLayout from './OpenLayout'
import { ShareButton } from './OpenHome'
import { CountryFlags } from './parts'
import { Tip } from '../../components/ui'
import { FACTORS, FACTOR_GROUPS, answerState, toneOf, type Factor, type FactorGroup, type Tone } from '../../data/openDirectory/factors'
import {
  CATEGORY_LABELS,
  COMPARE_MAX,
  DIRECTORY,
  compareSetFor,
  fact,
  formatFact,
  isBlocked,
  outboundUrl,
  searchText,
  suggestedComparisons,
  OWNED_IDS,
  toolById,
  universityCount,
  values,
  type DirectoryTool,
} from '../../data/openDirectory'
import { FACTOR_HELP, GROUP_HELP } from '../../data/openDirectory/help'

const DOT: Record<Tone, string> = {
  good: 'bg-emerald-500',
  warn: 'bg-amber-400',
  bad: 'bg-rose-500',
  neutral: 'bg-ink-300',
}
const TEXT: Record<Tone, string> = {
  good: 'text-ink-900',
  warn: 'text-ink-900',
  bad: 'text-ink-900',
  neutral: 'text-ink-700',
}
const GROUP_ORDER = Object.keys(FACTOR_GROUPS) as FactorGroup[]

/** A cell's comparable text, for "only differences". */
function cellKey(t: DirectoryTool, f: Factor): string {
  const v = fact(t, f.id)
  const s = answerState(v)
  return s === 'answered' ? values(v).slice().sort().join('|') : s
}

/**
 * Side-by-side comparison of up to four tools on every recorded fact.
 * The selection lives in the URL (?t=zotero,endnote), so a comparison is a link.
 */
export default function OpenCompare() {
  const [params, setParams] = useSearchParams()
  const ids = (params.get('t') ?? '').split(',').filter(Boolean)
  const tools = ids
    .map(toolById)
    .filter((t): t is DirectoryTool => Boolean(t))
    .slice(0, COMPARE_MAX)
  const [diffOnly, setDiffOnly] = useState(false)

  const setTools = (next: string[]) => {
    const p = new URLSearchParams(params)
    if (next.length) p.set('t', [...new Set(next)].slice(0, COMPARE_MAX).join(','))
    else p.delete('t')
    setParams(p, { replace: true })
  }

  useEffect(() => {
    document.title = tools.length >= 2 ? `${tools.map((t) => t.name).join(' vs ')}: data privacy compared | Validemic` : 'Compare research tools | Validemic'
  }, [tools])

  const groups = useMemo(() => {
    return GROUP_ORDER.map((g) => {
      const rows = FACTORS.filter((f) => f.group === g).filter((f) => {
        // A row nobody has an answer for says nothing; hide it.
        const keys = tools.map((t) => cellKey(t, f))
        if (keys.every((k) => k === 'not-checked')) return false
        if (diffOnly && tools.length > 1 && new Set(keys).size === 1) return false
        return true
      })
      return { g, rows }
    }).filter((x) => x.rows.length > 0)
  }, [tools, diffOnly])

  const checked = tools.filter((t) => t.record && !isBlocked(t))
  const dates = checked.map((t) => t.record!.checkedAt).sort()

  return (
    <OpenLayout>
      <section className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-x-8 gap-y-2 px-4 pt-5 sm:px-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">Compare tools</h1>
          <p className="mt-0.5 text-sm text-ink-500">Up to {COMPARE_MAX} tools side by side: data, AI training, contracts, sign-in, security, pricing and what they do.</p>
        </div>
        {tools.length >= 2 && <ShareButton className="text-xs" label="Share this comparison" />}
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {tools.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1 rounded-full bg-ink-100 py-1 pl-3 pr-1.5 text-sm text-ink-800">
              {t.name}
              <button onClick={() => setTools(ids.filter((i) => i !== t.id))} aria-label={`Remove ${t.name}`} className="rounded-full p-0.5 text-ink-400 hover:bg-ink-200 hover:text-ink-700">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {tools.length < COMPARE_MAX && <AddTool exclude={ids} onAdd={(id) => setTools([...ids, id])} first={tools.length === 0} />}
          {tools.length === 1 && (
            <button onClick={() => setTools(compareSetFor(tools[0]))} className="text-sm font-medium text-brand-700 hover:underline">
              Add its closest alternatives
            </button>
          )}
        </div>

        {tools.length === 0 ? (
          <Suggestions onPick={setTools} />
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-xs text-ink-500">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-700">
                <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} className="h-4 w-4 rounded border-ink-300 accent-brand-600" />
                Only show differences
              </label>
              <span>
                Quoted from each vendor's own pages
                {dates.length ? `, checked ${dates[0]}${dates.length > 1 && dates.at(-1) !== dates[0] ? ` to ${dates.at(-1)}` : ''}` : ''}. Hover a value for the quote.
              </span>
            </div>

            <div className="mt-3 overflow-x-auto rounded-xl border border-ink-200 lg:overflow-visible">
              <table className="w-full table-fixed border-collapse text-sm" style={{ minWidth: 150 + tools.length * 190 }}>
                <colgroup>
                  <col className="w-[150px] sm:w-[220px]" />
                  {tools.map((t) => (
                    <col key={t.id} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="border-b border-ink-200 align-top">
                    <th className="sticky left-0 z-20 bg-ink-50 px-3 py-3 text-left lg:top-14 text-xs font-medium uppercase tracking-wide text-ink-500">Tool</th>
                    {tools.map((t) => (
                      <th key={t.id} className="border-l border-ink-100 bg-ink-50 px-3 py-3 text-left font-normal lg:sticky lg:top-14 lg:z-10">
                        <Link to={`/open/tools/${t.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                          {t.name}
                        </Link>
                        <div className="mt-0.5 line-clamp-2 text-xs text-ink-500">{t.tagline ?? (t.category ? CATEGORY_LABELS[t.category] : '')}</div>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                          <Link to={`/open/tools/${t.id}`} className="font-medium text-brand-700 hover:underline">
                            All facts
                          </Link>
                          <a href={outboundUrl(t)} target="_blank" rel="noopener" className="inline-flex items-center gap-0.5 text-ink-500 hover:text-ink-800">
                            Website <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-ink-100">
                    <RowLabel label="Listed by" help="How many universities in this directory list the tool on a public page. Listed means named, not licensed or recommended." />
                    {tools.map((t) => (
                      <td key={t.id} className="border-l border-ink-100 px-3 py-2.5 text-ink-800">
                        {universityCount(t) > 0 ? `${universityCount(t)} universities` : <span className="text-ink-400">None in the directory yet</span>}
                      </td>
                    ))}
                  </tr>
                  {groups.map(({ g, rows }) => (
                    <GroupRows key={g} g={g} rows={rows} tools={tools} />
                  ))}
                </tbody>
              </table>
            </div>

            {diffOnly && groups.length === 0 && <p className="mt-3 text-sm text-ink-500">These tools have the same answer on every fact we recorded.</p>}
            {tools.some((t) => !t.record) && (
              <p className="mt-3 text-xs text-ink-500">
                "Not checked yet" means we haven't researched that tool yet, not that the vendor says nothing.{' '}
                <Link to="/open/methodology" className="underline hover:text-ink-800">
                  How we check
                </Link>
              </p>
            )}
          </>
        )}
      </div>
    </OpenLayout>
  )
}

function GroupRows({ g, rows, tools }: { g: FactorGroup; rows: Factor[]; tools: DirectoryTool[] }) {
  return (
    <>
      <tr className="border-b border-ink-100 bg-ink-50/60">
        <th colSpan={tools.length + 1} className="px-3 pb-2 pt-5 text-left">
          <span className="sticky left-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-700">
            {FACTOR_GROUPS[g]}
            <InfoTip text={GROUP_HELP[g]} />
          </span>
        </th>
      </tr>
      {rows.map((f) => (
        <tr key={f.id} className="border-b border-ink-100 align-top last:border-0 hover:bg-ink-50/50">
          <RowLabel label={f.label} help={FACTOR_HELP[f.id]} />
          {tools.map((t) => (
            <td key={t.id} className="border-l border-ink-100 px-3 py-2.5">
              <Cell t={t} f={f} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function RowLabel({ label, help }: { label: string; help?: string }) {
  return (
    <th scope="row" className="sticky left-0 z-[1] bg-surface px-3 py-2.5 text-left text-[13px] font-normal text-ink-600">
      <span className="inline-flex items-start gap-1">
        <span>{label}</span>
        <InfoTip text={help} />
      </span>
    </th>
  )
}

function Cell({ t, f }: { t: DirectoryTool; f: Factor }) {
  const v = fact(t, f.id)
  const state = answerState(v)
  if (state === 'not-checked') return <span className="text-xs text-ink-400">Not checked yet</span>
  if (state === 'blocked') return <span className="text-xs text-amber-700">Could not read</span>
  if (state === 'not-stated') return <span className="text-ink-500">Not stated</span>
  if (state === 'not-applicable') return <span className="text-ink-500">Not applicable</span>
  const tone = toneOf(f, v, t.record?.facts)
  const ev = v?.evidence?.[0]
  let host = ''
  try {
    host = ev ? new URL(ev.url).hostname.replace(/^www\./, '') : ''
  } catch {
    /* keep empty */
  }
  const tip = ev?.quote ? `“${ev.quote}” (${host}, ${ev.retrievedAt})` : v?.note
  const body = f.kind === 'countries' ? <CountryFlags codes={values(v)} /> : <span className={`${TEXT[tone]} ${f.kind === 'multi' ? 'leading-relaxed' : ''}`}>{formatFact(v)}</span>
  return (
    <Tip text={tip} className="inline-flex items-start gap-2">
      {f.kind !== 'countries' && <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${DOT[tone]}`} aria-hidden />}
      <span className="min-w-0 break-words">{body}</span>
    </Tip>
  )
}

function InfoTip({ text }: { text?: string }) {
  if (!text) return null
  return (
    <Tip text={text}>
      <button type="button" aria-label={text} className="mt-0.5 text-ink-300 hover:text-ink-600 focus:text-ink-600">
        <Info className="h-3.5 w-3.5" />
      </button>
    </Tip>
  )
}

/** Search box that adds one tool. */
function AddTool({ exclude, onAdd, first }: { exclude: string[]; onAdd: (id: string) => void; first: boolean }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  const needle = q.trim().toLowerCase()
  const matches = DIRECTORY.filter((t) => !exclude.includes(t.id) && (!needle || searchText(t).includes(needle))).slice(0, 8)
  const add = (id: string) => {
    onAdd(id)
    setQ('')
    setOpen(false)
  }
  return (
    <div ref={ref} className="relative">
      <div className="relative">
        {first ? (
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        ) : (
          <Plus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        )}
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && matches[0]) add(matches[0].id)
            if (e.key === 'Escape') setOpen(false)
          }}
          placeholder={first ? 'Search a tool to compare, like Zotero' : 'Add a tool'}
          aria-label="Add a tool to compare"
          className={`h-9 rounded-full border border-ink-200 bg-surface pl-9 pr-3 text-sm outline-none placeholder:text-ink-400 focus:border-brand-400 ${first ? 'w-80' : 'w-48'}`}
        />
      </div>
      {open && matches.length > 0 && (
        <ul className="absolute left-0 z-30 mt-1 w-80 overflow-hidden rounded-xl border border-ink-200 bg-surface py-1 shadow-lg">
          {matches.map((t) => (
            <li key={t.id}>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => add(t.id)} className="flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left hover:bg-ink-50">
                <span className="min-w-0">
                  <span className="text-sm font-medium text-ink-900">{t.name}</span>
                  <span className="block truncate text-xs text-ink-500">{t.tagline ?? (t.category ? CATEGORY_LABELS[t.category] : '')}</span>
                </span>
                {!t.record && <span className="shrink-0 text-[11px] text-ink-400">not checked</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Suggestions({ onPick }: { onPick: (ids: string[]) => void }) {
  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold text-ink-900">Common comparisons</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {suggestedComparisons().map((s) => {
          const own = s.ids.find((id) => OWNED_IDS.has(id))
          return (
            <li key={s.key}>
              <button onClick={() => onPick(s.ids)} className="h-full w-full rounded-xl border border-ink-200 px-4 py-3 text-left transition hover:border-brand-300 hover:bg-brand-50/40">
                <span className="block text-xs text-ink-500">{s.title}</span>
                <span className="mt-0.5 block text-sm font-medium text-ink-900">{s.ids.map((id) => toolById(id)?.name).join(' vs ')}</span>
                {own && <span className="mt-1 block text-[11px] text-ink-400">{toolById(own)?.name} is from Avidemic, the team behind this directory.</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
