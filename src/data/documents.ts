import docContents from './docContents.json'

const registry = docContents as Record<string, { file: string }>

/** URL (relative to the site base) for a registered PDF. */
export function docUrl(id: string): string {
  return `${import.meta.env.BASE_URL}${registry[id]?.file ?? ''}`
}
