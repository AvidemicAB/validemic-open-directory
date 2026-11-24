/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState } from 'react'
import { countryName } from '../../data/universities'
import { Flag } from '../../components/CountryBadge'
import { EuFlag, isEuEea } from '../../components/ui'
import { answerState, type Fact, type Tone } from '../../data/openDirectory/factors'
import { formatFact, isEuVendor, parentCountries, values, fact, type DirectoryTool } from '../../data/openDirectory'
import { Logo, Tip } from '../../components/ui'
import { Building2 } from 'lucide-react'
import { AI_ACT_TIERS, type AiActAssessment, type AiActTier } from '../../data/openDirectory/aiAct'

export const toneClass: Record<Tone, string> = {
  good: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warn: 'bg-amber-50 text-amber-700 ring-amber-200',
  bad: 'bg-rose-50 text-rose-700 ring-rose-200',
  neutral: 'bg-ink-100 text-ink-600 ring-ink-200',
}

/**
 * One fact as a pill. "Could not read" and "Not checked yet" get their own
 * look so they are never mistaken for "the vendor doesn't say".
 */
export function FactPill({ fact, tone, label }: { fact?: Fact; tone: Tone; label?: string }) {
  const state = answerState(fact)
  if (state === 'not-checked')
    return <span className="inline-flex whitespace-nowrap rounded-full border border-dashed border-ink-300 px-2 py-0.5 text-xs text-ink-400">Not checked</span>
  if (state === 'blocked')
    return (
      <span title="Could not read" className={`inline-flex max-w-full rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${toneClass.warn}`}>
        <span className="truncate">Could not read</span>
      </span>
    )
  return (
    <span className={`inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${toneClass[tone]}`}>
      <span className="truncate">{label ?? formatFact(fact)}</span>
    </span>
  )
}

const isCode = (c: string) => /^[A-Z]{2}$/.test(c)
export const inEu = (c: string) => c === 'EU' || isEuEea(c)
/** EEA members outside the EU: GDPR applies, but they get their own flag only. */
const EEA_ONLY = new Set(['NO', 'IS', 'LI'])

/**
 * Country codes with flags, always on one line: EU/EEA codes first under one EU
 * flag, then others with their own flag. More than `max` codes collapse into a
 * "+N" bubble that opens the full list.
 */
export function CountryFlags({ codes, max = 2 }: { codes: string[]; max?: number }) {
  const list = [...new Set(codes.filter(isCode))]
  if (!list.length) return <span className="text-xs text-ink-400">–</span>
  const ordered = [...list.filter(inEu), ...list.filter((c) => !inEu(c))]
  const shown = ordered.slice(0, max)
  const hidden = ordered.length - shown.length
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-ink-700">
      {shown.map((c) => (
        <span key={c} className="inline-flex items-center gap-1">
          <CountryFlag code={c} />
          {c}
        </span>
      ))}
      {hidden > 0 && <MoreCountries codes={ordered} hidden={hidden} />}
    </span>
  )
}

/**
 * A country's flag; for EU/EEA members a round EU badge sits on its
 * top-right corner, so both read at a glance.
 */
/** How an EU/EEA country shows: split diagonally with the EU flag, or with a round EU badge. */
const EU_STYLE: 'diagonal' | 'badge' = 'diagonal'

export function CountryFlag({ code }: { code: string }) {
  if (code === 'EU') return <EuFlag className="h-3 w-4" />
  if (!inEu(code) || EEA_ONLY.has(code)) return <Flag code={code.toLowerCase()} className="h-3 w-4" />
  return (
    EU_STYLE === 'badge' ? (
      <span className="relative inline-block shrink-0 pr-[3px] pt-[3px]" title={`${countryName(code, 'en')}, EU member`}>
        <Flag code={code.toLowerCase()} className="block h-3 w-4" />
        <EuDot className="absolute right-0 top-0 h-[9px] w-[9px]" />
      </span>
    ) : (
      <span className="relative inline-block h-3 w-4 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-ink-200" title={`${countryName(code, 'en')}, EU member`}>
        <Flag code={code.toLowerCase()} className="absolute inset-0 h-full w-full !rounded-none !ring-0" />
        <span className="absolute inset-0 bg-[#003399] [clip-path:polygon(100%_0,100%_100%,0_100%)]">
          <EuFlag className="h-full w-full translate-x-[17%] translate-y-[17%] scale-[0.6]" />
        </span>
        <span className="absolute inset-0 [background:linear-gradient(to_bottom_right,transparent_calc(50%-0.6px),white_50%,transparent_calc(50%+0.6px))]" />
      </span>
    )
  )
}

/** The EU flag as a small round badge: blue disc, ring of twelve stars (dots at this size). */
function EuDot({ className }: { className?: string }) {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * 2 * Math.PI - Math.PI / 2
    return { x: 10 + 6 * Math.cos(a), y: 10 + 6 * Math.sin(a) }
  })
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="9.5" fill="#003399" stroke="var(--color-surface)" strokeWidth="1.5" />
      {stars.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.1" fill="#ffcc00" />
      ))}
    </svg>
  )
}

