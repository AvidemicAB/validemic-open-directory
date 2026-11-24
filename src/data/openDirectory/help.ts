/**
 * Plain-language explanations shown in tooltips on tool pages: what each
 * question means and why it matters to a university. `question` in
 * factors.ts is written for the research agents; this is written for readers.
 */
export const FACTOR_HELP: Record<string, string> = {
  // Vendor
  vendor_entity: 'The company you would sign the contract with. It decides which courts and laws apply.',
  vendor_country: 'Where the company is based. A vendor outside the EU/EEA can be subject to foreign authorities, even if your data is stored in Europe.',
  parent_company: 'Who ultimately owns the vendor. Owners can change policies after an acquisition.',
  parent_country: 'Where the owner is based. A European subsidiary of a US company is still subject to US laws such as the CLOUD Act, so the EU flag is shown only when the owner is in the EU too.',
  eu_representative: 'A non-EU vendor offering services in the EU must name a representative in the EU (GDPR Art. 27). Vendors based in the EU don\'t need one.',
  dpo_contact: 'Whether the vendor names a data protection officer or privacy contact you can reach.',
  // Data
  hosting_regions: 'The countries where your content is stored by default. EU/EEA countries share the EU flag.',
  local_first: 'The tool can be used with your files kept on your own device. If so, a missing DPA or SSO matters less and shows amber, not red.',
  eu_residency: 'Whether your content can stay inside the EU/EEA: always, as an option, or only on enterprise contracts.',
  cloud_providers: 'The hosting companies the service runs on, such as AWS, Azure or Google Cloud.',
  transfer_mechanism: 'The legal basis for sending personal data outside the EU/EEA, such as the EU-US Data Privacy Framework or Standard Contractual Clauses.',
  subprocessors_public: 'Whether the vendor publishes the other companies that handle your data for it. GDPR requires you to know who they are.',
  subprocessors_count: 'How many sub-processors the vendor lists.',
  subprocessors_non_eea: 'How many of the listed sub-processors handle data outside the EU/EEA.',
  subprocessor_notice: 'Whether customers are told before a new sub-processor is added, or the page is just updated.',
  // Contract
  dpa: 'A Data Processing Agreement is the contract GDPR requires when a vendor handles personal data for you. Without one, a university usually can\'t use the tool with personal data.',
  role: 'Whether the vendor acts as processor (handles data only on your instructions) or controller (decides how to use it).',
  privacy_policy_date: 'When the privacy policy was last updated.',
  retention_stated: 'Whether the vendor says how long it keeps your data.',
  deletion_on_exit: 'Whether your data is deleted when you close the account or end the contract.',
  data_export: 'Whether you can take your data out in a usable format.',
  breach_notice: 'How quickly the vendor promises to tell you about a data breach. GDPR gives you 72 hours to report one.',
  governing_law: 'Which country\'s law governs the contract.',
  // AI
  ai_features: 'Whether the tool uses generative AI (large language models).',
  ai_providers: 'Which AI companies process your content, such as OpenAI, Anthropic or Google.',
  trains_on_content: 'Whether your documents and prompts may be used to train AI models. Green means the vendor says it doesn\'t.',
  ai_zero_retention: 'Whether the AI provider deletes your prompts right away instead of storing them.',
  ai_admin_off: 'Whether an administrator can switch the AI features off for everyone.',
  ai_act_statement: 'Whether the vendor says how it meets the EU AI Act.',
  // Security
  certifications: 'Independent security certifications, such as ISO 27001 or SOC 2.',
  trust_page: 'A public page collecting the vendor\'s security and privacy documents.',
  encryption: 'Whether data is encrypted when sent (in transit) and when stored (at rest).',
  pentest: 'Whether outside experts test the service for security holes.',
  vuln_disclosure: 'Whether there is a way to report security problems to the vendor.',
  incidents: 'Security incidents in the last five years, from primary sources only: a regulator, a court or the vendor itself.',
  status_page: 'A public page showing outages and uptime.',
  // Access
  sso: 'Single sign-on: staff and students log in with their university account. Without it, accounts can\'t be managed or closed centrally.',
  federation: 'Whether the tool supports academic login federations such as eduGAIN, SWAMID or InCommon.',
  scim: 'Accounts are created and removed automatically from the university\'s user directory.',
  mfa: 'Two-step login for extra security.',
  admin_console: 'A central place for the institution to manage users and settings.',
  audit_logs: 'A record of who did what, for investigations.',
  lms_integration: 'Works inside Canvas, Moodle or another learning platform.',
  // Accessibility
  vpat: 'A VPAT or Accessibility Conformance Report documents how the tool meets accessibility standards. Many universities require one before buying.',
  wcag_level: 'The accessibility level the vendor claims (WCAG 2.1 AA is the usual requirement).',
  accessibility_statement: 'A public statement on accessibility, required for public bodies in the EU.',
  // Frameworks
  hecvat: 'The Higher Education Community Vendor Assessment Toolkit, a standard security questionnaire used by many universities.',
  ferpa: 'US law protecting student education records.',
  hipaa_baa: 'Whether the vendor signs a Business Associate Agreement for US health data.',
  section_508: 'US federal accessibility rules.',
  state_privacy: 'US state laws on student data, such as California\'s SOPIPA.',
  uk_gdpr: 'The UK equivalent of EU transfer clauses, needed when UK personal data leaves the UK.',
  au_privacy: 'Australian privacy law, and the government security assessment IRAP.',
  nis2: 'Whether the vendor addresses the EU NIS2 cybersecurity directive.',
  // Pricing
  free_plan: 'Whether there is a free plan.',
  price_individual: 'The published price for one person.',
  institutional_licence: 'Whether a university-wide licence is offered.',
  edu_discount: 'Whether students or academics get a discount.',
  pricing_public: 'Whether prices are published or you have to ask.',
  // Capabilities
  primary_capability: 'What the tool is mainly used for. Alternatives are matched on these uses.',
  platforms: 'Where the tool runs: web, desktop, mobile.',
  languages: 'Languages the interface is available in.',
  api: 'Whether there is a public API for connecting other systems.',
  // Openness
  open_source: 'Whether the source code is public, so anyone can inspect it.',
  self_host: 'Whether the university can run the tool on its own servers.',
}

/** Short descriptions of each group for the contents list. */
export const GROUP_HELP: Record<string, string> = {
  data: 'Where your content is stored and who handles it.',
  ai: 'Whether AI is used and what happens to your content.',
  contract: 'The DPA and what the contract promises.',
  access: 'How people log in and are managed.',
  security: 'Certifications, testing and incidents.',
  accessibility: 'Accessibility reports and standards.',
  vendor: 'The company behind the tool.',
  pricing: 'Free plans, prices and licences.',
  capabilities: 'What the tool does.',
  openness: 'Open source and self-hosting.',
  frameworks: 'US, UK, Australian and EU frameworks.',
}
