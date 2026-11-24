/**
 * EU AI Act classification per checked tool.
 *
 * Almost no vendor states which AI Act risk class its product falls in, so
 * most entries are a Validemic assessment: our reading of the tool's typical
 * use at a university against Regulation (EU) 2024/1689, as amended by
 * Regulation (EU) 2026/1744. The legal class depends on the intended purpose
 * and on how the university uses the tool, so an assessment is a starting
 * point for the deployer's own check, never a ruling. Where the vendor does
 * say something, `vendor` quotes it (the quote is in that tool's research
 * cache, like every other fact).
 */

/** When the assessments below were last reviewed. */
export const AI_ACT_ASSESSED = '2026-11-17'

export type AiActTier = 'prohibited' | 'high-risk-if' | 'transparency' | 'gpai-model' | 'minimal' | 'no-ai' | 'unclear'

/**
 * The European Commission's four risk levels (minimal, limited, high,
 * unacceptable), which summarise the Act: 1 lowest, 4 highest. 0 = off the
 * scale (general-purpose models have their own rules; no AI, not assessed).
 */
export const AI_ACT_TIERS: Record<AiActTier, { label: string; short: string; level: 0 | 1 | 2 | 3 | 4; tone: 'bad' | 'warn' | 'neutral' | 'good'; meaning: string; basis: string }> = {
  prohibited: {
    label: 'Unacceptable risk',
    short: 'Unacceptable risk',
    level: 4,
    tone: 'bad',
    basis: 'Art. 5',
    meaning: 'Banned practices, such as inferring the emotions of students or staff. Not allowed in the EU since 2 February 2025. None of the tools we checked is built for one; we flag features that could cross the line.',
  },
  'high-risk-if': {
    label: 'High risk, depending on use',
    short: 'High risk if used to grade',
    level: 3,
    tone: 'warn',
    basis: 'Art. 6, Annex III',
    meaning:
      'Used to evaluate learning outcomes, decide admission or placement, or detect cheating in tests, the system falls under Annex III point 3 and the high-risk rules apply (from 2 December 2027). Used only as a narrow aid with a person deciding, Article 6(3) can take it out of high-risk.',
  },
  transparency: {
    label: 'Limited risk',
    short: 'Limited risk',
    level: 2,
    tone: 'good',
    basis: 'Art. 50',
    meaning:
      'Chatbots and generative AI. The only duties are transparency: people must be told they are dealing with AI, and generated content must be marked as AI-made (Article 50). It becomes high risk only if the university uses it for an Annex III purpose such as grading.',
  },
  'gpai-model': {
    label: 'General-purpose AI model',
    short: 'General-purpose model',
    level: 0,
    tone: 'neutral',
    basis: 'Chapter V',
    meaning:
      'Access to a general-purpose AI model (Chapter V, Articles 53 and 55): the duties fall on the model provider. A university that builds its own chatbot or tool on it becomes the provider of that AI system (Article 3(3)) and takes on its duties, such as Article 50.',
  },
  minimal: {
    label: 'Minimal risk',
    short: 'Minimal risk',
    level: 1,
    tone: 'good',
    basis: 'Art. 4 only',
    meaning: 'Uses AI, but not for an Annex III purpose and not in a way that triggers Article 50. No specific AI Act duties beyond AI literacy measures (Article 4).',
  },
  'no-ai': {
    label: 'No AI features',
    short: 'No AI features',
    level: 0,
    tone: 'neutral',
    basis: 'Outside the Act',
    meaning: 'We found no AI features in the vendor’s pages, so the AI Act does not apply to the tool as described.',
  },
  unclear: {
    label: 'Not assessed',
    short: 'Not assessed',
    level: 0,
    tone: 'neutral',
    basis: '',
    meaning: 'We could not read enough of the vendor’s pages to assess the tool.',
  },
}

