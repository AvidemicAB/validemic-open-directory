import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import OpenLayout from './OpenLayout'
import { inEu } from './parts'
import { Flag } from '../../components/CountryBadge'
import { EuFlag } from '../../components/ui'
import { UNIVERSITIES, type UniversityEntry } from '../../data/openDirectory'
import { countryName } from '../../data/universities'

const ALL = 'ALL'
const EU = 'EU'
const cname = (c: string) => (c === EU ? 'EU / EEA' : countryName(c, 'en'))

/** Tabs: All, the EU/EEA group, then countries by number of universities. */
const TABS = (() => {
  const counts = new Map<string, number>()
  for (const u of UNIVERSITIES) counts.set(u.country, (counts.get(u.country) ?? 0) + 1)
  const eu = UNIVERSITIES.filter((u) => inEu(u.country)).length
  return [{ code: ALL, n: UNIVERSITIES.length }, ...(eu ? [{ code: EU, n: eu }] : []), ...[...counts].sort((a, b) => b[1] - a[1]).map(([code, n]) => ({ code, n }))]
})()
const COUNTRY_COUNT = TABS.length - 2

function PlaceFlag({ code }: { code: string }) {
  return code === EU ? <EuFlag className="h-3 w-4" /> : <Flag code={code.toLowerCase()} className="h-3 w-4" />
}

export default function OpenUniversities() {
  // Tab, grouping and search live in the address, so a view can be shared.
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.code === params.get('c')) ? params.get('c')! : ALL
  const euTogether = params.get('group') === 'eu'
  const q = params.get('q') ?? ''
  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }

  const needle = q.trim().toLowerCase()
  const groups = useMemo(() => {
    const list = UNIVERSITIES.filter(
      (u) => (tab === ALL || (tab === EU ? inEu(u.country) : u.country === tab)) && (!needle || `${u.name} ${countryName(u.country, 'en')}`.toLowerCase().includes(needle)),
    )
    const by = new Map<string, UniversityEntry[]>()
    for (const u of list) {
      const key = euTogether && inEu(u.country) ? EU : u.country
      by.set(key, [...(by.get(key) ?? []), u])
    }
    return [...by].map(([code, unis]) => ({ code, unis })).sort((a, b) => Number(b.code === EU) - Number(a.code === EU) || b.unis.length - a.unis.length)
  }, [tab, needle, euTogether])
  const shown = groups.reduce((n, g) => n + g.unis.length, 0)

  return (
    <OpenLayout>
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">Universities</h1>
            <p className="mt-0.5 text-sm text-ink-500">
              {UNIVERSITIES.length} universities in {COUNTRY_COUNT} countries. Open one to see the tools it names on its public pages. Listed means only that.
            </p>
          </div>
        </div>

        {/* One control row: search, country tabs, grouping. */}
        <div className="sticky top-14 z-10 -mx-4 mt-4 border-b border-ink-100 bg-surface/95 px-4 pb-3 pt-2 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={q}
                onChange={(e) => set('q', e.target.value || null)}
                placeholder="Search a university or country"
                aria-label="Search universities"
                className="h-9 w-full rounded-xl border border-ink-200 bg-surface pl-9 pr-3 text-sm outline-none placeholder:text-ink-400 focus:border-brand-400"
              />
            </div>
            <label className="inline-flex cursor-pointer select-none items-center gap-2 text-xs text-ink-600 sm:ml-auto">
              <input type="checkbox" checked={euTogether} onChange={(e) => set('group', e.target.checked ? 'eu' : null)} className="h-3.5 w-3.5 accent-brand-600" />
              Group EU / EEA together
            </label>
          </div>
          <div className="mt-2 flex gap-1 overflow-x-auto [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Country">
            {TABS.map((t) => (
              <button
                key={t.code}
                role="tab"
                aria-selected={tab === t.code}
                onClick={() => set('c', t.code === ALL ? null : t.code)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  tab === t.code ? 'bg-ink-900 text-ink-50' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                {t.code !== ALL && <PlaceFlag code={t.code} />}
                {t.code === ALL ? 'All' : cname(t.code)}
                <span className={tab === t.code ? 'text-ink-300' : 'text-ink-400'}>{t.n}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-6">
          {groups.map((g) => (
            <section key={g.code}>
              <h2 className="flex flex-wrap items-center gap-2 pb-1 text-sm font-semibold text-ink-900">
                <PlaceFlag code={g.code} />
                {cname(g.code)}
                <span className="font-normal text-ink-400">{g.unis.length}</span>
                <Link to={`/?in=${g.code}`} className="ml-auto inline-flex items-center gap-0.5 text-xs font-medium text-brand-700 hover:underline">
                  Compare the tools they list <ArrowRight className="h-3 w-3" />
                </Link>
              </h2>
              <ul className="grid gap-x-6 border-t border-ink-200 pt-1 sm:grid-cols-2 lg:grid-cols-3">
                {g.unis.map((u) => (
                  <li key={u.name}>
                    <Link to={`/?uni=${encodeURIComponent(u.name)}`} className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm text-ink-700 hover:bg-ink-50 hover:text-ink-900">
                      {g.code === EU && <span className="w-5 shrink-0 text-[11px] text-ink-400">{u.country}</span>}
                      <span className="truncate">{u.name}</span>
                      <span className="ml-auto shrink-0 text-xs tabular-nums text-ink-400">{u.tools} tools</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {shown === 0 && <p className="py-10 text-center text-sm text-ink-500">No university matches.</p>}
        </div>
      </div>
    </OpenLayout>
  )
}
