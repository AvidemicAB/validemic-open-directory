import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowRight, Check, ChevronDown, Columns3, Download, Link2, Search, SlidersHorizontal, X } from 'lucide-react'
import OpenLayout, { GITHUB_URL } from './OpenLayout'
import { ByLine, CountryFlags, FactPill, TierPill, VendorFlags, inEu } from './parts'
import { AI_ACT_TIERS, aiActFor, type AiActTier } from '../../data/openDirectory/aiAct'
import UniversityPicker from './UniversityPicker'
import { Flag } from '../../components/CountryBadge'
import { EuFlag, Tip } from '../../components/ui'
import { factorById, toneOf } from '../../data/openDirectory/factors'
import { CATEGORY_CHIP_ORDER, CATEGORY_LABELS, CATEGORY_SHORT, COMPARE_MAX, DIRECTORY, compareSetFor, datasetJson, isEuVendor, fact, searchText, formatFact, isBlocked, universityCount, values, type DirectoryTool } from '../../data/openDirectory'
import { countryName } from '../../data/universities'
import { FACTOR_HELP } from '../../data/openDirectory/help'
import type { PeerCategory } from '../../data/peerTools'

/** Fact filters. Each one is a plain test on recorded facts. */
const FACT_FILTERS: { id: string; label: string; test: (t: DirectoryTool) => boolean }[] = [
  { id: 'notrain', label: "Doesn't train on your content", test: (t) => ['no', 'opt-in'].some((v) => values(fact(t, 'trains_on_content')).includes(v)) },
  { id: 'dpa', label: 'DPA available', test: (t) => ['public', 'self-serve'].some((v) => values(fact(t, 'dpa')).includes(v)) },
  { id: 'sso', label: 'University SSO (SAML, OIDC)', test: (t) => ['saml', 'oidc'].some((v) => values(fact(t, 'sso')).includes(v)) },
  { id: 'vpat', label: 'VPAT published', test: (t) => values(fact(t, 'vpat')).includes('public') },
  { id: 'free', label: 'Free plan', test: (t) => values(fact(t, 'free_plan')).includes('yes') },
  { id: 'oss', label: 'Open source', test: (t) => ['yes', 'partly'].some((v) => values(fact(t, 'open_source')).includes(v)) },
]

const CATS = Object.keys(CATEGORY_LABELS) as PeerCategory[]
const EU = 'EU'
const UNCHECKED_PREVIEW = 15

/** Country codes a tool has for each place filter. */
const PLACES = {
  host: (t: DirectoryTool) => values(fact(t, 'hosting_regions')).filter((c) => /^[A-Z]{2}$/.test(c)),
  vendor: (t: DirectoryTool) => values(fact(t, 'vendor_country')).filter((c) => /^[A-Z]{2}$/.test(c)),
  in: (t: DirectoryTool) => [...new Set(t.listings.map((l) => l.country))],
}
type PlaceKey = keyof typeof PLACES

const matchPlace = (codes: string[], sel: Set<string>) => sel.size === 0 || [...sel].some((s) => (s === EU ? codes.some(inEu) : codes.includes(s)))
/** "EU only": every storage location in the EU/EEA, and the company (and any owner) based there. */
const euOnly = (t: DirectoryTool) => {
  const host = PLACES.host(t)
  return host.length > 0 && host.every(inEu) && isEuVendor(t)
}
const setOf = (v: string | null) => new Set((v ?? '').split(',').filter(Boolean))
const cname = (c: string) => (c === EU ? 'EU / EEA' : countryName(c, 'en'))

/** Options for one place filter: the EU/EEA group first, then countries by count. */
function placeOptions(key: PlaceKey) {
  const counts = new Map<string, number>()
  let eu = 0
  for (const t of DIRECTORY) {
    const codes = PLACES[key](t)
    if (key === 'vendor' ? isEuVendor(t) : codes.some(inEu)) eu++
    for (const c of new Set(codes)) if (c !== EU) counts.set(c, (counts.get(c) ?? 0) + 1)
  }
  const list = [...counts].sort((a, b) => b[1] - a[1] || cname(a[0]).localeCompare(cname(b[0]))).map(([code, n]) => ({ code, n }))
  return eu ? [{ code: EU, n: eu }, ...list] : list
}

type Sel = { f: Set<string>; host: Set<string>; vendor: Set<string>; ai: Set<string>; in: Set<string>; unis: Set<string> }

const hasUniSelection = (sel: Sel) => sel.in.size > 0 || sel.unis.size > 0
/** A listing counts when its university is picked, or its country (or the EU group) is. */
const listingSelected = (l: { university: string; country: string }, sel: Sel) => sel.unis.has(l.university) || (sel.in.size > 0 && matchPlace([l.country], sel.in))

