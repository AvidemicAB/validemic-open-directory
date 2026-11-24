import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import { Logo } from '../../components/ui'
import { CookieBanner, LanguagePicker } from '../../components/MarketingLayout'
import { useAuth } from '../../auth'
import { FLAGS } from '../../lib/featureFlags'

/** Public repo for the directory's code and data (not the paid workspace). */
export const GITHUB_URL = 'https://github.com/AvidemicAB/validemic-open-directory'

const NAV = [
  { to: '/', label: 'Tools', end: true },
  { to: '/open/compare', label: 'Compare' },
  { to: '/open/universities', label: 'Universities' },
  { to: '/open/methodology', label: 'How we check' },
]

/** The paid product, one menu. Its pages share this header once the directory is the homepage. */
const INSTITUTIONS = [
  { to: '/institutions', label: 'Overview' },
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/for/dpo', label: 'For data protection officers' },
  { to: '/for/it', label: 'For IT and security' },
  { to: '/for/procurement', label: 'For procurement' },
  { to: '/for/library', label: 'For libraries' },
  { to: '/trust', label: 'Trust' },
  { to: '/contact?topic=demo', label: 'Book a demo' },
]

/**
 * One header and footer for the whole public site: the open directory first,
 * the paid workspace in a single "For institutions" menu and "Sign in".
 */
export default function OpenLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const link = ({ isActive }: { isActive: boolean }) => `text-sm transition ${isActive ? 'font-medium text-ink-900' : 'text-ink-500 hover:text-ink-900'}`
  const inInstitutions = INSTITUTIONS.some((i) => pathname === i.to.split('?')[0])
  return (
    <div className="min-h-screen bg-surface">
      {FLAGS.openDirectory === 'admin' && (
        <div className="bg-amber-50 px-6 py-1 text-center text-[11px] font-medium text-amber-800">Preview for site admins. Visitors still see the current site.</div>
      )}
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-[20px] w-[20px] text-base" />
            <span className="text-base font-bold text-ink-900">Validemic</span>
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} end={n.end} to={n.to} className={link}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-4 md:flex">
            <a href={GITHUB_URL} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
              <GithubMark /> GitHub
            </a>
            <InstitutionsMenu active={inInstitutions} />
            {user ? (
              <Link to="/app" className="rounded-full border border-ink-200 px-3 py-1 text-sm font-medium text-ink-700 transition hover:border-ink-400">
                Workspace
              </Link>
            ) : (
              <Link to="/login" className="rounded-full border border-ink-200 px-3 py-1 text-sm font-medium text-ink-700 transition hover:border-ink-400">
                Sign in
              </Link>
            )}
          </div>
          <button onClick={() => setOpen((o) => !o)} className="ml-auto rounded-lg p-1.5 text-ink-600 md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav className="flex max-h-[80vh] flex-col gap-0.5 overflow-y-auto border-t border-ink-100 px-4 py-3 md:hidden" onClick={() => setOpen(false)}>
            {NAV.map((n) => (
              <NavLink key={n.to} end={n.end} to={n.to} className={(s) => `rounded-lg px-2 py-2 ${link(s)}`}>
                {n.label}
              </NavLink>
            ))}
            <a href={GITHUB_URL} target="_blank" rel="noopener" className="rounded-lg px-2 py-2 text-sm text-ink-500">
              GitHub
            </a>
            <p className="mt-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">For institutions</p>
            {INSTITUTIONS.map((i) => (
              <Link key={i.to} to={i.to} className="rounded-lg px-2 py-1.5 pl-4 text-sm text-ink-600">
                {i.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-ink-100 pt-2">
              {user ? (
                <>
                  <Link to="/app" className="block rounded-lg px-2 py-2 text-sm font-medium text-ink-800">
                    Workspace
                  </Link>
                  <button onClick={logout} className="rounded-lg px-2 py-2 text-sm text-ink-500">
                    Log out
                  </button>
                </>
              ) : (
                <Link to="/login" className="block rounded-lg px-2 py-2 text-sm font-medium text-ink-800">
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="mt-12 border-t border-ink-100">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-xs text-ink-500 sm:grid-cols-[minmax(0,2fr)_1fr_1fr] sm:px-6">
          <div className="space-y-1.5">
            <p className="font-medium text-ink-700">Free and open. Open data (CC BY-SA 4.0), open source (AGPL-3.0).</p>
            <p>
              Maintained by Avidemic AB, which also makes Avidnote and Kahubi.{' '}
              <Link to="/open/methodology" className="underline hover:text-ink-800">
                Same method for every tool
              </Link>
              .
            </p>
            <a href={`${GITHUB_URL}/issues/new?labels=correction`} target="_blank" rel="noopener" className="inline-block underline hover:text-ink-800">
              Suggest a correction
            </a>
          </div>
          <ul className="space-y-1.5">
            <li className="font-semibold text-ink-700">Directory</li>
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-ink-800">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={GITHUB_URL} target="_blank" rel="noopener" className="hover:text-ink-800">
                GitHub
              </a>
            </li>
          </ul>
          <ul className="space-y-1.5">
            <li className="font-semibold text-ink-700">Validemic for institutions</li>
            {INSTITUTIONS.filter((i) => ['/institutions', '/pricing', '/trust', '/contact?topic=demo'].includes(i.to)).map((i) => (
              <li key={i.to}>
                <Link to={i.to} className="hover:text-ink-800">
                  {i.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/privacy" className="hover:text-ink-800">
                Privacy
              </Link>{' '}
              ·{' '}
              <Link to="/terms" className="hover:text-ink-800">
                Terms
              </Link>
            </li>
          </ul>
        </div>
        <div className="mx-auto flex max-w-7xl items-center justify-between border-t border-ink-100 px-4 py-3 text-[11px] text-ink-400 sm:px-6">
          <span>© {new Date().getFullYear()} Avidemic AB</span>
          <LanguagePicker />
        </div>
      </footer>
      <CookieBanner />
    </div>
  )
}

function InstitutionsMenu({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`inline-flex items-center gap-1 text-sm ${active ? 'font-medium text-ink-900' : 'text-ink-500 hover:text-ink-900'}`}>
        For institutions <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-ink-200 bg-surface py-1.5 shadow-lg">
          {INSTITUTIONS.map((i) => (
            <Link key={i.to} to={i.to} onClick={() => setOpen(false)} className="block px-4 py-1.5 text-sm text-ink-600 hover:bg-ink-50 hover:text-ink-900">
              {i.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.67.07-.52.28-.87.51-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}