/** Pages of the official 2024 Official Journal PDF (docs/ref-aiact.pdf). */
export const AI_ACT_PAGES = {
  'Art. 3': 46,
  'Art. 4': 51,
  'Art. 5': 51,
  'Art. 6': 53,
  'Art. 26': 67,
  'Art. 27': 69,
  'Art. 50': 82,
  'Art. 51': 83,
  'Art. 53': 84,
  'Art. 55': 86,
  'Art. 113': 123,
  'Annex III': 127,
} as const
export type AiActRef = keyof typeof AI_ACT_PAGES

/** Pages of the official GDPR PDF (docs/ref-gdpr.pdf). */
export const GDPR_PAGES = {
  'Art. 4': 33,
  'Art. 5': 35,
  'Art. 6': 36,
  'Art. 9': 38,
  'Art. 13': 40,
  'Art. 24': 47,
  'Art. 26': 48,
  'Art. 27': 48,
  'Art. 28': 49,
  'Art. 32': 51,
  'Art. 33': 52,
  'Art. 35': 53,
  'Art. 44': 60,
  'Art. 46': 62,
  'Art. 83': 82,
} as const
export type GdprRef = keyof typeof GDPR_PAGES

export interface AiActAssessment {
  tier: AiActTier
  /** One or two sentences: why this class, for this tool's typical university use. */
  why: string
  refs: AiActRef[]
  /** Also a provider of general-purpose AI models (Chapter V). */
  gpaiProvider?: string
  /** What the vendor itself says about the AI Act, quoted from its pages. */
  vendor?: { says: string; quote: string; url: string; claim: string }
}

const MS_TRUST = 'https://www.microsoft.com/en-us/trust-center/compliance/eu-ai-act'
const MS_VENDOR = {
  claim: 'Transparency duties (Art. 50)',
  says: 'Microsoft describes itself as an AI system provider under the AI Act and says it is implementing the Article 50 disclosures for generative AI. It does not name a risk class for this product.',
  quote: 'As an AI system provider, Microsoft is implementing required generative AI disclosures',
  url: MS_TRUST,
}
const GOOGLE_CODE = {
  claim: 'No class stated',
  says: 'Google says it is signing the EU General-Purpose AI Code of Practice, which covers its models. It does not name a risk class for this product.',
  quote: "Google is signing the European Union's General Purpose AI Code of Practice",
}

const GRADING = 'If it is used to grade or assess students, that use is Annex III point 3 and high-risk.'