export default function OpenHome() {
  const navigate = useNavigate()
  // Every filter lives in the address, so Back and shared links keep them.
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const category = (CATS.includes(params.get('category') as PeerCategory) ? params.get('category') : 'all') as 'all' | PeerCategory
  const sel: Sel = useMemo(
    () => ({ f: setOf(params.get('f')), host: setOf(params.get('host')), vendor: setOf(params.get('vendor')), ai: setOf(params.get('ai')), in: setOf(params.get('in')), unis: new Set(params.getAll('uni')) }),
    [params],
  )
  const [showUnchecked, setShowUnchecked] = useState(false)
  const sort = params.get('sort') === 'listed' ? 'listed' : 'name'
  const eu = params.get('eu') === '1'
  const [sheet, setSheet] = useState(false)
  const [colIds, setColIds] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('directory-columns-2') ?? 'null') as string[] | null
      if (saved?.length) return saved.filter((id) => COLUMNS.some((c) => c.id === id))
    } catch {
      /* private mode */
    }
    return DEFAULT_COLUMNS
  })
  useEffect(() => {
    try {
      localStorage.setItem('directory-columns-2', JSON.stringify(colIds))
    } catch {
      /* private mode */
    }
  }, [colIds])
  const cols = COLUMNS.filter((c) => colIds.includes(c.id))
  // Tools ticked for comparison: kept for this browser tab, so going to a tool page and back keeps them.
  const [picked, setPicked] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('compare') ?? '[]') as string[]
    } catch {
      return []
    }
  })
  useEffect(() => {
    try {
      sessionStorage.setItem('compare', JSON.stringify(picked))
    } catch {
      /* private mode: selection just isn't kept */
    }
  }, [picked])
  const pick = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= COMPARE_MAX ? p : [...p, id]))
  const rowProps = (t: DirectoryTool) => ({ picked: picked.includes(t.id), full: picked.length >= COMPARE_MAX, onPick: () => pick(t.id) })

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    setParams(next, { replace: true })
  }
  const toggle = (key: 'f' | 'ai' | PlaceKey, id: string) => {
    const n = new Set(sel[key])
    if (n.has(id)) n.delete(id)
    else n.add(id)
    update({ [key]: [...n].join(',') || null })
  }
  /** University names can hold commas, so each one is its own ?uni= entry. */
  const toggleUni = (name: string) => {
    const next = new URLSearchParams(params)
    const list = next.getAll('uni')
    next.delete('uni')
    for (const u of list.includes(name) ? list.filter((x) => x !== name) : [...list, name]) next.append('uni', u)
    setParams(next, { replace: true })
  }
  const setUniSelection = (countries: Set<string>, picked: Set<string>) => {
    const next = new URLSearchParams(params)
    if (countries.size) next.set('in', [...countries].join(','))
    else next.delete('in')
    next.delete('uni')
    for (const u of picked) next.append('uni', u)
    setParams(next, { replace: true })
  }
  const clear = () => setParams(new URLSearchParams(), { replace: true })

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = DIRECTORY.filter((t) => {
      if (category !== 'all' && t.category !== category) return false
      if (needle && !searchText(t).includes(needle)) return false
      for (const f of FACT_FILTERS) if (sel.f.has(f.id) && !f.test(t)) return false
      if (eu && !euOnly(t)) return false
      if (sel.ai.size && !sel.ai.has(aiActFor(t.record?.id ?? t.id)?.tier ?? '')) return false
      if (!matchPlace(PLACES.host(t), sel.host)) return false
      // "Vendor based in EU/EEA" means owned from there too (see isEuVendor).
      if (sel.vendor.size && ![...sel.vendor].some((s) => (s === EU ? isEuVendor(t) : PLACES.vendor(t).includes(s)))) return false
      if (hasUniSelection(sel) && !t.listings.some((l) => listingSelected(l, sel))) return false
      return true
    })
    // A to Z by default; DIRECTORY itself is ordered by how many universities list each tool.
    return sort === 'name' ? [...list].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })) : list
  }, [q, category, sel, sort, eu])

  const checkedRows = rows.filter((t) => t.record)
  const uncheckedRows = rows.filter((t) => !t.record)
  const totalChecked = DIRECTORY.filter((t) => t.record).length
  const uniTotal = new Set(DIRECTORY.flatMap((t) => t.listings.map((l) => l.university))).size

  /** Every active filter as a removable chip. */
  const chips: { label: string; remove: () => void }[] = [
    ...(eu ? [{ label: 'EU only', remove: () => update({ eu: null }) }] : []),
    ...(q.trim() ? [{ label: `“${q.trim()}”`, remove: () => update({ q: null }) }] : []),
    ...(category !== 'all' ? [{ label: CATEGORY_LABELS[category], remove: () => update({ category: null }) }] : []),
    ...[...sel.in].map((c) => ({ label: `Universities in ${cname(c)}`, remove: () => toggle('in', c) })),
    // Many single universities read better as one chip.
    ...(sel.unis.size > 3
      ? [{ label: `${sel.unis.size} universities`, remove: () => setUniSelection(sel.in, new Set()) }]
      : [...sel.unis].map((u) => ({ label: u, remove: () => toggleUni(u) }))),
    ...(['host', 'vendor'] as const).flatMap((k) =>
      [...sel[k]].map((c) => ({ label: `${{ host: 'Data in', vendor: 'Company in' }[k]} ${cname(c)}`, remove: () => toggle(k, c) })),
    ),
    ...FACT_FILTERS.filter((f) => sel.f.has(f.id)).map((f) => ({ label: f.label, remove: () => toggle('f', f.id) })),
    ...[...sel.ai].map((tier) => ({ label: `AI Act: ${AI_ACT_TIERS[tier as AiActTier]?.short ?? tier}`, remove: () => toggle('ai', tier) })),
  ]
  // A university filter or a search is about finding things, so nothing is held back then.
  const narrowed = hasUniSelection(sel) || q.trim() !== '' || category !== 'all'
  const uncheckedShown = showUnchecked || narrowed ? uncheckedRows : uncheckedRows.slice(0, UNCHECKED_PREVIEW)
  const hiddenUnchecked = uncheckedRows.length - uncheckedShown.length
  // Fact and location filters can only match checked tools: say so instead of silently dropping the rest.
  const factFiltering = sel.f.size + sel.host.size + sel.vendor.size + sel.ai.size > 0 || eu
  // One university picked: name it, so a shared link reads as that university's list.
  const soloUni = sel.unis.size === 1 && sel.in.size === 0 ? [...sel.unis][0] : sel.in.size === 1 && sel.unis.size === 0 ? `universities in ${cname([...sel.in][0])}` : ''

  useEffect(() => {
    document.title = soloUni ? `Tools listed by ${soloUni} | Validemic` : 'Is this research tool safe to use? Open directory | Validemic'
  }, [soloUni])

  // The filter sheet covers the page: stop the page behind it from scrolling.
  useEffect(() => {
    if (!sheet) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sheet])

  const open = (e: MouseEvent, id: string) => {
    if (e.metaKey || e.ctrlKey || e.button === 1) window.open(`#/open/tools/${id}`, '_blank', 'noopener')
    else navigate(`/open/tools/${id}`)
  }

  const filters = <Filters sel={sel} toggle={toggle} setUniSelection={setUniSelection} />

  return (
    <OpenLayout>
      <section className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-x-8 gap-y-2 px-4 pt-5 sm:px-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">Is this research tool safe to use at your university?</h1>
          <p className="mt-0.5 text-sm text-ink-500">Data location, AI training, DPA, sign-in and which universities list it. Quoted from each vendor's own pages.</p>
        </div>
        <ul className="flex flex-wrap items-center gap-1.5 text-xs">
          <Badge>Free, no sign-up</Badge>
          <DownloadBadge />
          <Badge href={GITHUB_URL}>Open source</Badge>
        </ul>
      </section>

      <div className="mx-auto mt-4 grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Filters">
          {filters}
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="relative min-w-[14rem] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={q}
                onChange={(e) => update({ q: e.target.value || null })}
                placeholder="Search a tool or a job, like Zotero or transcription"
                aria-label="Search tools"
                className="h-10 w-full rounded-xl border border-ink-200 bg-surface pl-9 pr-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400"
              />
            </div>
            <button onClick={() => setSheet(true)} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-ink-200 px-3 text-sm font-medium text-ink-700 lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {chips.length > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-[11px] text-white">{chips.length}</span>}
            </button>
            <span className="md:hidden">
              <EuOnlyToggle on={eu} onChange={(v) => update({ eu: v ? '1' : null })} />
            </span>
            <span className="text-xs text-ink-500">
              {chips.length ? `${rows.length} of ${DIRECTORY.length} tools` : `${DIRECTORY.length} tools`} · {totalChecked} checked · {uniTotal} universities
            </span>
            <ColumnPicker selected={colIds} onChange={setColIds} />
            <ShareButton className="text-xs" label={chips.length ? 'Share this list' : 'Share'} />
          </div>

          <CategoryChips category={category} update={update} />

          {chips.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <button key={c.label} onClick={c.remove} className="inline-flex items-center gap-1 rounded-full border border-brand-300 bg-brand-50 py-0.5 pl-2.5 pr-1.5 text-xs font-medium text-brand-700 hover:border-brand-500">
                  {c.label} <X className="h-3 w-3" />
                </button>
              ))}
              <button onClick={clear} className="px-1 text-xs text-ink-500 underline hover:text-ink-800">
                Clear all
              </button>
            </div>
          )}

          {soloUni && (
            <h2 className="mt-3 text-base font-semibold text-ink-900">
              Tools listed by {soloUni} <span className="font-normal text-ink-400">({rows.length})</span>
            </h2>
          )}
          {factFiltering && (
            <p className="mt-2 text-xs text-ink-500">Fact and location filters match only the {totalChecked} checked tools.</p>
          )}

          {/* Desktop: table with a header that stays in view. */}
          <table className="mt-3 hidden w-full table-fixed text-left text-sm md:table">
            <colgroup>
              <col className="w-[22%]" />
              {cols.map((c) => (
                <col key={c.id} className={c.width} />
              ))}
              <col className="w-[15%]" />
              <col className="w-[10.5rem]" />
            </colgroup>
            <thead className="sticky top-14 z-10 bg-surface">
              <tr className="border-b border-ink-200 text-[11px] uppercase tracking-wide text-ink-500">
                <th className="py-2.5 pr-3 font-medium">
                  <span className="flex items-center justify-between gap-2">
                    <SortButton active={sort === 'name'} onClick={() => update({ sort: null })}>
                      Tool
                    </SortButton>
                    <EuOnlyToggle on={eu} onChange={(v) => update({ eu: v ? '1' : null })} />
                  </span>
                </th>
                {cols.map((c) => (
                  <HeadCell key={c.id} help={c.help}>
                    {c.label}
                  </HeadCell>
                ))}
                <th className="py-2.5 pl-2 font-medium">
                  <SortButton active={sort === 'listed'} onClick={() => update({ sort: 'listed' })}>
                    Listed by
                  </SortButton>
                </th>
                <th className="py-2.5 pl-2 text-right font-medium">Compare</th>
              </tr>
            </thead>
            <tbody>
              {checkedRows.map((t) => (
                <TableRow key={t.id} t={t} sel={sel} cols={cols} onOpen={(e) => open(e, t.id)} {...rowProps(t)} />
              ))}
              {uncheckedRows.length > 0 && (
                <tr>
                  <td colSpan={cols.length + 3} className="border-b border-ink-200 pb-2 pt-5 text-xs font-medium text-ink-600">
                    Listed by universities, not checked yet ({uncheckedRows.length})
                  </td>
                </tr>
              )}
              {uncheckedShown.map((t) => (
                <TableRow key={t.id} t={t} sel={sel} cols={cols} onOpen={(e) => open(e, t.id)} {...rowProps(t)} />
              ))}
            </tbody>
          </table>
          {hiddenUnchecked > 0 && (
            <button onClick={() => setShowUnchecked(true)} className="mt-2 hidden w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium text-brand-700 hover:bg-ink-50 md:flex">
              <ArrowDown className="h-3.5 w-3.5" /> Show all {uncheckedRows.length} not checked yet
            </button>
          )}

          {/* Phones: one card per tool. */}
          <div className="-mx-4 mt-2 md:hidden">
            <div className="divide-y divide-ink-100 border-y border-ink-100">
              {checkedRows.map((t) => (
                <MobileCard key={t.id} t={t} sel={sel} cols={cols} {...rowProps(t)} />
              ))}
            </div>
            {uncheckedRows.length > 0 && (
              <>
                <p className="px-4 pb-2 pt-4 text-xs font-medium text-ink-600">Listed by universities, not checked yet ({uncheckedRows.length})</p>
                <div className="divide-y divide-ink-100 border-y border-ink-100">
                  {uncheckedShown.map((t) => (
                    <MobileCard key={t.id} t={t} sel={sel} cols={cols} {...rowProps(t)} />
                  ))}
                </div>
                {hiddenUnchecked > 0 && (
                  <button onClick={() => setShowUnchecked(true)} className="w-full py-3 text-xs font-medium text-brand-700">
                    Show all {uncheckedRows.length} not checked yet
                  </button>
                )}
              </>
            )}
          </div>
          {rows.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-ink-500">
              No tools match.{' '}
              <button onClick={clear} className="underline hover:text-ink-800">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Phones and tablets: the same filters in a full-screen sheet. */}
      {sheet && (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface lg:hidden" role="dialog" aria-label="Filters">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink-100 px-4">
            <span className="font-semibold text-ink-900">Filters</span>
            <button onClick={() => setSheet(false)} aria-label="Close filters" className="rounded-lg p-1.5 text-ink-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">{filters}</div>
          <div className="flex shrink-0 gap-2 border-t border-ink-100 p-3">
            <button onClick={clear} className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700">
              Clear
            </button>
            <button onClick={() => setSheet(false)} className="flex-1 rounded-xl bg-ink-900 py-2.5 text-sm font-medium text-ink-50">
              Show {rows.length} tools
            </button>
          </div>
        </div>
      )}
      {picked.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full bg-inverse py-2 pl-4 pr-2 text-sm text-white shadow-xl">
            <span className="truncate">
              {picked.length === 1 ? `${toolName(picked[0])}: pick one more` : `${picked.length} of ${COMPARE_MAX} picked`}
            </span>
            <button onClick={() => setPicked([])} className="text-xs text-white/70 hover:text-white">
              Clear
            </button>
            <Link to={`/open/compare?t=${picked.join(',')}`} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-900 hover:bg-ink-100">
              Compare <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </OpenLayout>
  )
}

