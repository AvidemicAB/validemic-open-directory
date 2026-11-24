/** Country display name via Intl. */
export function countryName(code: string, lang = 'en'): string {
  try {
    return new Intl.DisplayNames([lang], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}
