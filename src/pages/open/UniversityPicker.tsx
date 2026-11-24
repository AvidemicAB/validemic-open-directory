import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { inEu } from './parts'
import { Flag } from '../../components/CountryBadge'
import { EuFlag } from '../../components/ui'
import { UNIVERSITIES } from '../../data/openDirectory'
import { countryName } from '../../data/universities'

const ALL = 'ALL'
const EU = 'EU'
const cname = (c: string) => (c === EU ? 'EU / EEA' : countryName(c, 'en'))

/** Tabs: All, the EU/EEA group, then countries by number of universities. */
const TABS = (() => {
  const counts = new Map<string, number>()
  for (const u of UNIVERSITIES) counts.set(u.country, (counts.get(u.country) ?? 0) + 1)
  const eu = UNIVERSITIES.filter((u) => inEu(u.country)).length
  return [
    { code: ALL, n: UNIVERSITIES.length },
    ...(eu ? [{ code: EU, n: eu }] : []),
    ...[...counts].sort((a, b) => b[1] - a[1]).map(([code, n]) => ({ code, n })),
  ]
})()

const inTab = (country: string, tab: string) => tab === ALL || (tab === EU ? inEu(country) : country === tab)

function TabFlag({ code }: { code: string }) {
  if (code === ALL) return null
  return code === EU ? <EuFlag className="h-2.5 w-3.5" /> : <Flag code={code.toLowerCase()} className="h-2.5 w-3.5" />
}

/**
 * Pick universities the way CRM filters work: one search field, country tabs
 * (EU/EEA as one), tick several, or take a whole country at once.
 * A selection of countries and single universities is combined with OR.
 */
export default function UniversityPicker({
  unis,
  countries,
  onChange,
}: {
  unis: Set<string>
  countries: Set<string>
  onChange: (countries: Set<string>, unis: Set<string>) => void
}) {
  const covers = (c: string, country: string) => (c === EU ? inEu(country) : c === country)
  /** Whole country on or off; turning it on drops its single universities (now covered). */
  const onToggleCountry = (c: string) => {
    const nextC = new Set(countries)
    const nextU = new Set(unis)
    if (nextC.has(c)) nextC.delete(c)
    else {
      nextC.add(c)
      for (const u of UNIVERSITIES) if (covers(c, u.country)) nextU.delete(u.name)
    }
    onChange(nextC, nextU)
  }
  /**
   * One university on or off. Unticking one inside a ticked country keeps the
   * rest of that country ticked: the country becomes its universities minus this one.
   */
  const onToggleUni = (name: string) => {
    const uni = UNIVERSITIES.find((u) => u.name === name)
    const covering = uni ? [...countries].filter((c) => covers(c, uni.country)) : []
    const nextU = new Set(unis)
    if (!covering.length) {
      if (nextU.has(name)) nextU.delete(name)
      else nextU.add(name)
      onChange(countries, nextU)
      return
    }
    const nextC = new Set([...countries].filter((c) => !covering.includes(c)))
    for (const u of UNIVERSITIES) {
      const wasIn = covering.some((c) => covers(c, u.country))
      const stillIn = [...nextC].some((c) => covers(c, u.country))
      if (wasIn && !stillIn && u.name !== name) nextU.add(u.name)
    }
    nextU.delete(name)
    onChange(nextC, nextU)
  }
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [tab, setTab] = useState(ALL)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const needle = q.trim().toLowerCase()
  const list = useMemo(
    () => UNIVERSITIES.filter((u) => inTab(u.country, tab) && (!needle || `${u.name} ${countryName(u.country, 'en')}`.toLowerCase().includes(needle))),
    [tab, needle],
  )
  const selectedCount = unis.size + countries.size

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={`Search ${UNIVERSITIES.length} universities`}
          aria-label="Search universities"
          aria-expanded={open}
          className="h-8 w-full rounded-lg border border-ink-200 bg-surface pl-8 pr-2.5 text-xs text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400"
        />
      </div>

      {open && (
        <div className="mt-1 overflow-hidden rounded-xl border border-ink-200 bg-surface lg:absolute lg:left-0 lg:top-full lg:z-30 lg:w-80 lg:shadow-lg">
          <div className="flex flex-wrap gap-1 border-b border-ink-100 p-2" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.code}
                role="tab"
                aria-selected={tab === t.code}
                onClick={() => setTab(t.code)}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition ${
                  tab === t.code ? 'bg-ink-900 text-ink-50' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                <TabFlag code={t.code} />
                {t.code === ALL ? 'All' : t.code === EU ? 'EU / EEA' : t.code}
                <span className={tab === t.code ? 'text-ink-300' : 'text-ink-400'}>{t.n}</span>
              </button>
            ))}
          </div>

          <ul className="max-h-64 overflow-y-auto py-1">
            {tab !== ALL && !needle && (
              <li className="border-b border-ink-100 pb-1">
                <Row checked={countries.has(tab)} onClick={() => onToggleCountry(tab)}>
                  <span className="font-medium text-ink-900">All universities in {cname(tab)}</span>
                </Row>
              </li>
            )}
            {list.map((u) => (
              <li key={u.name}>
                <Row checked={unis.has(u.name) || countries.has(u.country) || (countries.has(EU) && inEu(u.country))} onClick={() => onToggleUni(u.name)}>
                  <span className="truncate">{u.name}</span>
                  <span className="ml-auto shrink-0 pl-2 text-[11px] text-ink-400">
                    {tab === ALL || tab === EU ? `${u.country} · ` : ''}
                    {u.tools} tools
                  </span>
                </Row>
              </li>
            ))}
            {list.length === 0 && <li className="px-3 py-4 text-center text-xs text-ink-500">No university matches.</li>}
          </ul>

          <div className="flex items-center justify-between border-t border-ink-100 px-3 py-1.5 text-[11px] text-ink-500">
            <span>{selectedCount ? `${selectedCount} selected` : 'Tick one or more'}</span>
            <button onClick={() => setOpen(false)} className="font-medium text-brand-700 hover:underline">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ checked, onClick, children }: { checked: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} role="checkbox" aria-checked={checked} className="flex w-full items-center gap-2 px-3 py-1 text-left text-xs text-ink-700 hover:bg-ink-50">
      <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300'}`}>
        {checked && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
      {children}
    </button>
  )
}