const toolName = (id: string) => DIRECTORY.find((t) => t.id === id)?.name ?? id

type PickProps = { picked: boolean; full: boolean; onPick: () => void }

/** "Alternatives" opens a comparison with the closest matches; the box adds the tool to your own comparison. */
function RowActions({ t, picked, full, onPick }: { t: DirectoryTool } & PickProps) {
  return (
    <span className="inline-flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
      <Link to={`/open/compare?t=${compareSetFor(t).join(',')}`} className="text-xs font-medium text-brand-700 hover:underline">
        Alternatives
      </Link>
      <Tip text={picked ? 'Remove from comparison' : full ? `Up to ${COMPARE_MAX} tools` : 'Add to comparison'}>
        <input
          type="checkbox"
          checked={picked}
          disabled={full && !picked}
          onChange={onPick}
          aria-label={`Compare ${t.name}`}
          className="h-4 w-4 cursor-pointer rounded border-ink-300 accent-brand-600 disabled:cursor-not-allowed"
        />
      </Tip>
    </span>
  )
}

function Badge({ children, href, to }: { children: ReactNode; href?: string; to?: string }) {
  const cls = 'inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800 ring-1 ring-emerald-200'
  const body = (
    <>
      <Check className="h-3 w-3" /> {children}
    </>
  )
  if (href)
    return (
      <li>
        <a href={href} target="_blank" rel="noopener" className={`${cls} hover:ring-emerald-400`}>
          {body}
        </a>
      </li>
    )
  if (to)
    return (
      <li>
        <Link to={to} className="inline-flex items-center rounded-full px-1 py-0.5 text-ink-500 underline-offset-2 hover:text-ink-800 hover:underline">
          {children}
        </Link>
      </li>
    )
  return (
    <li>
      <span className={cls}>{body}</span>
    </li>
  )
}