export const AI_ACT: Record<string, AiActAssessment> = {
  'adobe-cc': { tier: 'transparency', why: 'Firefly and other generative features create images, video and text, which must be marked as AI-generated (Art. 50(2)). Design work is not an Annex III use.', refs: ['Art. 50'] },
  autotekst: { tier: 'minimal', why: 'Speech-to-text with Whisper turns recordings into text without creating new content, and transcription is not an Annex III use.', refs: ['Art. 50'] },
  avidnote: { tier: 'transparency', why: `An AI assistant for chatting with papers and writing: users must know they interact with AI and generated text is AI output (Art. 50). Research support is not an Annex III use. ${GRADING}`, refs: ['Art. 50', 'Annex III'] },
  'azure-openai': {
    tier: 'gpai-model',
    why: 'Microsoft offers OpenAI’s general-purpose models as a cloud service. OpenAI carries the model-provider duties; Microsoft and anyone building on the service carry the duties of the AI system they build.',
    refs: ['Art. 3', 'Art. 53', 'Art. 55', 'Art. 50'],
  },
  canvas: { tier: 'transparency', why: `An LMS with optional generative AI features (summaries, translation, drafting), which carry Article 50 duties. ${GRADING} That includes AI-assisted grading features.`, refs: ['Art. 50', 'Annex III'] },
  'chatgpt-edu': { tier: 'transparency', why: `A general-purpose chatbot: users must know they interact with AI (Art. 50). ${GRADING}`, refs: ['Art. 50', 'Annex III'], gpaiProvider: 'OpenAI' },
  chatgpt: { tier: 'transparency', why: `A general-purpose chatbot: users must know they interact with AI (Art. 50). ${GRADING}`, refs: ['Art. 50', 'Annex III'], gpaiProvider: 'OpenAI' },
  claude: { tier: 'transparency', why: `A general-purpose chatbot: users must know they interact with AI (Art. 50). ${GRADING}`, refs: ['Art. 50', 'Annex III'], gpaiProvider: 'Anthropic' },
  copilot: { tier: 'transparency', why: `A general-purpose AI assistant: users must know they interact with AI and generated content is marked (Art. 50). ${GRADING}`, refs: ['Art. 50', 'Annex III'], vendor: MS_VENDOR },
  covidence: { tier: 'minimal', why: 'Machine-learning help with screening and sorting studies for systematic reviews, with reviewers making the decisions. Not an Annex III use.', refs: ['Art. 6'] },
  deepl: {
    tier: 'transparency',
    why: 'Machine translation and AI writing help generate text (Art. 50(2)); translation is not an Annex III use.',
    refs: ['Art. 6', 'Art. 50'],
    vendor: {
      claim: 'Not high risk',
      says: 'DeepL’s terms say the service is not intended for high-risk use under Article 6, and that the customer must check whether its own use is high-risk.',
      quote: 'The Services are not intended for high-risk use as set out in Article 6 of the EU AI Act',
      url: 'https://www.deepl.com/en/pro-license',
    },
  },
  edusign: { tier: 'no-ai', why: 'An e-signature service. We found no AI features.', refs: [] },
  elicit: { tier: 'transparency', why: 'An AI research assistant that summarises papers and extracts data: generated text is AI output (Art. 50). Research support is not an Annex III use.', refs: ['Art. 50'] },
  endnote: { tier: 'transparency', why: 'A reference manager with optional AI features that summarise and answer questions about papers (Art. 50). Not an Annex III use.', refs: ['Art. 50'] },
  gemini: { tier: 'transparency', why: `A general-purpose chatbot: users must know they interact with AI (Art. 50). ${GRADING}`, refs: ['Art. 50', 'Annex III'], gpaiProvider: 'Google', vendor: { ...GOOGLE_CODE, url: 'https://support.google.com/a/answer/15706919' } },
  grammarly: { tier: 'transparency', why: 'Generates and rewrites text (Art. 50). Its AI-text and plagiarism checks become an Annex III point 3 use if a university relies on them to detect cheating.', refs: ['Art. 50', 'Annex III'] },
  'github-copilot': { tier: 'transparency', why: 'An AI coding assistant that chats and generates code and text (Art. 50). Writing software is not an Annex III use.', refs: ['Art. 50'] },
  consensus: { tier: 'transparency', why: `An AI search engine that answers questions from research papers with generated text (Art. 50). Research support is not an Annex III use. ${GRADING}`, refs: ['Art. 50', 'Annex III'] },
  'inspera-assessment': { tier: 'high-risk-if', why: 'An exam platform. If it is used with AI-based marking or proctoring that flags cheating, those uses are Annex III point 3(b) and 3(d). Without AI features, it falls outside the AI Act.', refs: ['Art. 6', 'Annex III', 'Art. 5'] },
  'inspera-originality': { tier: 'high-risk-if', why: 'Similarity and AI-content detection used in academic-misconduct cases is close to Annex III point 3(d), detecting prohibited behaviour in tests. Article 6(3) can exempt it only when the check is a narrow aid and a person decides.', refs: ['Art. 6', 'Annex III'] },
  kaltura: { tier: 'transparency', why: 'Video platform with optional generative AI: captions, summaries, quizzes and AI avatars (Art. 50, including marking AI-generated video). Not an Annex III use, unless AI quizzes are used to grade students.', refs: ['Art. 50', 'Annex III'] },
  kahubi: { tier: 'transparency', why: `An AI workspace for research: chat, writing and analysis with AI (Art. 50). Research support is not an Annex III use. ${GRADING}`, refs: ['Art. 50', 'Annex III'] },
  keenious: { tier: 'minimal', why: 'Recommends papers from your text, with an optional AI chat. Search and recommendation is not an Annex III use; the chat carries Article 50 duties.', refs: ['Art. 50'] },
  mendeley: { tier: 'no-ai', why: 'A reference manager. We found no AI features in the pages we read.', refs: [] },
  mentimeter: { tier: 'transparency', why: 'Optional AI that drafts slides and questions generates content (Art. 50). Live polls are not an Annex III use, unless quizzes are used to grade students.', refs: ['Art. 50', 'Annex III'] },
  'microsoft-365': { tier: 'transparency', why: `Office apps with Copilot, which generates text and other content (Art. 50). ${GRADING}`, refs: ['Art. 50', 'Annex III'], vendor: MS_VENDOR },
  moodle: { tier: 'transparency', why: `An LMS whose optional AI subsystem generates text and images (Art. 50). ${GRADING}`, refs: ['Art. 50', 'Annex III'] },
  'ms-forms': { tier: 'transparency', why: 'Copilot can draft forms and quizzes (Art. 50). Auto-scored quizzes used to grade students are an Annex III point 3(b) use to check.', refs: ['Art. 50', 'Annex III'], vendor: MS_VENDOR },
  nettskjema: { tier: 'minimal', why: 'A survey tool with an optional transcription feature through Azure OpenAI. Neither use is in Annex III.', refs: [] },
  notebooklm: { tier: 'transparency', why: 'An AI assistant that answers questions about your sources and generates summaries and audio overviews (Art. 50). Not an Annex III use.', refs: ['Art. 50'], gpaiProvider: 'Google', vendor: { ...GOOGLE_CODE, url: 'https://knowledge.workspace.google.com/admin/generative-ai/generative-ai-in-google-workspace-privacy-hub' } },
  nvivo: { tier: 'transparency', why: 'Optional AI summaries and coding suggestions generate text (Art. 50). Qualitative research is not an Annex III use.', refs: ['Art. 50'] },
  onedrive: { tier: 'transparency', why: 'File storage; Copilot features generate summaries and answers (Art. 50). Not an Annex III use.', refs: ['Art. 50'], vendor: MS_VENDOR },
  'openai-api': {
    tier: 'gpai-model',
    why: 'Access to OpenAI’s general-purpose models for developers. OpenAI carries the model-provider duties; a university that builds a chatbot or tool on the API becomes the provider of that AI system.',
    refs: ['Art. 3', 'Art. 53', 'Art. 55', 'Art. 50'],
    gpaiProvider: 'OpenAI',
  },
  'otter-ai': { tier: 'transparency', why: 'Transcribes meetings and generates summaries and chat answers (Art. 50). Not an Annex III use.', refs: ['Art. 50'] },
  ouriginal: { tier: 'high-risk-if', why: 'A plagiarism checker (discontinued on 2026-06-30). Used to detect cheating in assessed work, it is close to Annex III point 3(d); Article 6(3) can exempt it when it only supports a person’s decision.', refs: ['Art. 6', 'Annex III'] },
  overleaf: { tier: 'transparency', why: 'Optional AI writing tools generate and rewrite text (Art. 50). Writing support is not an Annex III use.', refs: ['Art. 50'] },
  panopto: { tier: 'minimal', why: 'Video hosting with automatic captions, search and optional AI summaries. Not an Annex III use; generated summaries carry Article 50 duties.', refs: ['Art. 50'] },
  papers: { tier: 'transparency', why: 'A reference manager with optional AI summaries and chat over papers (Art. 50). Not an Annex III use.', refs: ['Art. 50'] },
  perplexity: { tier: 'transparency', why: `An AI answer engine: users must know they interact with AI (Art. 50). ${GRADING}`, refs: ['Art. 50', 'Annex III'] },
  qualtrics: { tier: 'transparency', why: 'Surveys with AI text analysis and generated content (Art. 50). Surveys are not an Annex III use, but staff surveys analysed by AI for decisions about workers are in Annex III point 4.', refs: ['Art. 50', 'Annex III'] },
  redcap: { tier: 'no-ai', why: 'Survey and database software. We found no AI features.', refs: [] },
  refworks: { tier: 'unclear', why: 'Legacy RefWorks closed in 2023; the address now shows EndNote Fusion. See EndNote.', refs: [] },
  'research-rabbit': { tier: 'minimal', why: 'Maps and recommends papers through citation networks without generative AI. Not an Annex III use.', refs: [] },
  scispace: { tier: 'unclear', why: 'The vendor’s pages could not be read, so we could not assess the tool.', refs: [] },
  scite: { tier: 'transparency', why: 'Classifies citations and has an AI assistant that generates answers (Art. 50). Research support is not an Annex III use.', refs: ['Art. 50'] },
  spss: { tier: 'minimal', why: 'Statistics software; optional AI help explains output. Not an Annex III use.', refs: [] },
  stata: { tier: 'no-ai', why: 'Statistics software. We found no AI features.', refs: [] },
  'sunet-scribe': { tier: 'minimal', why: 'Speech-to-text on self-hosted open models turns recordings into text without creating new content. Not an Annex III use.', refs: [] },
  'survey-report': { tier: 'no-ai', why: 'Survey and reporting software. We found no AI features.', refs: [] },
  teams: { tier: 'transparency', why: 'Meetings with Copilot recaps and AI notes, which generate content (Art. 50). Not an Annex III use; inferring emotions of staff or students would be banned (Art. 5(1)(f)).', refs: ['Art. 50', 'Art. 5'], vendor: MS_VENDOR },
  timeedit: { tier: 'minimal', why: 'Timetabling and exam scheduling. Scheduling is not an Annex III use.', refs: [] },
  tortalk: { tier: 'minimal', why: 'Text-to-speech that reads existing text aloud, as an assistive tool. Not an Annex III use.', refs: [] },
  turnitin: { tier: 'high-risk-if', why: 'AI-writing detection and similarity checks used in misconduct cases, and AI-assisted grading, are Annex III point 3 uses (3(b) evaluating learning outcomes, 3(d) detecting prohibited behaviour). Article 6(3) can exempt a check that only supports a person’s decision.', refs: ['Art. 6', 'Annex III'] },
  webropol: { tier: 'minimal', why: 'Surveys with optional AI text analysis and translation. Not an Annex III use, unless used to evaluate staff (Annex III point 4).', refs: ['Annex III'] },
  wiseflow: {
    tier: 'high-risk-if',
    why: 'An exam platform with an optional AI module that drafts feedback on students’ work. Evaluating learning outcomes is Annex III point 3(b); with the educator deciding, Article 6(3) may take it out of high-risk. Without the AI module, the platform falls outside the AI Act.',
    refs: ['Art. 6', 'Annex III'],
    vendor: {
      claim: 'High-risk area, human oversight',
      says: 'UNIwise says education is a high-risk area for AI that evaluates learning outcomes, that its AI only drafts feedback for the educator to decide on, and that universities should deploy it with strong governance.',
      quote: 'Universities should therefore deploy with strong governance.',
      url: 'https://help.wiseflow.net/hubfs/Service%20terms/AI%20assisted%20feedback_Legal%20position.pdf',
    },
  },
  whisper: { tier: 'minimal', why: 'A speech-recognition model that turns recordings into text. Run locally or through OpenAI, transcription is not an Annex III use.', refs: [] },
  zoom: { tier: 'transparency', why: 'Meetings with AI Companion summaries and chat (Art. 50). Not an Annex III use; inferring emotions of participants in education would be banned (Art. 5(1)(f)).', refs: ['Art. 50', 'Art. 5'] },
  zotero: { tier: 'no-ai', why: 'A reference manager. We found no AI features in Zotero itself.', refs: [] },
}

export function aiActFor(id: string | undefined): AiActAssessment | undefined {
  return id ? AI_ACT[id] : undefined
}

/** In-directory reader link to a page of the official text. */
export const lawPage = (law: 'ai-act' | 'gdpr', page: number) => `/open/law/${law}/read?page=${page}`
