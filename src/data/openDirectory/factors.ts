/**
 * The open directory's assessment catalogue: every fact we record about a
 * tool. One list drives the research agents (research/README.md builds the
 * prompt from it), the tool pages and the filters, so adding a factor here
 * is the only change needed — and because every source page is cached
 * (research/cache/), a new factor is filled by re-reading cached pages, not
 * by crawling again.
 *
 * Rules every fact follows:
 *  - It is a sourced, dated observation, never a verdict ("DPA: public,
 *    linked", not "GDPR compliant").
 *  - 'unknown' means we looked and the vendor does not say. It is a real
 *    answer and is shown as such.
 *  - Evidence is a URL, a short verbatim quote (max 25 words) and the date.
 */

export type FactorGroup =
  | 'vendor'
  | 'data'
  | 'contract'
  | 'ai'
  | 'security'
  | 'access'
  | 'accessibility'
  | 'frameworks'
  | 'pricing'
  | 'capabilities'
  | 'openness'

export type FactorKind =
  /** One value from `options`. */
  | 'enum'
  /** Several values from `options`. */
  | 'multi'
  /** Free text, kept short. */
  | 'text'
  | 'number'
  /** ISO 3166-1 alpha-2 codes. */
  | 'countries'

export interface Factor {
  id: string
  group: FactorGroup
  label: string
  /** The question the researcher answers, phrased for the agent prompt. */
  question: string
  kind: FactorKind
  options?: readonly string[]
  /** Values shown green / amber / red on tool pages. Unlisted values are neutral. */
  good?: readonly string[]
  warn?: readonly string[]
  bad?: readonly string[]
  /** Shown as a filter chip on the list page. */
  filter?: boolean
  /** Only relevant in some markets (shown there first, hidden nowhere). */
  markets?: readonly ('EU' | 'US' | 'UK' | 'AU' | 'CA')[]
}

const YNU = ['yes', 'no', 'unknown'] as const