/** Copies the current address (with its filters), or opens the phone's share sheet. */
// eslint-disable-next-line react-refresh/only-export-components
export function ShareButton({ className = '', label = 'Share' }: { className?: string; label?: string }) {
  const [done, setDone] = useState(false)
  const share = async () => {
    const url = window.location.href
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ url, title: document.title })
        return
      } catch {
        /* dismissed: fall back to copying */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setDone(true)
      setTimeout(() => setDone(false), 1800)
    } catch {
      window.prompt('Copy this link', url)
    }
  }
  return (
    <button onClick={() => void share()} className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-medium text-ink-600 hover:text-ink-900 ${className}`}>
      <Link2 className="h-3.5 w-3.5" /> {done ? 'Link copied' : label}
    </button>
  )
}

/* ---------- Filters (sidebar on desktop, sheet on phones) ---------- */

const AI_TIER_FILTER: AiActTier[] = ['minimal', 'transparency', 'high-risk-if', 'gpai-model', 'no-ai']

function Filters({
  sel,
  toggle,
  setUniSelection,
}: {
  sel: Sel
  toggle: (key: 'f' | 'ai' | PlaceKey, id: string) => void
  setUniSelection: (countries: Set<string>, unis: Set<string>) => void
}) {
  const host = useMemo(() => placeOptions('host'), [])
  const vendor = useMemo(() => placeOptions('vendor'), [])
  return (
    <div className="space-y-5 text-sm">
      <FilterGroup title="Listed by">
        <UniversityPicker unis={sel.unis} countries={sel.in} onChange={setUniSelection} />
      </FilterGroup>

      <FilterGroup title="Data stored in">
        <PlaceList options={host} selected={sel.host} onToggle={(c) => toggle('host', c)} />
      </FilterGroup>

      <FilterGroup title="Company based in">
        <PlaceList options={vendor} selected={sel.vendor} onToggle={(c) => toggle('vendor', c)} />
      </FilterGroup>

      <FilterGroup title="EU AI Act risk">
        <p className="mb-1 px-1.5">
          <ByLine by="validemic" />
        </p>
        <ul className="space-y-0.5">
          {AI_TIER_FILTER.map((tier) => (
            <li key={tier}>
              <CheckRow checked={sel.ai.has(tier)} onClick={() => toggle('ai', tier)} count={DIRECTORY.filter((t) => aiActFor(t.record?.id ?? t.id)?.tier === tier).length}>
                {AI_ACT_TIERS[tier].short}
              </CheckRow>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Facts">
        <ul className="space-y-0.5">
          {FACT_FILTERS.map((f) => (
            <li key={f.id}>
              <CheckRow checked={sel.f.has(f.id)} onClick={() => toggle('f', f.id)} count={DIRECTORY.filter(f.test).length}>
                {f.label}
              </CheckRow>
            </li>
          ))}
        </ul>
      </FilterGroup>

    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">{title}</h2>
      {children}
    </section>
  )
}

/** Collapsed place lists show the two groups people look for; the rest are a click away. */
const PLACE_PREVIEW = new Set([EU, 'US'])

function PlaceList({ options, selected, onToggle }: { options: { code: string; n: number }[]; selected: Set<string>; onToggle: (code: string) => void }) {
  const [all, setAll] = useState(false)
  // Selected countries stay visible even when the list is collapsed.
  const shown = all ? options : options.filter((o) => PLACE_PREVIEW.has(o.code) || selected.has(o.code))
  return (
    <ul className="space-y-0.5">
      {shown.map((o) => (
        <li key={o.code}>
          <CheckRow checked={selected.has(o.code)} onClick={() => onToggle(o.code)} count={o.n}>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              {o.code === EU ? <EuFlag className="h-3 w-4 shrink-0" /> : <Flag code={o.code.toLowerCase()} className="h-3 w-4" />}
              <span className={`truncate ${o.code === EU ? 'font-medium text-ink-900' : ''}`}>{cname(o.code)}</span>
            </span>
          </CheckRow>
        </li>
      ))}
      {options.length > shown.length || all ? (
        <li>
          <button onClick={() => setAll((v) => !v)} className="px-1.5 py-1 text-xs font-medium text-brand-700 hover:underline">
            {all ? 'Show fewer' : `Show all ${options.length}`}
          </button>
        </li>
      ) : null}
    </ul>
  )
}

function CheckRow({ checked, onClick, count, radio = false, children }: { checked: boolean; onClick: () => void; count?: number; radio?: boolean; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      role={radio ? 'radio' : 'checkbox'}
      aria-checked={checked}
      className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition hover:bg-ink-50 ${checked ? 'text-ink-900' : 'text-ink-600'}`}
    >
      <span
        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center border ${radio ? 'rounded-full' : 'rounded'} ${
          checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300'
        }`}
      >
        {checked && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {count !== undefined && <span className="shrink-0 text-[11px] tabular-nums text-ink-400">{count}</span>}
    </button>
  )
}

/* ---------- Rows ---------- */

/** Which universities to name first: the selected ones. */
function listedBy(t: DirectoryTool, sel: Sel) {
  const names = [...new Map(t.listings.map((l) => [l.university, l])).values()]
  const picked = hasUniSelection(sel) ? names.filter((l) => listingSelected(l, sel)) : []
  const rest = names.filter((l) => !picked.includes(l))
  return { total: names.length, picked: picked.length, names: [...picked, ...rest].map((l) => l.university) }
}

function ListedCell({ t, sel }: { t: DirectoryTool; sel: Sel }) {
  const l = listedBy(t, sel)
  if (!l.total) return <span className="text-xs text-ink-400">–</span>
  const scoped = hasUniSelection(sel)
  return (
    <div className="min-w-0" title={l.names.slice(0, 15).join('\n') + (l.total > 15 ? `\n+${l.total - 15} more` : '')}>
      <div className="text-xs text-ink-700">
        <span className="font-semibold tabular-nums text-ink-900">{scoped ? l.picked : l.total}</span> {scoped ? 'of your selection' : l.total === 1 ? 'university' : 'universities'}
        {scoped && <span className="text-ink-400"> · {l.total} total</span>}
      </div>
      <div className="truncate text-[11px] text-ink-500">
        {scoped ? <span className="font-medium text-brand-700">{l.names.slice(0, Math.min(l.picked, 3)).join(', ')}</span> : l.names.slice(0, 3).join(', ')}
      </div>
    </div>
  )
}

function TableRow({ t, sel, cols, onOpen, ...pick }: { t: DirectoryTool; sel: Sel; cols: ColumnDef[]; onOpen: (e: MouseEvent) => void } & PickProps) {
  return (
    <tr onClick={onOpen} onAuxClick={onOpen} className="cursor-pointer border-b border-ink-100 transition hover:bg-ink-50">
      <td className="py-2.5 pr-3">
        <Link to={`/open/tools/${t.id}`} onClick={(e) => e.stopPropagation()} className={`font-medium hover:text-brand-700 ${t.record ? 'text-ink-900' : 'text-ink-700'}`}>
          {t.name}
        </Link>
        <div className="truncate text-xs text-ink-500">{t.tagline ?? (t.category ? CATEGORY_LABELS[t.category] : '')}</div>
      </td>
      <RowFacts t={t} cols={cols} />
      <td className="py-2.5 pl-2">
        <ListedCell t={t} sel={sel} />
      </td>
      <td className="py-2.5 pl-2 text-right">
        <RowActions t={t} {...pick} />
      </td>
    </tr>
  )
}

function RowFacts({ t, cols }: { t: DirectoryTool; cols: ColumnDef[] }) {
  const readable = Boolean(t.record) && !isBlocked(t)
  if (readable)
    return cols.map((c) => (
      <td key={c.id} className="px-2 py-2.5">
        {c.cell(t)}
      </td>
    ))
  // Unchecked: columns that don't need research (category) still show; the rest merge into one note.
  const out: ReactNode[] = []
  let gap = 0
  const flush = (key: string) => {
    if (!gap) return
    out.push(
      <td key={key} colSpan={gap} className="px-2 py-2.5 text-xs text-ink-400">
        {t.record ? 'Vendor site refuses automated reading' : 'Not checked yet'}
      </td>,
    )
    gap = 0
  }
  cols.forEach((c) => {
    if (c.needsRecord) gap++
    else {
      flush(`gap-${c.id}`)
      out.push(
        <td key={c.id} className="px-2 py-2.5">
          {c.cell(t)}
        </td>,
      )
    }
  })
  flush('gap-end')
  return out
}

function MobileCard({ t, sel, cols, ...pick }: { t: DirectoryTool; sel: Sel; cols: ColumnDef[] } & PickProps) {
  const readable = t.record && !isBlocked(t)
  const l = listedBy(t, sel)
  return (
    <div className="relative">
    <Link to={`/open/tools/${t.id}`} className="block px-4 pb-9 pt-3 active:bg-ink-50">
      <div className="flex items-baseline justify-between gap-3">
        <span className={`font-medium ${t.record ? 'text-ink-900' : 'text-ink-700'}`}>{t.name}</span>
        {readable && <CountryFlags codes={PLACES.host(t)} />}
      </div>
      <div className="truncate text-xs text-ink-500">{t.tagline ?? (t.category ? CATEGORY_LABELS[t.category] : '')}</div>
      {readable && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {cols
            .filter((c) => c.factor)
            .map((c) => {
              const f = factorById(c.factor!)!
              const v = fact(t, f.id)
              return <FactPill key={c.id} fact={v} tone={toneOf(f, v, t.record?.facts)} label={`${c.label}: ${formatFact(v)}`} />
            })}
        </div>
      )}
      {universityCount(t) > 0 && (
        <div className="mt-1 truncate text-[11px] text-ink-500">
          <span className="font-semibold text-ink-700">{hasUniSelection(sel) ? l.picked : l.total}</span> {hasUniSelection(sel) ? 'of your selection' : 'universities'} · {l.names.slice(0, 2).join(', ')}
        </div>
      )}
    </Link>
      <div className="absolute bottom-2.5 right-4">
        <RowActions t={t} {...pick} />
      </div>
    </div>
  )
}

function HeadCell({ help, children }: { help?: string; children: ReactNode }) {
  return (
    <th className="px-2 py-2.5 font-medium">
      <Tip text={help} underline>
        {children}
      </Tip>
    </th>
  )
}

function SortButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-0.5 uppercase tracking-wide ${active ? 'text-ink-900' : 'hover:text-ink-800'}`} aria-pressed={active}>
      {children}
      {active && <ArrowDown className="h-3 w-3" />}
    </button>
  )
}

