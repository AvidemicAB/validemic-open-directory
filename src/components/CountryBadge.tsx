// One SVG per country, emitted as separate files and loaded only when shown
// (flag emoji render as plain letters on Windows).
const FLAG_URLS = import.meta.glob('../../node_modules/flag-icons/flags/4x3/*.svg', {
  query: '?no-inline',
  import: 'default',
  eager: true,
}) as Record<string, string>
/** ISO 3166-1 alpha-2 codes that have a flag (regional and EU/UN flags left out). */
export const COUNTRY_CODES = Object.keys(FLAG_URLS)
  .map((k) => k.match(/\/([a-z]{2})\.svg$/)?.[1])
  .filter((c): c is string => !!c && c !== 'eu' && c !== 'un')
  .map((c) => c.toUpperCase())
const flagUrl = (code: string) => FLAG_URLS[`../../node_modules/flag-icons/flags/4x3/${code.toLowerCase()}.svg`]

export function Flag({ code, className = 'h-3.5 w-[1.15rem]' }: { code: string; className?: string }) {
  const src = flagUrl(code)
  if (!src) return null
  return <img src={src} alt="" aria-hidden="true" className={`${className} shrink-0 rounded-[2px] object-cover ring-1 ring-ink-200`} />
}