export const FACTORS: readonly Factor[] = [
  /* ── Vendor ──────────────────────────────────────────────────────── */
  { id: 'vendor_entity', group: 'vendor', label: 'Legal entity', kind: 'text', question: 'The company that provides the service and signs the contract (legal name as in the terms or privacy policy).' },
  { id: 'vendor_country', group: 'vendor', label: 'Vendor based in', kind: 'countries', filter: true, question: 'Country of the contracting entity / headquarters.' },
  { id: 'parent_company', group: 'vendor', label: 'Parent company', kind: 'text', question: 'Ultimate parent or owner if different (e.g. acquired by Elsevier, Clarivate, Microsoft).' },
  { id: 'parent_country', group: 'vendor', label: 'Parent company based in', kind: 'countries', question: 'Country where the ultimate parent company is headquartered, when the contracting company is owned by another company (e.g. an Irish subsidiary of a US company: US). not-applicable when there is no separate parent (parent_company none-found). Laws that reach the parent, such as the US CLOUD Act, can reach the subsidiary.' },
  { id: 'eu_representative', group: 'vendor', label: 'EU representative (Art. 27)', kind: 'enum', options: ['named', 'not-needed', 'none-found'], good: ['named', 'not-needed'], bad: ['none-found'], markets: ['EU'], question: 'For non-EU vendors: is a GDPR Art. 27 EU representative named? "not-needed" if the vendor is established in the EU/EEA.' },
  { id: 'dpo_contact', group: 'vendor', label: 'Data protection officer', kind: 'enum', options: ['named', 'contact-only', 'none-found'], good: ['named', 'contact-only'], warn: ['none-found'], question: 'Is a DPO or privacy contact published?' },

  /* ── Data location and transfers ─────────────────────────────────── */
  { id: 'hosting_regions', group: 'data', label: 'Data stored in', kind: 'countries', filter: true, question: 'Countries/regions where customer content is stored by default. Use EU for unspecified EU/EEA.' },
  { id: 'local_first', group: 'data', label: 'Works locally', kind: 'enum', options: ['yes', 'optional-sync', 'no'], good: ['yes', 'optional-sync'], question: "Can the tool be used with content kept only on the user's device, with nothing sent to the vendor? optional-sync = local by default, cloud sync is optional. Quote the vendor saying so." },
  { id: 'eu_residency', group: 'data', label: 'EU data residency', kind: 'enum', options: ['default', 'option', 'enterprise-only', 'no', 'unknown'], good: ['default', 'option'], warn: ['enterprise-only', 'unknown'], bad: ['no'], filter: true, question: 'Can customer content be kept inside the EU/EEA? default = always; option = selectable; enterprise-only = only on enterprise contracts.' },
  { id: 'cloud_providers', group: 'data', label: 'Cloud / infrastructure', kind: 'multi', options: ['aws', 'azure', 'gcp', 'oracle', 'hetzner', 'ovh', 'own', 'other', 'unknown'], question: 'Which infrastructure providers host the service?' },
  { id: 'transfer_mechanism', group: 'data', label: 'Transfer mechanism', kind: 'multi', options: ['none-needed', 'dpf', 'sccs', 'bcrs', 'adequacy', 'unknown'], good: ['none-needed', 'dpf', 'sccs', 'adequacy'], warn: ['unknown'], markets: ['EU', 'UK'], question: 'For data leaving the EEA: EU-US Data Privacy Framework certification (check dataprivacyframework.gov), Standard Contractual Clauses, BCRs, or adequacy.' },
  { id: 'subprocessors_public', group: 'data', label: 'Sub-processor list', kind: 'enum', options: ['public', 'on-request', 'none-found'], good: ['public'], warn: ['on-request'], bad: ['none-found'], question: 'Is the list of sub-processors published?' },
  { id: 'subprocessors_count', group: 'data', label: 'Sub-processors', kind: 'number', question: 'How many sub-processors are listed?' },
  { id: 'subprocessors_non_eea', group: 'data', label: 'Sub-processors outside EEA', kind: 'number', question: 'How many listed sub-processors process data outside the EU/EEA?' },
  { id: 'subprocessor_notice', group: 'data', label: 'Change notice', kind: 'enum', options: ['notified', 'page-only', 'unknown'], good: ['notified'], question: 'Are customers notified before new sub-processors are added (email/subscription), or is the page just updated?' },

  /* ── Contract and GDPR ───────────────────────────────────────────── */
  { id: 'dpa', group: 'contract', label: 'DPA', kind: 'enum', options: ['public', 'self-serve', 'on-request', 'enterprise-only', 'none-found'], good: ['public', 'self-serve'], warn: ['on-request', 'enterprise-only'], bad: ['none-found'], filter: true, question: 'Is a data processing agreement (GDPR Art. 28) available? public = downloadable; self-serve = accept/sign online.' },
  { id: 'role', group: 'contract', label: 'Vendor role', kind: 'enum', options: ['processor', 'controller', 'mixed', 'unknown'], good: ['processor'], warn: ['mixed', 'unknown'], bad: ['controller'], question: 'Does the vendor act as processor for customer content, or claim controllership (e.g. for analytics or model training)?' },
  { id: 'privacy_policy_date', group: 'contract', label: 'Privacy policy updated', kind: 'text', question: 'Last-updated date of the privacy policy (YYYY-MM-DD).' },
  { id: 'retention_stated', group: 'contract', label: 'Retention stated', kind: 'enum', options: YNU, good: ['yes'], warn: ['unknown', 'no'], question: 'Does the vendor state how long customer content is kept?' },
  { id: 'deletion_on_exit', group: 'contract', label: 'Deletion on exit', kind: 'enum', options: ['stated', 'on-request', 'unknown'], good: ['stated'], question: 'Is deletion of customer data after termination described (with a time frame)?' },
  { id: 'data_export', group: 'contract', label: 'Data export', kind: 'enum', options: ['full', 'partial', 'none', 'unknown'], good: ['full'], warn: ['partial'], bad: ['none'], question: 'Can users/admins export their content in open formats?' },
  { id: 'breach_notice', group: 'contract', label: 'Breach notification', kind: 'text', question: 'Committed breach-notification window (e.g. "without undue delay, max 48h").' },
  { id: 'governing_law', group: 'contract', label: 'Governing law', kind: 'countries', question: 'Jurisdiction / governing law of the terms.' },

  /* ── AI ──────────────────────────────────────────────────────────── */
  { id: 'ai_features', group: 'ai', label: 'Uses generative AI', kind: 'enum', options: ['core', 'optional', 'none'], question: 'Is generative AI the core of the product, an optional feature, or absent?' },
  { id: 'ai_providers', group: 'ai', label: 'AI model providers', kind: 'multi', options: ['openai', 'azure-openai', 'anthropic', 'google', 'mistral', 'meta', 'own', 'open-weights-self-hosted', 'other', 'unknown'], question: 'Which model providers process user content?' },
  { id: 'trains_on_content', group: 'ai', label: 'Trains on your content', kind: 'enum', options: ['no', 'opt-in', 'opt-out', 'yes', 'de-identified', 'unknown'], good: ['no', 'opt-in'], warn: ['opt-out', 'de-identified', 'unknown'], bad: ['yes'], filter: true, question: 'Does the vendor (or its model providers) use customer content to train or improve models? Quote the clause.' },
  { id: 'ai_zero_retention', group: 'ai', label: 'Zero retention at model provider', kind: 'enum', options: YNU, good: ['yes'], question: 'Does the vendor state zero data retention / no logging at the AI model provider?' },
  { id: 'ai_admin_off', group: 'ai', label: 'Admins can turn AI off', kind: 'enum', options: YNU, good: ['yes'], question: 'Can an institution admin disable the AI features?' },
  { id: 'ai_act_statement', group: 'ai', label: 'EU AI Act statement', kind: 'enum', options: YNU, markets: ['EU'], question: 'Does the vendor publish an EU AI Act position or transparency statement?' },

  /* ── Security ────────────────────────────────────────────────────── */
  { id: 'certifications', group: 'security', label: 'Certifications', kind: 'multi', options: ['iso27001', 'iso27701', 'iso27017', 'iso27018', 'iso42001', 'soc2-type2', 'soc2-type1', 'cyber-essentials', 'csa-star', 'tisax', 'bsi-c5', 'none-found'], good: ['iso27001', 'soc2-type2'], filter: true, question: 'Security/privacy certifications or audits the vendor claims (verified via trust page or certificate).' },
  { id: 'trust_page', group: 'security', label: 'Trust / security page', kind: 'enum', options: ['yes', 'no'], good: ['yes'], question: 'Is there a security or trust centre page?' },
  { id: 'encryption', group: 'security', label: 'Encryption', kind: 'multi', options: ['in-transit', 'at-rest', 'customer-keys', 'e2e', 'unknown'], question: 'Encryption in transit / at rest / customer-managed keys / end-to-end.' },
  { id: 'pentest', group: 'security', label: 'Independent pen test', kind: 'enum', options: ['public-summary', 'on-request', 'claimed', 'unknown'], good: ['public-summary', 'on-request'], question: 'Are independent penetration tests performed and shareable?' },
  { id: 'vuln_disclosure', group: 'security', label: 'Vulnerability disclosure', kind: 'enum', options: ['bug-bounty', 'policy', 'none-found'], good: ['bug-bounty', 'policy'], question: 'Bug bounty or vulnerability disclosure policy (security.txt counts).' },
  { id: 'incidents', group: 'security', label: 'Public incidents (5 yrs)', kind: 'text', question: 'Breaches or regulator fines in the last 5 years. Primary sources only: a regulator decision, a court record or the vendor\'s own notice (not press articles). Lawsuits are written as "alleged, not ruled" with the case name. "none found" if none; "unknown" if you did not search.' },
  { id: 'status_page', group: 'security', label: 'Status page', kind: 'enum', options: ['yes', 'no'], question: 'Public uptime/status page?' },

  /* ── Access and administration ───────────────────────────────────── */
  { id: 'sso', group: 'access', label: 'SSO', kind: 'multi', options: ['saml', 'oidc', 'google', 'microsoft', 'none'], good: ['saml', 'oidc'], bad: ['none'], filter: true, question: 'Single sign-on protocols supported.' },
  { id: 'federation', group: 'access', label: 'Academic federation', kind: 'multi', options: ['edugain', 'swamid', 'haka', 'feide', 'wayf', 'incommon', 'ukfed', 'aaf', 'none-found'], good: ['edugain', 'swamid', 'haka', 'feide', 'wayf', 'incommon', 'ukfed', 'aaf'], question: 'Listed in eduGAIN or a national federation (SWAMID, Haka, Feide, WAYF, InCommon, UK Federation, AAF)?' },
  { id: 'scim', group: 'access', label: 'SCIM provisioning', kind: 'enum', options: YNU, good: ['yes'], question: 'Automated user provisioning (SCIM)?' },
  { id: 'mfa', group: 'access', label: 'MFA', kind: 'enum', options: YNU, good: ['yes'], question: 'Multi-factor authentication for local accounts?' },
  { id: 'admin_console', group: 'access', label: 'Admin console', kind: 'enum', options: YNU, good: ['yes'], question: 'Institution admin console with user management and usage reports?' },
  { id: 'audit_logs', group: 'access', label: 'Audit logs', kind: 'enum', options: YNU, good: ['yes'], question: 'Admin-visible audit logs?' },
  { id: 'lms_integration', group: 'access', label: 'LMS integration', kind: 'multi', options: ['lti', 'canvas', 'moodle', 'blackboard', 'brightspace', 'itslearning', 'none'], question: 'LMS integrations (LTI version if stated).' },

  /* ── Accessibility ───────────────────────────────────────────────── */
  { id: 'vpat', group: 'accessibility', label: 'VPAT / ACR', kind: 'enum', options: ['public', 'on-request', 'none-found'], good: ['public'], warn: ['on-request'], bad: ['none-found'], filter: true, question: 'Accessibility Conformance Report (VPAT) available?' },
  { id: 'wcag_level', group: 'accessibility', label: 'WCAG level claimed', kind: 'enum', options: ['2.2-aa', '2.1-aa', '2.0-aa', 'partial', 'none-claimed'], good: ['2.2-aa', '2.1-aa'], warn: ['partial', '2.0-aa'], question: 'WCAG conformance level the vendor claims.' },
  { id: 'accessibility_statement', group: 'accessibility', label: 'Accessibility statement', kind: 'enum', options: YNU, good: ['yes'], markets: ['EU'], question: 'Published accessibility statement (EU Web Accessibility Directive / European Accessibility Act)?' },

  /* ── Market frameworks ───────────────────────────────────────────── */
  { id: 'hecvat', group: 'frameworks', label: 'HECVAT', kind: 'enum', options: ['full-public', 'lite-public', 'on-request', 'none-found'], good: ['full-public', 'lite-public'], warn: ['on-request'], markets: ['US', 'CA'], filter: true, question: 'Completed HECVAT (Full / Lite / On-Prem) published or available?' },
  { id: 'ferpa', group: 'frameworks', label: 'FERPA', kind: 'enum', options: ['statement', 'school-official-terms', 'none-found'], good: ['statement', 'school-official-terms'], markets: ['US'], question: 'FERPA compliance statement or "school official" contract terms?' },
  { id: 'hipaa_baa', group: 'frameworks', label: 'HIPAA BAA', kind: 'enum', options: ['available', 'not-offered', 'unknown'], good: ['available'], markets: ['US'], question: 'Will the vendor sign a HIPAA Business Associate Agreement?' },
  { id: 'section_508', group: 'frameworks', label: 'Section 508', kind: 'enum', options: YNU, good: ['yes'], markets: ['US'], question: 'Section 508 conformance claimed?' },
  { id: 'state_privacy', group: 'frameworks', label: 'US state student-privacy', kind: 'multi', options: ['sdpc-npdpa', 'ccpa', 'nysed-2d', 'none-found'], markets: ['US'], question: 'Signed Student Data Privacy Consortium agreements, CCPA terms, NY Ed Law 2-d, etc.' },
  { id: 'uk_gdpr', group: 'frameworks', label: 'UK transfers (IDTA / addendum)', kind: 'enum', options: YNU, markets: ['UK'], question: 'UK GDPR transfer terms (IDTA or UK addendum to SCCs)?' },
  { id: 'au_privacy', group: 'frameworks', label: 'Australian Privacy Act / IRAP', kind: 'multi', options: ['app-statement', 'irap', 'au-hosting', 'none-found'], markets: ['AU'], question: 'Australian Privacy Principles statement, IRAP assessment, Australian hosting?' },
  { id: 'nis2', group: 'frameworks', label: 'NIS2 statement', kind: 'enum', options: YNU, markets: ['EU'], question: 'Does the vendor address NIS2 supply-chain requirements?' },

  /* ── Pricing ─────────────────────────────────────────────────────── */
  { id: 'free_plan', group: 'pricing', label: 'Free plan', kind: 'enum', options: ['yes', 'trial-only', 'no'], filter: true, question: 'Is there a permanent free plan, only a trial, or neither?' },
  { id: 'price_individual', group: 'pricing', label: 'Individual price', kind: 'text', question: 'Lowest paid individual price as published (currency, per month or year). "not published" if hidden.' },
  { id: 'institutional_licence', group: 'pricing', label: 'Institutional licence', kind: 'enum', options: ['yes', 'no', 'unknown'], question: 'Site/campus/department licence offered?' },
  { id: 'edu_discount', group: 'pricing', label: 'Education discount', kind: 'enum', options: YNU, question: 'Student or academic discount?' },
  { id: 'pricing_public', group: 'pricing', label: 'Pricing public', kind: 'enum', options: ['yes', 'partial', 'no'], question: 'Are prices published on the website?' },

  /* ── Capabilities (what it does — drives alternatives) ───────────── */
  {
    id: 'capabilities',
    group: 'capabilities',
    label: 'What it does',
    kind: 'multi',
    filter: true,
    options: [
      'literature-search', 'paper-chat', 'summarize-papers', 'systematic-review', 'citation-graph', 'reference-management', 'citation-formatting',
      'academic-writing', 'paraphrasing', 'translation', 'grammar', 'plagiarism-check', 'ai-detection',
      'survey', 'interview-transcription', 'qualitative-coding', 'statistics', 'data-visualization', 'data-management-plan',
      'notes', 'collaboration-docs', 'video-meetings', 'lecture-capture', 'lms', 'exam', 'storage', 'e-signature', 'general-ai-chat', 'coding-assistant',
    ],
    question: 'Which of these jobs does the product actually do (from its own product pages)? Only list what is a real feature, not a roadmap item.',
  },
  { id: 'primary_capability', group: 'capabilities', label: 'Main use', kind: 'enum', options: ['literature-search', 'paper-chat', 'systematic-review', 'reference-management', 'academic-writing', 'survey', 'interview-transcription', 'qualitative-coding', 'statistics', 'video-meetings', 'lms', 'exam', 'storage', 'general-ai-chat', 'other'], question: 'The single job the product is mainly bought for.' },
  { id: 'platforms', group: 'capabilities', label: 'Platforms', kind: 'multi', options: ['web', 'windows', 'macos', 'linux', 'ios', 'android', 'browser-extension', 'word-addin'], question: 'Where it runs.' },
  { id: 'languages', group: 'capabilities', label: 'Interface languages', kind: 'text', question: 'Interface languages (list, or a count).' },
  { id: 'api', group: 'capabilities', label: 'Public API', kind: 'enum', options: YNU, question: 'Public API with documentation?' },

  /* ── Openness ────────────────────────────────────────────────────── */
  { id: 'open_source', group: 'openness', label: 'Open source', kind: 'enum', options: ['yes', 'partly', 'no'], filter: true, question: 'Is the product open source (licence)?' },
  { id: 'self_host', group: 'openness', label: 'Self-hosting', kind: 'enum', options: YNU, question: 'Can an institution host it on its own infrastructure?' },
]