/** "Open data" that is literally open: one click downloads the whole dataset as JSON. */
function DownloadBadge() {
  const download = () => {
    const url = URL.createObjectURL(new Blob([datasetJson()], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'validemic-open-directory.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <li>
      <button
        onClick={download}
        title="Download the dataset (JSON, CC BY-SA 4.0)"
        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800 ring-1 ring-emerald-200 hover:ring-emerald-400"
      >
        <Download className="h-3 w-3" /> Open data · CC BY-SA 4.0
      </button>
    </li>
  )
}

/* ---------- Columns the reader can choose ---------- */

type ColumnDef = { id: string; label: string; help?: string; width?: string; needsRecord: boolean; factor?: string; cell: (t: DirectoryTool) => ReactNode }

const factCol = (id: string, label: string): ColumnDef => ({
  id,
  label,
  help: FACTOR_HELP[id],
  needsRecord: true,
  factor: id,
  cell: (t) => {
    const f = factorById(id)!
    const v = fact(t, id)
    return <FactPill fact={v} tone={toneOf(f, v, t.record?.facts)} />
  },
})

const COLUMNS: ColumnDef[] = [
  {
    id: 'category',
    label: 'Category',
    help: 'What kind of tool it is. Our own grouping, used for alternatives.',
    width: 'w-[12%]',
    needsRecord: false,
    cell: (t) => <span className="line-clamp-2 text-xs text-ink-600">{t.category ? CATEGORY_SHORT[t.category] : '–'}</span>,
  },
  { id: 'vendor', label: 'Company', help: FACTOR_HELP.vendor_country, width: 'w-[9%]', needsRecord: true, cell: (t) => <VendorFlags t={t} compact /> },
  { id: 'hosting', label: 'Data stored', help: FACTOR_HELP.hosting_regions, needsRecord: true, cell: (t) => <CountryFlags codes={PLACES.host(t)} max={1} /> },
  factCol('trains_on_content', 'Trains on content'),
  factCol('dpa', 'DPA'),
  {
    id: 'aiact',
    label: 'AI Act risk',
    help: 'EU AI Act risk class. Our assessment of typical university use, unless the company states its own (shown on the tool page).',
    width: 'w-[13%]',
    needsRecord: true,
    cell: (t) => {
      const a = aiActFor(t.record?.id ?? t.id)
      return a ? <TierPill tier={a.tier} short /> : <span className="text-xs text-ink-400">–</span>
    },
  },
  factCol('eu_residency', 'EU residency'),
  factCol('sso', 'SSO'),
  factCol('free_plan', 'Free plan'),
  factCol('open_source', 'Open source'),
  factCol('local_first', 'Works locally'),
  factCol('certifications', 'Certifications'),
  factCol('vpat', 'VPAT'),
  factCol('subprocessors_public', 'Sub-processors'),
]
const DEFAULT_COLUMNS = ['category', 'vendor', 'hosting', 'trains_on_content', 'dpa', 'aiact']
const MAX_COLUMNS = 6

/** "Columns" menu: tick the facts to show in the table (up to six); kept in this browser. */
function ColumnPicker({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: globalThis.MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : selected.length >= MAX_COLUMNS ? selected : [...selected, id])
  return (
    <div ref={ref} className="relative hidden md:block">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="inline-flex items-center gap-1 text-xs font-medium text-ink-600 hover:text-ink-900">
        <Columns3 className="h-3.5 w-3.5" /> Columns
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-60 rounded-xl border border-ink-200 bg-surface p-2 shadow-lg">
          <p className="px-2 pb-1.5 text-[11px] text-ink-500">Show up to {MAX_COLUMNS} columns</p>
          <ul>
            {COLUMNS.map((c) => {
              const on = selected.includes(c.id)
              const full = !on && selected.length >= MAX_COLUMNS
              return (
                <li key={c.id}>
                  <button
                    disabled={full}
                    onClick={() => toggle(c.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300'}`}>
                      {on && <Check className="h-3 w-3" />}
                    </span>
                    {c.label}
                  </button>
                </li>
              )
            })}
          </ul>
          <button onClick={() => onChange(DEFAULT_COLUMNS)} className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-xs text-ink-500 hover:bg-ink-50 hover:text-ink-800">
            Reset to default
          </button>
        </div>
      )}
    </div>
  )
}

/** Type of tool, right above the results: the first thing most people narrow by. */
function CategoryChips({ category, update }: { category: 'all' | PeerCategory; update: (patch: Record<string, string | null>) => void }) {
  const counts = useMemo(() => new Map(CATEGORY_CHIP_ORDER.map((c) => [c, DIRECTORY.filter((t) => t.category === c).length])), [])
  const cats = CATEGORY_CHIP_ORDER.filter((c) => counts.get(c))
  const rowRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(cats.length)
  const [open, setOpen] = useState(false)
  useLayoutEffect(() => {
    const row = rowRef.current
    const measure = measureRef.current
    if (!row || !measure) return
    const calc = () => {
      const chips = Array.from(measure.children) as HTMLElement[]
      const gap = 6
      const moreW = 96
      const avail = row.clientWidth
      let used = chips[0].offsetWidth // "All types"
      let n = 0
      for (let i = 1; i < chips.length; i++) {
        const w = chips[i].offsetWidth + gap
        const rest = i < chips.length - 1 ? moreW + gap : 0
        if (used + w + rest > avail) break
        used += w
        n++
      }
      setFit(n)
    }
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(row)
    return () => ro.disconnect()
  }, [cats.length])
  useEffect(() => {
    if (!open) return
    const close = (e: globalThis.MouseEvent) => !menuRef.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  const shown = cats.slice(0, fit)
  const hidden = cats.slice(fit)
  const hiddenPick = category !== 'all' && hidden.includes(category) ? category : null
  const chip = (on: boolean) => `shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${on ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'}`
  const label = (c: PeerCategory, on: boolean) => (
    <>
      {CATEGORY_SHORT[c]} <span className={on ? 'text-white/70' : 'text-ink-400'}>{counts.get(c)}</span>
    </>
  )
  return (
    <div ref={rowRef} className="relative mt-3" role="group" aria-label="Type of tool">
      {/* Off-screen copy of every chip, for measuring. */}
      <div ref={measureRef} aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 flex gap-1.5">
        <span className={chip(false)}>All types</span>
        {cats.map((c) => (
          <span key={c} className={chip(false)}>
            {label(c, false)}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => update({ category: null })} className={chip(category === 'all')} aria-pressed={category === 'all'}>
          All types
        </button>
        {shown.map((c) => (
          <button key={c} onClick={() => update({ category: category === c ? null : c })} className={chip(category === c)} aria-pressed={category === c}>
            {label(c, category === c)}
          </button>
        ))}
        {hidden.length > 0 && (
          <div ref={menuRef} className="relative ml-auto shrink-0">
            <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className={`inline-flex items-center gap-1 ${chip(Boolean(hiddenPick))}`}>
              {hiddenPick ? CATEGORY_SHORT[hiddenPick] : `More ${hidden.length}`}
              <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <ul className="absolute right-0 top-full z-30 mt-1 w-48 rounded-xl border border-ink-200 bg-surface p-1 shadow-lg">
                {hidden.map((c) => (
                  <li key={c}>
                    <button
                      onClick={() => {
                        update({ category: category === c ? null : c })
                        setOpen(false)
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-ink-50 ${category === c ? 'font-medium text-ink-900' : 'text-ink-700'}`}
                    >
                      <span className="flex items-center gap-1.5">
                        {category === c && <Check className="h-3.5 w-3.5" />}
                        {CATEGORY_SHORT[c]}
                      </span>
                      <span className="text-xs text-ink-400">{counts.get(c)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** The filter people ask for most: data kept in the EU and a company based there. */
function EuOnlyToggle({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <Tip text="Only tools that store data in the EU/EEA alone, from a company based in the EU/EEA and not owned from outside it. AI processing by model providers is not included: check AI model providers on each tool.">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full py-0.5 pl-1 pr-2 text-[11px] font-medium normal-case tracking-normal ring-1 transition ${
          on ? 'bg-brand-50 text-brand-800 ring-brand-300' : 'text-ink-600 ring-ink-200 hover:ring-ink-400'
        }`}
      >
        <span className={`relative h-3.5 w-6 rounded-full transition ${on ? 'bg-brand-600' : 'bg-ink-300'}`}>
          <span className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all ${on ? 'left-3' : 'left-0.5'}`} />
        </span>
        <EuFlag className="h-2.5 w-3.5" /> EU only
      </button>
    </Tip>
  )
}
