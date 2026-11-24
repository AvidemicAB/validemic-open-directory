import type { MouseEvent, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import OpenLayout, { GITHUB_URL } from './OpenLayout'
import { FACTORS, FACTOR_GROUPS, type FactorGroup } from '../../data/openDirectory/factors'

const SECTIONS = [
  { id: 'principles', label: 'In short' },
  { id: 'answers', label: 'When there is no answer' },
  { id: 'local', label: 'Tools that work locally' },
  { id: 'universities', label: 'Which universities list a tool' },
  { id: 'incidents', label: 'Incidents' },
  { id: 'alternatives', label: 'Alternatives' },
  { id: 'laws', label: 'EU AI Act and GDPR' },
  { id: 'maintainer', label: 'Who maintains this' },
  { id: 'questions', label: 'The questions' },
]

const ANSWER_STATES: { pill: ReactNode; meaning: string }[] = [
  {
    pill: <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600 ring-1 ring-ink-200">Not stated</span>,
    meaning: "We looked in the usual places (privacy policy, DPA, trust page, terms, help centre) and the vendor doesn't say.",
  },
  {
    pill: <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">Could not read</span>,
    meaning: "The vendor's site refused automated reading. A person will check it. It says nothing about the tool.",
  },
  {
    pill: <span className="rounded-full border border-dashed border-ink-300 px-2 py-0.5 text-xs text-ink-400">Not checked yet</span>,
    meaning: "We haven't looked at this question for this tool yet.",
  },
  {
    pill: <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600 ring-1 ring-ink-200">Not applicable</span>,
    meaning: "Only when the vendor's own words show the question doesn't apply, for example a tool that runs entirely on your device.",
  },
]

export default function OpenMethodology() {
  const groups = Object.keys(FACTOR_GROUPS) as FactorGroup[]
  return (
    <OpenLayout>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-8 sm:px-6 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav className="hidden lg:block" aria-label="On this page">
          <ul className="sticky top-20 space-y-1.5 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={(e) => jump(e, s.id)} className="text-ink-500 hover:text-ink-900">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="max-w-2xl text-[15px] leading-relaxed text-ink-600">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-[28px]">How we check</h1>
          <p className="mt-2 text-ink-500">Every tool gets the same {FACTORS.length} questions, answered from the vendor's own pages. Our own products are included and get no special treatment.</p>

          <Section id="principles" title="In short">
            <div className="grid gap-3 sm:grid-cols-3">
              <Principle title="Facts, not verdicts">We quote what the vendor says, with a link and a date. We never call a tool "compliant" or "safe". That depends on how you use it.</Principle>
              <Principle title="Same method for all">One question list, one ranking rule, for every tool. Avidnote and Kahubi included.</Principle>
              <Principle title="Open data">The data is CC BY-SA 4.0 and the code AGPL-3.0, both on GitHub. Anyone can check, reuse or correct it, and share what they build on it under the same licence.</Principle>
            </div>
          </Section>

          <Section id="answers" title="When there is no answer">
            <p>We keep four kinds of "no answer" apart, so a gap is never mistaken for something else.</p>
            <dl className="mt-3 divide-y divide-ink-100 rounded-xl border border-ink-200">
              {ANSWER_STATES.map((a, i) => (
                <div key={i} className="grid gap-1 px-4 py-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
                  <dt>{a.pill}</dt>
                  <dd className="text-sm">{a.meaning}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="local" title="Tools that work locally">
            <p>
              If the vendor states the tool can be used with your content kept on your device, a missing DPA, sub-processor list or SSO shows in amber instead of red. Cloud parts, such as sync, are still listed in full.
            </p>
          </Section>

          <Section id="universities" title="Which universities list a tool">
            <p>Taken from the university's own public pages. "Listed" means only that: not licensed, recommended or in use. Each listing links to the page and shows the date we saw it.</p>
          </Section>

          <Section id="incidents" title="Incidents">
            <p>Only from primary sources: a regulator decision, a court record or the vendor's own notice. Never press articles. Lawsuits are marked "alleged, not ruled".</p>
          </Section>

          <Section id="alternatives" title="Alternatives">
            <p>One rule ranks alternatives for every tool:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                Your preference first: tools built for the same main job that meet it. The default is <strong>EU company</strong> (based in the EU/EEA and, if it has an owner,
                owned from there), because that is what most readers look for. You can switch to <strong>Data in the EU</strong> or <strong>No preference</strong> on any tool page.
              </li>
              <li>Then, tools whose main use is the same as the tool's main use. A product that lists many uses does not outrank one built for the same job.</li>
              <li>Then, how many of the tool's uses they also cover. Each card shows which, by name.</li>
              <li>Then, how many facts are green minus red.</li>
              <li>Then, how many universities list them.</li>
            </ol>
            <p className="mt-2">Avidnote and Kahubi are Swedish, so the EU default can rank them higher where they are built for the same job. They get no other help: the same rule applies, and they are labelled as ours on their own page and as alternatives.</p>
            <p className="mt-2">The top result is shown with a side-by-side comparison of key facts and a link to its site. The others link to their page here and to their own site.</p>
          </Section>

          <Section id="laws" title="EU AI Act and GDPR">
            <p>
              Each checked tool gets an EU AI Act class. Vendors rarely state one, so it is usually a <strong>Validemic assessment</strong> of the tool’s typical use at a university; when the
              vendor does say something, we quote it first. The GDPR part shows the vendor’s role, DPA and transfer mechanism.{' '}
              <Link to="/open/law/ai-act" className="font-medium text-brand-700 hover:underline">
                How we classify under the AI Act
              </Link>{' '}
              ·{' '}
              <Link to="/open/law/gdpr" className="font-medium text-brand-700 hover:underline">
                How GDPR applies
              </Link>
            </p>
          </Section>

          <Section id="maintainer" title="Who maintains this">
            <p>
              Avidemic AB, a Swedish company that also makes Avidnote and Kahubi. Found a mistake?{' '}
              <a href={`${GITHUB_URL}/issues/new?labels=correction`} className="text-brand-700 underline" target="_blank" rel="noopener">
                Tell us
              </a>
              . We usually fix it within a week. Vendors can reply the same way.
            </p>
          </Section>

          <Section id="questions" title={`The ${FACTORS.length} questions`}>
            <div className="space-y-2">
              {groups.map((g) => {
                const list = FACTORS.filter((f) => f.group === g)
                return (
                  <details key={g} className="group rounded-xl border border-ink-200">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-sm font-medium text-ink-900">
                      {FACTOR_GROUPS[g]}
                      <span className="flex items-center gap-2 text-xs font-normal text-ink-400">
                        {list.length}
                        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                      </span>
                    </summary>
                    <dl className="divide-y divide-ink-100 border-t border-ink-100">
                      {list.map((f) => (
                        <div key={f.id} className="grid gap-0.5 px-4 py-2 text-sm sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
                          <dt className="font-medium text-ink-800">
                            {f.label}
                            {f.markets && <span className="ml-1 text-[11px] font-normal text-ink-400">{f.markets.join(', ')}</span>}
                          </dt>
                          <dd className="text-ink-500">{f.question}</dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                )
              })}
            </div>
          </Section>
        </article>
      </div>
    </OpenLayout>
  )
}

function jump(e: MouseEvent, id: string) {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-9 scroll-mt-20">
      <h2 className="mb-2 text-lg font-semibold text-ink-900">{title}</h2>
      {children}
    </section>
  )
}

function Principle({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-ink-50 p-4">
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      <p className="mt-1 text-sm text-ink-500">{children}</p>
    </div>
  )
}
