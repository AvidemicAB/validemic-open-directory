/**
 * Countries whose companies get a warning next to their flag: legal
 * sanctions regimes for everyone, and ethical concerns unless a workspace
 * turned them off (Settings). Review this list every quarter against the
 * sources; the tooltip text lives in t.app.countries.
 */
export type SanctionsRegime = 'EU' | 'UK' | 'US' | 'UN'

export interface CountryRisk {
  level: 'sanctions' | 'concern'
  /** Which sanctions regimes apply (sanctions level only). */
  regimes?: SanctionsRegime[]
  sources: { label: string; url: string }[]
}

/** When the list below was last checked against its sources. */
export const COUNTRY_RISK_REVIEWED = '2026-10-23'

const EU_MAP = { label: 'EU Sanctions Map', url: 'https://www.sanctionsmap.eu/' }
const OFAC = { label: 'US Treasury (OFAC)', url: 'https://ofac.treasury.gov/sanctions-programs-and-country-information' }
const UK = { label: 'UK sanctions list', url: 'https://www.gov.uk/government/collections/uk-sanctions-regimes-under-the-sanctions-act' }
const UN = { label: 'UN Security Council sanctions', url: 'https://main.un.org/securitycouncil/en/sanctions/information' }

export const COUNTRY_RISK: Record<string, CountryRisk> = {
  RU: { level: 'sanctions', regimes: ['EU', 'UK', 'US'], sources: [EU_MAP, UK, OFAC] },
  BY: { level: 'sanctions', regimes: ['EU', 'UK', 'US'], sources: [EU_MAP, UK, OFAC] },
  IR: { level: 'sanctions', regimes: ['EU', 'UK', 'US', 'UN'], sources: [EU_MAP, UK, OFAC, UN] },
  KP: { level: 'sanctions', regimes: ['EU', 'UK', 'US', 'UN'], sources: [EU_MAP, UK, OFAC, UN] },
  CU: { level: 'sanctions', regimes: ['US'], sources: [OFAC] },
  IL: {
    level: 'concern',
    sources: [
      { label: 'ICJ: South Africa v. Israel', url: 'https://www.icj-cij.org/case/192' },
      { label: 'ICC: Situation in the State of Palestine', url: 'https://www.icc-cpi.int/palestine' },
    ],
  },
}

/** EU member states. EEA members outside the EU get their own badge. */
const EU = new Set(['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'])
const EEA_ONLY = new Set(['IS', 'LI', 'NO'])

export const euStatus = (code?: string): 'eu' | 'eea' | null => {
  const c = code?.toUpperCase()
  return !c ? null : EU.has(c) ? 'eu' : EEA_ONLY.has(c) ? 'eea' : null
}

/** The warning to show for a country, honouring the workspace setting. */
export function countryRisk(code: string | undefined, ethicalFlags: boolean): CountryRisk | null {
  const r = code ? COUNTRY_RISK[code.toUpperCase()] : undefined
  if (!r) return null
  return r.level === 'concern' && !ethicalFlags ? null : r
}
