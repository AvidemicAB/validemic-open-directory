
## Vendor
- vendor_entity (text): The company that provides the service and signs the contract (legal name as in the terms or privacy policy).
- vendor_country (countries): Country of the contracting entity / headquarters.
- parent_company (text): Ultimate parent or owner if different (e.g. acquired by Elsevier, Clarivate, Microsoft).
- parent_country (countries): Country where the ultimate parent company is headquartered, when the contracting company is owned by another company (e.g. an Irish subsidiary of a US company: US). not-applicable when there is no separate parent (parent_company none-found). Laws that reach the parent, such as the US CLOUD Act, can reach the subsidiary.
- eu_representative (enum): For non-EU vendors: is a GDPR Art. 27 EU representative named? "not-needed" if the vendor is established in the EU/EEA. Options: named | not-needed | none-found.
- dpo_contact (enum): Is a DPO or privacy contact published? Options: named | contact-only | none-found.

## Where your data goes
- hosting_regions (countries): Countries/regions where customer content is stored by default. Use EU for unspecified EU/EEA.
- local_first (enum): Can the tool be used with content kept only on the user's device, with nothing sent to the vendor? optional-sync = local by default, cloud sync is optional. Quote the vendor saying so. Options: yes | optional-sync | no.
- eu_residency (enum): Can customer content be kept inside the EU/EEA? default = always; option = selectable; enterprise-only = only on enterprise contracts. Options: default | option | enterprise-only | no | unknown.
- cloud_providers (multi): Which infrastructure providers host the service? Options: aws | azure | gcp | oracle | hetzner | ovh | own | other | unknown.
- transfer_mechanism (multi): For data leaving the EEA: EU-US Data Privacy Framework certification (check dataprivacyframework.gov), Standard Contractual Clauses, BCRs, or adequacy. Options: none-needed | dpf | sccs | bcrs | adequacy | unknown.
- subprocessors_public (enum): Is the list of sub-processors published? Options: public | on-request | none-found.
- subprocessors_count (number): How many sub-processors are listed?
- subprocessors_non_eea (number): How many listed sub-processors process data outside the EU/EEA?
- subprocessor_notice (enum): Are customers notified before new sub-processors are added (email/subscription), or is the page just updated? Options: notified | page-only | unknown.

## Contract and GDPR
- dpa (enum): Is a data processing agreement (GDPR Art. 28) available? public = downloadable; self-serve = accept/sign online. Options: public | self-serve | on-request | enterprise-only | none-found.
- role (enum): Does the vendor act as processor for customer content, or claim controllership (e.g. for analytics or model training)? Options: processor | controller | mixed | unknown.
- privacy_policy_date (text): Last-updated date of the privacy policy (YYYY-MM-DD).
- retention_stated (enum): Does the vendor state how long customer content is kept? Options: yes | no | unknown.
- deletion_on_exit (enum): Is deletion of customer data after termination described (with a time frame)? Options: stated | on-request | unknown.
- data_export (enum): Can users/admins export their content in open formats? Options: full | partial | none | unknown.
- breach_notice (text): Committed breach-notification window (e.g. "without undue delay, max 48h").
- governing_law (countries): Jurisdiction / governing law of the terms.

## AI and your data
- ai_features (enum): Is generative AI the core of the product, an optional feature, or absent? Options: core | optional | none.
- ai_providers (multi): Which model providers process user content? Options: openai | azure-openai | anthropic | google | mistral | meta | own | open-weights-self-hosted | other | unknown.
- trains_on_content (enum): Does the vendor (or its model providers) use customer content to train or improve models? Quote the clause. Options: no | opt-in | opt-out | yes | de-identified | unknown.
- ai_zero_retention (enum): Does the vendor state zero data retention / no logging at the AI model provider? Options: yes | no | unknown.
- ai_admin_off (enum): Can an institution admin disable the AI features? Options: yes | no | unknown.
- ai_act_statement (enum): Does the vendor publish an EU AI Act position or transparency statement? Options: yes | no | unknown.

## Security
- certifications (multi): Security/privacy certifications or audits the vendor claims (verified via trust page or certificate). Options: iso27001 | iso27701 | iso27017 | iso27018 | iso42001 | soc2-type2 | soc2-type1 | cyber-essentials | csa-star | tisax | bsi-c5 | none-found.
- trust_page (enum): Is there a security or trust centre page? Options: yes | no.
- encryption (multi): Encryption in transit / at rest / customer-managed keys / end-to-end. Options: in-transit | at-rest | customer-keys | e2e | unknown.
- pentest (enum): Are independent penetration tests performed and shareable? Options: public-summary | on-request | claimed | unknown.
- vuln_disclosure (enum): Bug bounty or vulnerability disclosure policy (security.txt counts). Options: bug-bounty | policy | none-found.
- incidents (text): Breaches or regulator fines in the last 5 years. Primary sources only: a regulator decision, a court record or the vendor's own notice (not press articles). Lawsuits are written as "alleged, not ruled" with the case name. "none found" if none; "unknown" if you did not search.
- status_page (enum): Public uptime/status page? Options: yes | no.