/** Display order: what a DPO or librarian checks first comes first. */
export const FACTOR_GROUPS: Record<FactorGroup, string> = {
  data: 'Where your data goes',
  ai: 'AI and your data',
  contract: 'Contract and GDPR',
  access: 'Sign-in and administration',
  security: 'Security',
  accessibility: 'Accessibility',
  vendor: 'Vendor',
  pricing: 'Pricing',
  capabilities: 'What it does',
  openness: 'Openness',
  frameworks: 'US, UK and other frameworks',
}

/** Groups open by default on a tool page; the rest start collapsed. */
export const OPEN_GROUPS: readonly FactorGroup[] = ['data', 'ai', 'contract', 'access']

export const factorById = (id: string) => FACTORS.find((f) => f.id === id)

/** One recorded fact: the value plus where it came from. */
export interface Evidence {
  url: string
  /** Verbatim, max 25 words. */
  quote?: string
  retrievedAt: string
}

export interface Fact {
  value: string | string[] | number
  /** Names behind an "other" value (e.g. a host not in the option list), shown instead of "Other". */
  others?: string[]
  /** Which accounts or plans the answer differs for. Shown with an asterisk next to the value. */
  footnote?: string
  evidence?: Evidence[]
  note?: string
}

export interface ToolRecord {
  id: string
  name: string
  website: string
  tagline: string
  /**
   * Our own classification (not a vendor claim), used for alternatives when
   * the tool is not in the peer list or its pages could not be read.
   */
  category?: 'reference' | 'ai' | 'survey' | 'statistics' | 'meetings' | 'lms' | 'plagiarism' | 'exam' | 'transcription' | 'storage' | 'productivity'
  /** factorId → fact. A missing factor means "not researched yet". */
  facts: Record<string, Fact>
  /** When the record was last checked end to end. */
  checkedAt: string
}

