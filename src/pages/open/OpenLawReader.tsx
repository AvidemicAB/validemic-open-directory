import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Lock, MessageSquareText, Send, Server } from 'lucide-react'
import OpenLayout from './OpenLayout'
import { LAWS, type LawId } from './OpenLaw'
import PdfViewer, { type SelectionAction } from '../../components/PdfViewer'
import NotFound from '../NotFound'
import { useAuth } from '../../auth'
import { docUrl } from '../../data/documents'

const SUGGESTIONS: Record<LawId, string[]> = {
  'ai-act': ['Is a plagiarism checker high-risk?', 'What must a university do as a deployer?', 'When do the education rules apply?'],
  gdpr: ['What must a DPA contain?', 'Can we use a US vendor?', 'When do we need a DPIA?'],
}

/**
 * The official law text beside a chat. The chat runs on Validemic's EU
 * hosting, so in the open directory it explains how to get it instead of
 * answering: a Validemic account through the university, or the open-source
 * code run on your own servers.
 */
export default function OpenLawReader() {
  const { law } = useParams()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const [asked, setAsked] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const meta = law === 'ai-act' || law === 'gdpr' ? LAWS[law] : undefined
  useEffect(() => {
    if (meta) document.title = `${meta.name}: official text | Validemic`
  }, [meta])
  useEffect(() => {
    if (asked) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [asked])
  if (!meta) return <NotFound />
  const id = law as LawId

  const ask = (q: string) => {
    if (!q.trim()) return
    setAsked(q.trim())
    setDraft('')
  }
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    ask(draft)
  }
  const onSelection = (a: SelectionAction) => {
    if (a.kind === 'copy') return
    ask(a.kind === 'explain' ? `Explain: “${a.text.slice(0, 140)}${a.text.length > 140 ? '…' : ''}”` : `Translate: “${a.text.slice(0, 140)}${a.text.length > 140 ? '…' : ''}”`)
  }

  return (
    <OpenLayout>
      <div className="mx-auto max-w-[1600px] px-4 pt-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link to={`/open/law/${id}`} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
            <ArrowLeft className="h-4 w-4" /> {meta.name} explained
          </Link>
          <p className="text-xs text-ink-500">
            {meta.citation} · official text ·{' '}
            <a href={meta.eurLex} target="_blank" rel="noopener" className="inline-flex items-center gap-0.5 hover:text-ink-800 hover:underline">
              EUR-Lex <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
        <div className="mt-3 grid gap-4 pb-6 lg:h-[calc(100vh-7.5rem)] lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="h-[70vh] overflow-hidden rounded-xl border border-ink-200 bg-ink-50 lg:h-full">
            <PdfViewer url={docUrl(meta.docId)} initialPage={Number(params.get('page')) || undefined} onSelectionAction={onSelection} />
          </div>

          <aside className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-ink-200 bg-surface lg:h-full">
            <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-3">
              <MessageSquareText className="h-4 w-4 text-ink-500" />
              <p className="text-sm font-semibold text-ink-900">Ask about the {meta.name}</p>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {!asked ? (
                <>
                  <p className="text-sm text-ink-600">Ask a question about the text, or select a passage in the PDF and choose Explain. Answers cite the article and page.</p>
                  <div className="flex flex-col items-start gap-1.5">
                    {SUGGESTIONS[id].map((s) => (
                      <button key={s} onClick={() => ask(s)} className="rounded-full border border-ink-200 px-3 py-1 text-left text-sm text-ink-700 hover:border-ink-400">
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-ink-900 px-3 py-2 text-sm text-white">{asked}</div>
                  <AccessCard docId={meta.docId} signedIn={Boolean(user)} />
                  <div ref={endRef} />
                </>
              )}
            </div>
            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-ink-100 p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Ask about the ${meta.name}…`}
                className="min-w-0 flex-1 rounded-full border border-ink-200 bg-surface px-3.5 py-2 text-sm outline-none focus:border-ink-400"
              />
              <button type="submit" aria-label="Send" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-900 text-white hover:bg-ink-700">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </aside>
        </div>
      </div>
    </OpenLayout>
  )
}

/** What the chat answers in the open directory: the two ways to get it. */
function AccessCard({ docId, signedIn }: { docId: string; signedIn: boolean }) {
  return (
    <div className="space-y-3 rounded-2xl rounded-bl-sm border border-ink-200 bg-ink-50 p-3.5 text-sm text-ink-700">
      <p className="flex items-center gap-1.5 font-semibold text-ink-900">
        <Lock className="h-4 w-4" /> Chat needs a Validemic account
      </p>
      {signedIn ? (
        <>
          <p>You are signed in. Ask your question in your workspace, where the chat runs on EU servers.</p>
          <Link to={`/app/docs/${docId}`} className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-ink-700">
            Open in my workspace
          </Link>
        </>
      ) : (
        <>
          <div className="rounded-xl border border-brand-200 bg-surface p-3">
            <p className="flex items-center gap-1.5 font-medium text-ink-900">
              <Server className="h-4 w-4 text-brand-700" /> Easiest: use Validemic
            </p>
            <p className="mt-1 text-ink-600">
              EU servers and EU-hosted AI models, set up and kept up to date for you. Ask your university whether it has Validemic, or contact us about a subscription.
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Link to="/contact?topic=quote" className="inline-flex items-center rounded-full bg-ink-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-ink-700">
                Get access
              </Link>
              <Link to="/pricing" className="text-sm text-ink-600 underline-offset-2 hover:underline">
                See plans
              </Link>
              <Link to="/login" className="text-sm text-ink-600 underline-offset-2 hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