## Sign-in and administration
- sso (multi): Single sign-on protocols supported. Options: saml | oidc | google | microsoft | none.
- federation (multi): Listed in eduGAIN or a national federation (SWAMID, Haka, Feide, WAYF, InCommon, UK Federation, AAF)? Options: edugain | swamid | haka | feide | wayf | incommon | ukfed | aaf | none-found.
- scim (enum): Automated user provisioning (SCIM)? Options: yes | no | unknown.
- mfa (enum): Multi-factor authentication for local accounts? Options: yes | no | unknown.
- admin_console (enum): Institution admin console with user management and usage reports? Options: yes | no | unknown.
- audit_logs (enum): Admin-visible audit logs? Options: yes | no | unknown.
- lms_integration (multi): LMS integrations (LTI version if stated). Options: lti | canvas | moodle | blackboard | brightspace | itslearning | none.

## Accessibility
- vpat (enum): Accessibility Conformance Report (VPAT) available? Options: public | on-request | none-found.
- wcag_level (enum): WCAG conformance level the vendor claims. Options: 2.2-aa | 2.1-aa | 2.0-aa | partial | none-claimed.
- accessibility_statement (enum): Published accessibility statement (EU Web Accessibility Directive / European Accessibility Act)? Options: yes | no | unknown.

## US, UK and other frameworks
- hecvat (enum): Completed HECVAT (Full / Lite / On-Prem) published or available? Options: full-public | lite-public | on-request | none-found.
- ferpa (enum): FERPA compliance statement or "school official" contract terms? Options: statement | school-official-terms | none-found.
- hipaa_baa (enum): Will the vendor sign a HIPAA Business Associate Agreement? Options: available | not-offered | unknown.
- section_508 (enum): Section 508 conformance claimed? Options: yes | no | unknown.
- state_privacy (multi): Signed Student Data Privacy Consortium agreements, CCPA terms, NY Ed Law 2-d, etc. Options: sdpc-npdpa | ccpa | nysed-2d | none-found.
- uk_gdpr (enum): UK GDPR transfer terms (IDTA or UK addendum to SCCs)? Options: yes | no | unknown.
- au_privacy (multi): Australian Privacy Principles statement, IRAP assessment, Australian hosting? Options: app-statement | irap | au-hosting | none-found.
- nis2 (enum): Does the vendor address NIS2 supply-chain requirements? Options: yes | no | unknown.

## Pricing
- free_plan (enum): Is there a permanent free plan, only a trial, or neither? Options: yes | trial-only | no.
- price_individual (text): Lowest paid individual price as published (currency, per month or year). "not published" if hidden.
- institutional_licence (enum): Site/campus/department licence offered? Options: yes | no | unknown.
- edu_discount (enum): Student or academic discount? Options: yes | no | unknown.
- pricing_public (enum): Are prices published on the website? Options: yes | partial | no.

## What it does
- capabilities (multi): Which of these jobs does the product actually do (from its own product pages)? Only list what is a real feature, not a roadmap item. Options: literature-search | paper-chat | summarize-papers | systematic-review | citation-graph | reference-management | citation-formatting | academic-writing | paraphrasing | translation | grammar | plagiarism-check | ai-detection | survey | interview-transcription | qualitative-coding | statistics | data-visualization | data-management-plan | notes | collaboration-docs | video-meetings | lecture-capture | lms | exam | storage | e-signature | general-ai-chat | coding-assistant.
- primary_capability (enum): The single job the product is mainly bought for. Options: literature-search | paper-chat | systematic-review | reference-management | academic-writing | survey | interview-transcription | qualitative-coding | statistics | video-meetings | lms | exam | storage | general-ai-chat | other.
- platforms (multi): Where it runs. Options: web | windows | macos | linux | ios | android | browser-extension | word-addin.
- languages (text): Interface languages (list, or a count).
- api (enum): Public API with documentation? Options: yes | no | unknown.

## Openness
- open_source (enum): Is the product open source (licence)? Options: yes | partly | no.
- self_host (enum): Can an institution host it on its own infrastructure? Options: yes | no | unknown.
