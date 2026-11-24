import { useEffect, type MouseEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, ExternalLink, MessageSquareText } from 'lucide-react'
import OpenLayout, { GITHUB_URL } from './OpenLayout'
import NotFound from '../NotFound'
import { AI_ACT, AI_ACT_ASSESSED, AI_ACT_PAGES, AI_ACT_TIERS, GDPR_PAGES, lawPage, type AiActRef, type AiActTier, type GdprRef } from '../../data/openDirectory/aiAct'
import { toolById } from '../../data/openDirectory'
import { TierPill } from './parts'
export { TierPill }

export type LawId = 'ai-act' | 'gdpr'

export const LAWS: Record<LawId, { name: string; citation: string; docId: string; eurLex: string; pages: number }> = {
  'ai-act': { name: 'EU AI Act', citation: 'Regulation (EU) 2024/1689', docId: 'ref-aiact', eurLex: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj', pages: 144 },
  gdpr: { name: 'GDPR', citation: 'Regulation (EU) 2016/679', docId: 'ref-gdpr', eurLex: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj', pages: 88 },
}

/** "Art. 50" chip that opens the official PDF at that article. */
export function ArticleLink({ law, refId }: { law: LawId; refId: AiActRef | GdprRef }) {
  const page = law === 'ai-act' ? AI_ACT_PAGES[refId as AiActRef] : GDPR_PAGES[refId as GdprRef]
  return (
    <Link to={lawPage(law, page)} title={`Open ${LAWS[law].name} ${refId} in the official text (page ${page})`} className="whitespace-nowrap font-medium text-brand-700 hover:underline">
      {refId}
    </Link>
  )
}

function jump(e: MouseEvent, id: string) {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-ink-700">{children}</div>
    </section>
  )
}

function Sources({ items }: { items: { label: string; url: string }[] }) {
  return (
    <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-600">
      {items.map((s) => (
        <li key={s.url}>
          <a href={s.url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-ink-900 hover:underline">
            {s.label} <ExternalLink className="h-3 w-3" />
          </a>
        </li>
      ))}
    </ol>
  )
}

function ReadCard({ law }: { law: LawId }) {
  const l = LAWS[law]
  return (
    <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
      <p className="text-sm font-semibold text-ink-900">Read the official text</p>
      <p className="mt-1 text-xs text-ink-600">
        {l.citation}, {l.pages} pages, as published in the Official Journal of the EU.
      </p>
      <Link to={`/open/law/${law}/read`} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-ink-700">
        <BookOpen className="h-4 w-4" /> Open the PDF
      </Link>
      <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-500">
        <MessageSquareText className="h-3 w-3" /> With a chat beside it to ask about the text
      </p>
      <a href={l.eurLex} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-800 hover:underline">
        EUR-Lex <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}

function Page({ law, title, lede, sections, children }: { law: LawId; title: string; lede: ReactNode; sections: { id: string; label: string }[]; children: ReactNode }) {
  return (
    <OpenLayout>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[200px_minmax(0,1fr)_240px]">
        <nav className="hidden lg:block" aria-label="On this page">
          <ul className="sticky top-20 space-y-1.5 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={(e) => jump(e, s.id)} className="text-ink-500 hover:text-ink-900">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <article className="min-w-0 space-y-8">
          <header>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{LAWS[law].citation}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
            <div className="mt-2 text-[15px] leading-relaxed text-ink-600">{lede}</div>
            <div className="mt-4 lg:hidden">
              <ReadCard law={law} />
            </div>
          </header>
          {children}
        </article>
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <ReadCard law={law} />
          </div>
        </aside>
      </div>
    </OpenLayout>
  )
}

/* ── AI Act ───────────────────────────────────────────────────────────── */

const TIER_ORDER: AiActTier[] = ['minimal', 'transparency', 'high-risk-if', 'prohibited', 'gpai-model', 'no-ai', 'unclear']


function AiActPage() {
  const A = (r: AiActRef) => <ArticleLink law="ai-act" refId={r} />
  const byTier = TIER_ORDER.map((tier) => ({
    tier,
    tools: Object.entries(AI_ACT)
      .filter(([, a]) => a.tier === tier)
      .map(([id]) => toolById(id))
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }))
  return (
    <Page
      law="ai-act"
      title="How we classify tools under the EU AI Act"
      lede={
        <p>
          The AI Act sorts AI systems by risk. Almost no vendor says which class its product is in, so for each tool we check we give a <strong>Validemic assessment</strong>: our reading of
          the tool’s typical use at a university. When a vendor does state something, we show its own words first.
        </p>
      }
      sections={[
        { id: 'short', label: 'In short' },
        { id: 'tiers', label: 'The four risk levels' },
        { id: 'education', label: 'Education is high-risk' },
        { id: 'dates', label: 'Dates' },
        { id: 'deployer', label: 'What it means for you' },
        { id: 'method', label: 'How we classify' },
        { id: 'assessment', label: 'Our assessment, not a ruling' },
        { id: 'tools', label: 'Tools by class' },
        { id: 'sources', label: 'Sources' },
      ]}
    >
      <Section id="short" title="In short">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>A short list of practices is banned, including emotion recognition in education ({A('Art. 5')}).</li>
          <li>
            Systems used for admission, grading, placement or detecting cheating in tests are high-risk ({A('Art. 6')}, {A('Annex III')} point 3).
          </li>
          <li>Chatbots and generative AI have transparency duties: tell people it is AI, mark AI-made content ({A('Art. 50')}).</li>
          <li>The companies behind general-purpose models such as GPT, Gemini and Claude have their own duties ({A('Art. 53')}, {A('Art. 55')}).</li>
          <li>The class depends on the purpose. The same chatbot is low-risk for drafting emails and high-risk when it grades exams.</li>
        </ul>
      </Section>

      <Section id="tiers" title="The four risk levels">
        <p>
          The Act itself sets out banned practices ({A('Art. 5')}), high-risk systems ({A('Art. 6')}, {A('Annex III')}), transparency duties for chatbots and generated content (
          {A('Art. 50')}) and rules for general-purpose AI models ({A('Art. 53')}). The European Commission summarises this as four risk levels: minimal, limited, high and
          unacceptable. “Limited” and “minimal” are the Commission’s shorthand, not terms in the Act; we use them because people recognise them, and name the article behind each.
        </p>
        <div className="overflow-hidden rounded-xl border border-ink-200">
          {TIER_ORDER.map((tier) => (
            <div key={tier} className="grid gap-2 border-b border-ink-100 px-4 py-3 last:border-0 sm:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-1">
                <TierPill tier={tier} />
                {AI_ACT_TIERS[tier].basis && <p className="text-[11px] text-ink-500">{AI_ACT_TIERS[tier].level ? `Level ${AI_ACT_TIERS[tier].level} of 4 · ` : 'Off the scale · '}{AI_ACT_TIERS[tier].basis}</p>}
              </div>
              <p className="text-sm text-ink-700">{AI_ACT_TIERS[tier].meaning}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-ink-500">
          “High risk, depending on use” is our wording: the Act says high-risk, and for these tools it turns on whether the university relies on them to grade, admit or detect cheating.
        </p>
      </Section>

      <Section id="education" title="Education is high-risk">
        <p>{A('Annex III')} point 3 lists four uses of AI in education and vocational training that are high-risk:</p>
        <ol className="list-[lower-alpha] space-y-1 pl-6">
          <li>deciding access or admission to education;</li>
          <li>evaluating learning outcomes, including when the result steers the learning process;</li>
          <li>assessing the level of education a person will receive or can access;</li>
          <li>monitoring and detecting prohibited behaviour of students during tests.</li>
        </ol>
        <p>
          Point 4 adds recruitment and decisions about workers, which covers university staff. {A('Art. 6')}(3) takes a system out of high-risk when it only does a narrow procedural task,
          improves the result of work a person already did, detects patterns without replacing a person’s assessment, or prepares an assessment. A system that profiles people is always
          high-risk.
        </p>
        <p>
          That is why we class plagiarism and AI-text detectors, and exam platforms with AI marking or proctoring, as <TierPill tier="high-risk-if" />: whether they are high-risk turns on
          whether a person really makes the decision.
        </p>
      </Section>

      <Section id="dates" title="Dates">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>2 February 2025:</strong> the bans ({A('Art. 5')}) and AI literacy ({A('Art. 4')}) apply.
          </li>
          <li>
            <strong>2 August 2025:</strong> duties for general-purpose AI model providers apply ({A('Art. 53')}).
          </li>
          <li>
            <strong>2 August 2026:</strong> transparency duties apply ({A('Art. 50')}).
          </li>
          <li>
            <strong>2 December 2027:</strong> high-risk rules for Annex III systems, including education, apply. The original date was 2 August 2026; Regulation (EU) 2026/1744 (the AI
            Omnibus), in force since 27 July 2026, moved it ({A('Art. 113')}).
          </li>
        </ul>
        <p className="text-sm text-ink-500">
          The PDF we show is the text as published in 2024. The Omnibus changes are in the{' '}
          <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02024R1689-20260727" target="_blank" rel="noopener" className="underline hover:text-ink-800">
            consolidated version on EUR-Lex
          </a>
          .
        </p>
      </Section>

      <Section id="deployer" title="What it means for a university">
        <p>
          A university that uses an AI tool is a <em>deployer</em> ({A('Art. 3')}(4)); the vendor is the <em>provider</em>. A university that builds its own tool on a model API, or puts a
          general chatbot to work grading or admitting students, can become the provider of a high-risk system (Article 25).
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            For every AI tool: take measures to support AI literacy ({A('Art. 4')}) and do not use banned features ({A('Art. 5')}).
          </li>
          <li>For chatbots and generated content: make sure people know it is AI ({A('Art. 50')}).</li>
          <li>
            For high-risk uses: human oversight, logs, informing students and staff, registration as a public body and a fundamental rights impact assessment ({A('Art. 26')},{' '}
            {A('Art. 27')}).
          </li>
        </ul>
        <p>
          The AI Act does not replace the GDPR. Any AI tool that processes personal data still needs a legal basis and a processor agreement:{' '}
          <Link to="/open/law/gdpr" className="font-medium text-brand-700 hover:underline">
            how GDPR applies
          </Link>
          .
        </p>
      </Section>

      <Section id="method" title="How we classify a tool">
        <p>We ask the same questions, in the same order, for every tool. The first one that fits decides the level.</p>
        <ol className="space-y-2">
          {[
            ['Does it use AI at all?', 'From the company’s own pages: its AI features and the model providers it names. If not, it is outside the Act.', 'no-ai'],
            ['Is any feature a banned practice?', <>For example inferring the emotions of students or staff ({A('Art. 5')}).</>, 'prohibited'],
            [
              'Is it meant for a high-risk use in education or work?',
              <>
                Admission, grading, placement or detecting cheating in tests, or decisions about staff ({A('Annex III')} points 3 and 4). When it depends on whether the university relies on
                it that way, as with plagiarism and AI-text detectors, we say “depending on use”.
              </>,
              'high-risk-if',
            ],
            ['Does it chat with people or generate content?', <>Text, images, audio or video made by AI ({A('Art. 50')}).</>, 'transparency'],
            ['Otherwise', 'It uses AI, for example to recommend or sort, with no specific duties.', 'minimal'],
          ].map(([q, d, tier], i) => (
            <li key={i} className="flex gap-3 rounded-xl border border-ink-200 px-4 py-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink-100 text-xs font-semibold text-ink-700">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink-900">{q}</span>
                <span className="mt-0.5 block text-sm text-ink-600">{d}</span>
              </span>
              <span className="hidden shrink-0 sm:block">
                <TierPill tier={tier as AiActTier} short />
              </span>
            </li>
          ))}
        </ol>
        <p>
          Model APIs, such as the OpenAI API, are general-purpose AI models with their own rules ({A('Art. 53')}), so they sit off the scale.
        </p>
        <h3 className="pt-2 text-base font-semibold text-ink-900">The rules we hold ourselves to</h3>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Intended purpose, not possible misuse.</strong> We judge the use the company describes and the way universities typically use the tool. Any chatbot, ours included,
            could be put to work grading students; that would make the university’s use high-risk ({A('Art. 6')}, Article 25), whichever chatbot it is.
          </li>
          <li>
            <strong>The same method for every tool.</strong> That includes Avidnote and Kahubi, which are made by Avidemic, the team behind this directory. Their pages say so.
          </li>
          <li>
            <strong>The company’s word beside ours.</strong> When a company states its own position, we quote it with a link next to our assessment, and never replace one with the other.
          </li>
          <li>
            <strong>Dated and open.</strong> These assessments were last reviewed on {AI_ACT_ASSESSED}. Every one, with its reasoning, is in the{' '}
            <a href={`${GITHUB_URL}/blob/main/src/data/openDirectory/aiAct.ts`} target="_blank" rel="noopener" className="underline hover:text-ink-900">
              public source code
            </a>
            .
          </li>
          <li>
            <strong>Open to correction.</strong> If you think we got a tool wrong, companies included,{' '}
            <a
              href={`${GITHUB_URL}/issues/new?labels=ai-act&title=${encodeURIComponent('AI Act assessment: ')}`}
              target="_blank"
              rel="noopener"
              className="font-medium text-brand-700 hover:underline"
            >
              tell us why
            </a>
            . We answer in public and update the assessment when the argument holds.
          </li>
        </ul>
      </Section>

      <Section id="assessment" title="Our assessment, not a ruling">
        <p>
          Each tool page shows the class as a <strong>Validemic assessment</strong>, with the reason and the articles it rests on. We assess the tool’s typical use at a university, from what
          the vendor says the tool does. We are not a court or a supervisory authority. Only the intended purpose, set by the provider, and the way your university uses the tool decide
          the legal class. Use our assessment as a starting point for your own check.
        </p>
        <p>
          When a vendor states its own position, for example DeepL’s terms saying the service is not intended for high-risk use, we quote it on the tool page next to our assessment.
        </p>
      </Section>

      <Section id="tools" title="Tools by class">
        <div className="space-y-4">
          {byTier
            .filter((g) => g.tools.length)
            .map((g) => (
              <div key={g.tier}>
                <TierPill tier={g.tier} />
                <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  {g.tools.map((t) => (
                    <Link key={t.id} to={`/open/tools/${t.id}`} className="text-ink-700 hover:text-ink-900 hover:underline">
                      {t.name}
                    </Link>
                  ))}
                </p>
              </div>
            ))}
        </div>
      </Section>

      <Section id="sources" title="Sources">
        <Sources
          items={[
            { label: 'Regulation (EU) 2024/1689 (AI Act), Official Journal text, EUR-Lex', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj' },
            { label: 'AI Act, consolidated version of 27 July 2026, EUR-Lex', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02024R1689-20260727' },
            { label: 'Regulation (EU) 2026/1744 (AI Omnibus), EUR-Lex', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R1744' },
            { label: 'European Commission: AI Act overview', url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai' },
            { label: 'European Commission: General-Purpose AI Code of Practice', url: 'https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai' },
          ]}
        />
        <p className="text-sm text-ink-500">
          A longer guide for universities, article by article:{' '}
          <a href="/laws/ai-act/" className="underline hover:text-ink-800">
            the EU AI Act explained
          </a>
          .
        </p>
      </Section>
    </Page>
  )
}

/* ── GDPR ─────────────────────────────────────────────────────────────── */

function GdprPage() {
  const G = (r: GdprRef) => <ArticleLink law="gdpr" refId={r} />
  const rows: [string, ReactNode][] = [
    ['Vendor role', <>Processor or controller for your content ({G('Art. 4')}, {G('Art. 28')})</>],
    ['DPA', <>A data processing agreement with the terms of {G('Art. 28')}(3)</>],
    ['Sub-processor list', <>Other processors need your prior authorisation ({G('Art. 28')}(2), (4))</>],
    ['Data stored in, transfer mechanism', <>Transfers outside the EU/EEA need an adequacy decision or safeguards such as SCCs ({G('Art. 44')}, {G('Art. 46')})</>],
    ['EU representative', <>Vendors outside the EU must name one ({G('Art. 27')})</>],
    ['Trains on your content', <>Training on your content is a new purpose that needs its own legal basis ({G('Art. 5')}, {G('Art. 6')})</>],
    ['Security, breach notification', <>Appropriate security and breach notice without undue delay ({G('Art. 32')}, {G('Art. 33')})</>],
    ['Data protection officer', <>Contact details published ({G('Art. 13')})</>],
  ]
  return (
    <Page
      law="gdpr"
      title="How GDPR applies to the tools in this directory"
      lede={
        <p>
          The GDPR is the EU law on personal data. When students or staff use a tool, the university is usually the <em>controller</em> and the vendor a <em>processor</em>. Most of the
          checks in this directory test what the GDPR asks of that relationship.
        </p>
      }
      sections={[
        { id: 'short', label: 'In short' },
        { id: 'roles', label: 'Controller and processor' },
        { id: 'transfers', label: 'Data outside the EU' },
        { id: 'checks', label: 'Our checks and the articles' },
        { id: 'dpia', label: 'When you need a DPIA' },
        { id: 'sources', label: 'Sources' },
      ]}
    >
      <Section id="short" title="In short">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            The controller decides why and how personal data is processed; a processor does it on the controller’s behalf ({G('Art. 4')}(7), (8)).
          </li>
          <li>
            A processor needs a contract with the controller: the data processing agreement, or DPA ({G('Art. 28')}).
          </li>
          <li>
            Personal data may leave the EU/EEA only under an adequacy decision or appropriate safeguards ({G('Art. 44')}, {G('Art. 46')}).
          </li>
          <li>
            Fines go up to €20 million or 4% of worldwide turnover ({G('Art. 83')}).
          </li>
        </ul>
      </Section>

      <Section id="roles" title="Controller and processor">
        <p>
          When a university licenses a tool for teaching or research, it decides the purpose, so it is the controller. The vendor processes the data on its instructions, as a processor,
          and must sign a DPA with the terms in {G('Art. 28')}(3): only on instructions, confidentiality, security, help with data subjects’ rights, deletion or return at the end.
        </p>
        <p>
          Some vendors say they are a controller, often for personal accounts or for training their models. Then the university cannot instruct them, and students who sign up with a
          personal account have their own contract with the vendor. That is why tool pages show <em>Vendor role</em> in red when the vendor claims controllership of your content.
        </p>
      </Section>

      <Section id="transfers" title="Data outside the EU">
        <p>
          Data stored or processed outside the EU/EEA needs a transfer tool: an adequacy decision, such as the one for US companies certified under the EU-US Data Privacy Framework,
          or Standard Contractual Clauses ({G('Art. 46')}). After the Schrems II judgment, SCCs need a transfer impact assessment and sometimes extra measures.
        </p>
        <p>
          A vendor based in the EU can still be owned by a US company. US laws such as the CLOUD Act can reach the parent and, through it, the subsidiary. Tool pages show the parent’s
          country next to the vendor’s.
        </p>
      </Section>

      <Section id="checks" title="Our checks and the articles behind them">
        <div className="overflow-hidden rounded-xl border border-ink-200">
          {rows.map(([check, law]) => (
            <div key={check} className="grid gap-1 border-b border-ink-100 px-4 py-2.5 text-sm last:border-0 sm:grid-cols-[220px_minmax(0,1fr)]">
              <span className="font-medium text-ink-800">{check}</span>
              <span className="text-ink-600">{law}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="dpia" title="When you need a DPIA">
        <p>
          A data protection impact assessment is required when processing is likely to result in a high risk to people ({G('Art. 35')}). New technology, large-scale processing of
          students’ data, monitoring, and AI that evaluates people are typical triggers. For high-risk AI under the AI Act, the deployer uses the provider’s information for its DPIA:{' '}
          <Link to="/open/law/ai-act" className="font-medium text-brand-700 hover:underline">
            how the AI Act applies
          </Link>
          .
        </p>
      </Section>

      <Section id="sources" title="Sources">
        <Sources
          items={[
            { label: 'Regulation (EU) 2016/679 (GDPR), EUR-Lex', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj' },
            { label: 'EDPB Guidelines 07/2020 on the concepts of controller and processor', url: 'https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-072020-concepts-controller-and-processor-gdpr_en' },
            { label: 'Commission Implementing Decision (EU) 2021/914: Standard Contractual Clauses', url: 'https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj' },
            { label: 'Commission Implementing Decision (EU) 2023/1795: EU-US Data Privacy Framework', url: 'https://eur-lex.europa.eu/eli/dec_impl/2023/1795/oj' },
            { label: 'CJEU, Case C-311/18 (Schrems II)', url: 'https://curia.europa.eu/juris/liste.jsf?num=C-311/18' },
            { label: 'EDPB Recommendations 01/2020 on supplementary measures for transfers', url: 'https://www.edpb.europa.eu/our-work-tools/our-documents/recommendations/recommendations-012020-measures-supplement-transfer_en' },
          ]}
        />
        <p className="text-sm text-ink-500">
          A longer guide for universities, article by article:{' '}
          <a href="/laws/gdpr/" className="underline hover:text-ink-800">
            the GDPR explained
          </a>
          .
        </p>
      </Section>
    </Page>
  )
}

export default function OpenLaw() {
  const { law } = useParams()
  useEffect(() => {
    if (law === 'ai-act') document.title = 'EU AI Act: how we classify tools | Validemic'
    if (law === 'gdpr') document.title = 'GDPR: how it applies to university tools | Validemic'
  }, [law])
  if (law === 'ai-act') return <AiActPage />
  if (law === 'gdpr') return <GdprPage />
  return <NotFound />
}