export type Tone = 'good' | 'warn' | 'bad' | 'neutral'

/**
 * Factors that matter less when content can stay on the user's device: a
 * missing DPA or SSO is amber, not red, for a tool that works locally
 * (local_first yes / optional-sync, which itself needs a vendor quote).
 */
const LOCAL_SOFTENED = new Set(['dpa', 'subprocessors_public', 'sso', 'eu_residency', 'eu_representative'])

/** True when a red answer was shown amber only because the tool works locally. */
export function softenedByLocal(f: Factor, fact: Fact | undefined, facts?: Record<string, Fact>): boolean {
  if (!fact || !f.bad || !LOCAL_SOFTENED.has(f.id)) return false
  const vals = Array.isArray(fact.value) ? fact.value.map(String) : [String(fact.value)]
  const local = facts?.local_first?.value
  return vals.some((v) => f.bad!.includes(v)) && (local === 'yes' || local === 'optional-sync')
}

export function toneOf(f: Factor, fact: Fact | undefined, facts?: Record<string, Fact>): Tone {
  if (!fact) return 'neutral'
  const vals = Array.isArray(fact.value) ? fact.value.map(String) : [String(fact.value)]
  if (vals.includes('not-applicable')) return 'neutral'
  if (f.bad && vals.some((v) => f.bad!.includes(v))) {
    const local = facts?.local_first?.value
    return LOCAL_SOFTENED.has(f.id) && (local === 'yes' || local === 'optional-sync') ? 'warn' : 'bad'
  }
  if (f.good && vals.some((v) => f.good!.includes(v))) return 'good'
  if (f.warn && vals.some((v) => f.warn!.includes(v))) return 'warn'
  return 'neutral'
}

/**
 * How a factor was answered. Kept apart so "the vendor says nothing" is never
 * confused with "we couldn't read the page" or "we haven't looked yet".
 */
export type AnswerState = 'answered' | 'not-stated' | 'blocked' | 'not-applicable' | 'not-checked'

export function answerState(fact: Fact | undefined): AnswerState {
  if (!fact) return 'not-checked'
  const vals = Array.isArray(fact.value) ? fact.value.map(String) : [String(fact.value)]
  if (vals.includes('not-applicable')) return 'not-applicable'
  const empty = vals.length === 0 || vals.every((v) => v === 'unknown' || v === 'none-found')
  if (empty && /blocked|refused automated|could not be read/i.test(fact.note ?? '')) return 'blocked'
  if (empty) return 'not-stated'
  return 'answered'
}