/** "+3" bubble: click (or tap) to see every country, with names. */
function MoreCountries({ codes, hidden }: { codes: string[]; hidden: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  return (
    <span ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setOpen((v) => !v)
        }}
        aria-expanded={open}
        aria-label={`Show all ${codes.length} countries`}
        className="rounded-full bg-ink-100 px-1.5 py-px text-[11px] font-medium text-ink-600 hover:bg-ink-200"
      >
        +{hidden}
      </button>
      {open && (
        <span
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          className="absolute left-0 top-full z-30 mt-1 block w-52 rounded-xl border border-ink-200 bg-surface p-2 text-left shadow-lg"
        >
          <span className="block px-1 pb-1 text-[11px] font-medium text-ink-500">{codes.length} countries</span>
          {codes.map((c) => (
            <span key={c} className="flex items-center gap-1.5 px-1 py-0.5 text-xs text-ink-700">
              <CountryFlag code={c} />
              <span className="w-6 font-medium">{c}</span>
              <span className="truncate text-ink-500">{c === 'EU' ? 'European Union' : countryName(c, 'en')}</span>
            </span>
          ))}
        </span>
      )}
    </span>
  )
}

/** Where the vendor is, plus its owner's country when that is somewhere else ("IE · US owner"). */
export function VendorFlags({ t, compact = false }: { t: DirectoryTool; compact?: boolean }) {
  const vendor = values(fact(t, 'vendor_country')).filter(isCode)
  const owner = parentCountries(t).filter((c) => !vendor.includes(c))
  return (
    <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap">
      <CountryFlags codes={vendor} />
      {owner.length > 0 && (
        <Tip text={`Owned by a parent company based in ${owner.map((c) => countryName(c, 'en')).join(', ')}. Laws that apply to the parent, such as the US CLOUD Act, can reach this company too.`}>
          <span className="inline-flex items-center gap-1 rounded bg-ink-100 px-1 py-px text-[11px] text-ink-600">
            <Flag code={owner[0].toLowerCase()} className="h-2.5 w-3.5" />
            {owner[0]}
            {!compact && ' parent'}
          </span>
        </Tip>
      )}
    </span>
  )
}

/**
 * Mark next to a tool's name when its vendor is in the EU/EEA: the EU flag
 * for EU members; for Norway, Iceland and Liechtenstein their own flag and an
 * "EEA" tag, since the EEA has no flag and they are not in the EU.
 */
export function EuMark({ t, small = false }: { t: DirectoryTool; small?: boolean }) {
  if (!t.record || !isEuVendor(t)) return null
  const codes = values(fact(t, 'vendor_country')).filter(isCode)
  if (codes.some((c) => inEu(c) && !EEA_ONLY.has(c))) return <EuFlag className={small ? 'h-2.5 w-3.5 shrink-0' : 'h-3.5 w-5'} />
  const c = codes.find((x) => EEA_ONLY.has(x))
  if (!c) return null
  return (
    <Tip text={`Based in ${countryName(c, 'en')}, in the European Economic Area: not an EU member, but the GDPR applies just as in the EU.`}>
      <span className="inline-flex shrink-0 items-center gap-1 align-middle">
        <Flag code={c.toLowerCase()} className={small ? 'h-2.5 w-3.5' : 'h-3.5 w-5'} />
        <span className={`rounded bg-ink-100 px-1 font-medium text-ink-600 ${small ? 'text-[9px]' : 'text-[11px]'}`}>EEA</span>
      </span>
    </Tip>
  )
}

/** "Level 2 of 4 on the European Commission's AI Act risk scale (Art. 50)." */
export function tierHint(tier: AiActTier) {
  const t = AI_ACT_TIERS[tier]
  return t.level ? `Level ${t.level} of 4 on the European Commission's AI Act risk scale (${t.basis}).` : t.basis ? `${t.basis}.` : ''
}

/** Four bars, one per Commission risk level, filled up to the tool's level. */
function RiskBars({ level }: { level: 0 | 1 | 2 | 3 | 4 }) {
  if (!level) return null
  return (
    <span className="inline-flex items-end gap-px" aria-label={`Risk level ${level} of 4`} role="img">
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`w-[3px] rounded-sm ${i <= level ? 'bg-current' : 'bg-current opacity-25'}`} style={{ height: 3 + i * 2 }} />
      ))}
    </span>
  )
}

export function TierPill({ tier, short = false, plain = false }: { tier: AiActTier; short?: boolean; plain?: boolean }) {
  const t = AI_ACT_TIERS[tier]
  return (
    <span
      title={plain ? undefined : tierHint(tier)}
      className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${toneClass[t.tone]}`}
    >
      <RiskBars level={t.level} />
      <span className="truncate">{short ? t.short : t.label}</span>
    </span>
  )
}

/** Who made a classification: Validemic (our mark) or the company itself. */
export function ByLine({ by }: { by: 'validemic' | 'company' }) {
  return by === 'validemic' ? (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] text-ink-500">
      <Logo className="h-3 w-3 rounded-[3px]" /> Validemic assessment
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] text-ink-500">
      <Building2 className="h-3 w-3" /> Company’s own statement
    </span>
  )
}

/** Both classifications, side by side: ours always, the company's when it gives one. */
export function AiActVerdict({ a }: { a: AiActAssessment }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <Tip text={`${tierHint(a.tier)} Our reading of the tool's typical use at a university; the legal class depends on the intended purpose and on how your university uses the tool.`}>
        <span className="inline-flex cursor-help items-center gap-1.5">
          <TierPill tier={a.tier} plain />
          <ByLine by="validemic" />
        </span>
      </Tip>
      {a.vendor ? (
        <Tip text={a.vendor.says}>
          <span className="inline-flex cursor-help items-center gap-1.5">
            <span className="inline-flex whitespace-nowrap rounded-full border border-ink-300 px-2 py-0.5 text-xs font-medium text-ink-700">{a.vendor.claim}</span>
            <ByLine by="company" />
          </span>
        </Tip>
      ) : (
        <span className="inline-flex items-center gap-1 text-[11px] text-ink-400">
          <Building2 className="h-3 w-3" /> Company states no class
        </span>
      )}
    </span>
  )
}
