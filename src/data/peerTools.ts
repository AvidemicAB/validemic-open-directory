/**
 * Peer software directory data: which tools universities list on their
 * PUBLIC webpages, per country (the directory page shows the visitor's
 * market). Every entry was verified against the linked page on the
 * retrieval date — "listed" means exactly that and nothing more (it is
 * not a claim of endorsement, licensing terms or current usage). Extend only
 * with entries you have actually checked, and keep retrievedAt honest.
 */
import { SE_SWEEP } from './peerToolsSE'
import { NORDIC_SWEEP } from './peerToolsNordics'

export type PeerCategory =
  | 'reference'
  | 'ai'
  | 'survey'
  | 'statistics'
  | 'meetings'
  | 'lms'
  | 'plagiarism'
  | 'exam'
  | 'transcription'
  | 'storage'
  | 'productivity'

export interface PeerListing {
  /** Display name of the university. */
  university: string
  /** ISO 3166-1 alpha-2. */
  country: string
  /** The public page the tool appears on. */
  sourceUrl?: string
  /** When we last saw it there (YYYY-MM-DD). */
  retrievedAt: string
}

export interface PeerTool {
  id: string
  name: string
  website: string
  category: PeerCategory
  /** Demo vendor id when Validemic ships an assessment of this tool. */
  vendorId?: string
  listings: PeerListing[]
}

export const PEER_TOOLS: PeerTool[] = [
  {
    id: 'zotero',
    name: 'Zotero',
    website: 'https://www.zotero.org',
    category: 'reference',
    listings: [
      { university: 'Australian National University', country: 'AU', sourceUrl: 'https://libguides.anu.edu.au/aglc/zotero', retrievedAt: '2026-08-13' },
      { university: 'Curtin University', country: 'AU', sourceUrl: 'https://libguides.library.curtin.edu.au/endnote', retrievedAt: '2026-08-13' },
      { university: 'Deakin University', country: 'AU', sourceUrl: 'https://www.deakin.edu.au/library/research/use-research-tools-and-software/endnote-guide', retrievedAt: '2026-08-13' },
      { university: 'Griffith University', country: 'AU', sourceUrl: 'https://www.griffith.edu.au/library/research-publishing/working-with-literature/referencing-software', retrievedAt: '2026-08-13' },
      { university: 'Macquarie University', country: 'AU', sourceUrl: 'https://libguides.mq.edu.au/referencing-software/zotero', retrievedAt: '2026-08-13' },
      { university: 'Queensland University of Technology', country: 'AU', sourceUrl: 'https://studysmart.library.qut.edu.au/modules/3/2/3/', retrievedAt: '2026-08-13' },
      { university: 'RMIT University', country: 'AU', sourceUrl: 'https://www.rmit.edu.au/library/research/searching-referencing-copyright/reference-management-tools', retrievedAt: '2026-08-13' },
      { university: 'University of Adelaide', country: 'AU', sourceUrl: 'https://libguides.adelaide.edu.au/mendeley', retrievedAt: '2026-08-13' },
      { university: 'University of Queensland', country: 'AU', sourceUrl: 'https://guides.library.uq.edu.au/tools-and-techniques/endnote-referencing-software/other-software', retrievedAt: '2026-08-13' },
      { university: 'University of Sydney', country: 'AU', sourceUrl: 'https://www.library.sydney.edu.au/support/referencing/reference-management-tools', retrievedAt: '2026-08-13' },
      { university: 'University of Technology Sydney', country: 'AU', sourceUrl: 'https://www.lib.uts.edu.au/referencing/other-referencing-resources', retrievedAt: '2026-08-13' },
      { university: 'University of Wollongong', country: 'AU', sourceUrl: 'https://www.uow.edu.au/student/support-services/academic-skills/online-resources/technology-and-software/', retrievedAt: '2026-08-13' },
      { university: 'UNSW Sydney', country: 'AU', sourceUrl: 'https://www.library.unsw.edu.au/research/support-for-your-research/managing-references', retrievedAt: '2026-08-13' },
      { university: 'McMaster University', country: 'CA', sourceUrl: 'https://libguides.mcmaster.ca/cms', retrievedAt: '2026-08-13' },
      { university: 'Queen\'s University', country: 'CA', sourceUrl: 'https://guides.library.queensu.ca/citing-and-citation-managers/zotero', retrievedAt: '2026-08-13' },
      { university: 'Université de Montréal', country: 'CA', sourceUrl: 'https://boite-outils.bib.umontreal.ca/citer', retrievedAt: '2026-08-13' },
      { university: 'University of Alberta', country: 'CA', sourceUrl: 'https://guides.library.ualberta.ca/citing', retrievedAt: '2026-08-13' },
      { university: 'University of British Columbia', country: 'CA', sourceUrl: 'https://guides.library.ubc.ca/citationmanagement', retrievedAt: '2026-08-13' },
      { university: 'University of Calgary', country: 'CA', sourceUrl: 'https://libguides.ucalgary.ca/zotero', retrievedAt: '2026-08-13' },
      { university: 'University of Waterloo', country: 'CA', sourceUrl: 'https://uwaterloo.ca/lib/research-supports/reference-management-software', retrievedAt: '2026-08-13' },
      { university: 'Western University', country: 'CA', sourceUrl: 'https://www.lib.uwo.ca/essayhelp/citationmanagementsoftware.html', retrievedAt: '2026-08-13' },
      { university: 'Aarhus University', country: 'DK', sourceUrl: 'https://library.au.dk/en/researchers/reference-management', retrievedAt: '2026-08-13' },
      { university: 'IT University of Copenhagen', country: 'DK', sourceUrl: 'https://kub.kb.dk/itlibrary', retrievedAt: '2026-08-13' },
      { university: 'Roskilde University', country: 'DK', sourceUrl: 'https://libguides.ruc.dk/AIatRUC', retrievedAt: '2026-08-13' },
      { university: 'University of Copenhagen', country: 'DK', sourceUrl: 'https://kub.kb.dk/systematicreviews/reference-managers', retrievedAt: '2026-08-13' },
      { university: 'University of Southern Denmark', country: 'DK', sourceUrl: 'https://libguides.sdu.dk/literaturesearching-reviews/referencemanagement', retrievedAt: '2026-08-13' },
      { university: 'Universidad Complutense de Madrid', country: 'ES', sourceUrl: 'https://biblioguias.ucm.es/gestoresbibliograficos', retrievedAt: '2026-08-13' },
      { university: 'Universidad de Salamanca', country: 'ES', sourceUrl: 'https://bibliotecas.usal.es/gestores-bibliograficos/', retrievedAt: '2026-08-13' },
      { university: 'Universidad de Sevilla', country: 'ES', sourceUrl: 'https://guiasbus.us.es/gestoresbibliograficos', retrievedAt: '2026-08-13' },
      { university: 'Universitat de Barcelona', country: 'ES', sourceUrl: 'https://crai.ub.edu/en/crai-services/citations-reference/bibliography-tools', retrievedAt: '2026-08-13' },
      { university: 'Universitat Politècnica de Catalunya', country: 'ES', sourceUrl: 'https://guies.bibliotecnica.upc.edu/com-citar/', retrievedAt: '2026-08-13' },
      { university: 'Aalto University', country: 'FI', sourceUrl: 'https://libguides.aalto.fi/c.php?g=410674&p=2797604', retrievedAt: '2026-08-13' },
      { university: 'Åbo Akademi University', country: 'FI', sourceUrl: 'https://www.abo.fi/en/library/courses-and-guidance/', retrievedAt: '2026-08-13' },
      { university: 'LUT University', country: 'FI', sourceUrl: 'https://libguides.lut.fi/LUT/en', retrievedAt: '2026-08-13' },
      { university: 'University of Eastern Finland', country: 'FI', sourceUrl: 'https://www.uef.fi/en/event/zotero-reference-management-software-1', retrievedAt: '2026-08-13' },
      { university: 'University of Helsinki', country: 'FI', sourceUrl: 'https://libraryguides.helsinki.fi/viitteidenhallinta/uh_en', retrievedAt: '2026-08-13' },
      { university: 'University of Jyväskylä', country: 'FI', sourceUrl: 'https://www.jyu.fi/en/for-students/instructions-for-bachelors-and-masters-students/information-seeking-and-research-data-management/library-tutorial/reference-management-software', retrievedAt: '2026-08-13' },
      { university: 'University of Oulu', country: 'FI', sourceUrl: 'https://libguides.oulu.fi/actaguide/bibliographicmanagement', retrievedAt: '2026-08-13' },
      { university: 'University of Turku', country: 'FI', sourceUrl: 'https://utuguides.fi/reference', retrievedAt: '2026-08-13' },
      { university: 'University of Vaasa', country: 'FI', sourceUrl: 'https://uva.libguides.com/reference_management', retrievedAt: '2026-08-13' },
      { university: 'Aix-Marseille Université', country: 'FR', sourceUrl: 'https://bu.univ-amu.libguides.com/zotero', retrievedAt: '2026-08-13' },
      { university: 'Université Claude Bernard Lyon 1', country: 'FR', sourceUrl: 'https://portaildoc.univ-lyon1.fr/se-former/ateliers-de-formation/les-ateliers-zotero', retrievedAt: '2026-08-13' },
      { university: 'Université de Strasbourg', country: 'FR', sourceUrl: 'https://bu.unistra.fr/opac/news/zotero-un-logiciel-pour-collecter-organiser-et-gerer-sa-bibliographie/875', retrievedAt: '2026-08-13' },
      { university: 'Université Grenoble Alpes', country: 'FR', sourceUrl: 'https://bibliotheques.univ-grenoble-alpes.fr/se-former/les-ateliers-de-la-bu/zotero-459444.kjsp', retrievedAt: '2026-08-13' },
      { university: 'Université Paris 1 Panthéon-Sorbonne', country: 'FR', sourceUrl: 'https://cesdoc.pantheonsorbonne.fr/services/se-former', retrievedAt: '2026-08-13' },
      { university: 'Université Paris Cité', country: 'FR', sourceUrl: 'https://u-paris.libguides.com/redigeretciter/logiciels', retrievedAt: '2026-08-13' },
      { university: 'Université Paul-Valéry Montpellier 3', country: 'FR', sourceUrl: 'https://bibliotheques.univ-montp3.fr/boite-a-outils-recherche', retrievedAt: '2026-08-13' },
      { university: 'BI Norwegian Business School', country: 'NO', sourceUrl: 'https://libguides.bi.no/PhD_Candidates/Reference_handling_programs', retrievedAt: '2026-08-13' },
      { university: 'Nord University', country: 'NO', sourceUrl: 'https://www.nord.no/en/library/study-write-and-cite/zotero', retrievedAt: '2026-08-13' },
      { university: 'Norwegian University of Life Sciences', country: 'NO', sourceUrl: 'https://www.nmbu.no/en/library/write-and-cite', retrievedAt: '2026-08-13' },
      { university: 'NTNU Norwegian University of Science and Technology', country: 'NO', sourceUrl: 'https://www.ntnu.edu/ub/subject-page-for-medicine-and-health/endnote-and-zotero', retrievedAt: '2026-08-13' },
      { university: 'OsloMet', country: 'NO', sourceUrl: 'https://www.oslomet.no/en/ul/endnote', retrievedAt: '2026-08-13' },
      { university: 'UiT The Arctic University of Norway', country: 'NO', sourceUrl: 'https://en.uit.no/ub/writeandcite/citation-tools', retrievedAt: '2026-08-13' },
      { university: 'University of Oslo', country: 'NO', sourceUrl: 'https://www.ub.uio.no/english/writing-publishing/referencing/', retrievedAt: '2026-08-13' },
      { university: 'University of Stavanger', country: 'NO', sourceUrl: 'https://www.uis.no/en/library/zotero', retrievedAt: '2026-08-13' },
      { university: 'Chalmers University of Technology', country: 'SE', sourceUrl: 'https://guides.lib.chalmers.se/reference_management_software', retrievedAt: '2026-08-12' },
      { university: 'Karolinska Institutet', country: 'SE', sourceUrl: 'https://kib.ki.se/en/write-cite/reference-management-software', retrievedAt: '2026-08-12' },
      { university: 'KTH Royal Institute of Technology', country: 'SE', sourceUrl: 'https://www.kth.se/en/biblioteket/skriva-referera/referenshanteringsprogram', retrievedAt: '2026-08-12' },
      { university: 'Lund University', country: 'SE', sourceUrl: 'https://www.lub.lu.se/en/find/reference-management-programs', retrievedAt: '2026-08-12' },
      { university: 'Umeå University', country: 'SE', sourceUrl: 'https://www.umu.se/en/library/search-write-study/writing-references/software-for-writing-references/', retrievedAt: '2026-08-12' },
      { university: 'University of Gothenburg', country: 'SE', sourceUrl: 'https://www.ub.gu.se/en/services-and-support/help-with-endnote-and-zotero', retrievedAt: '2026-08-12' },
      { university: 'Brown University', country: 'US', sourceUrl: 'https://libguides.brown.edu/citations', retrievedAt: '2026-08-13' },
      { university: 'Cornell University', country: 'US', sourceUrl: 'https://www.library.cornell.edu/study/citation-management/', retrievedAt: '2026-08-13' },
      { university: 'Dartmouth College', country: 'US', sourceUrl: 'https://researchguides.dartmouth.edu/citingsources/refman', retrievedAt: '2026-08-13' },
      { university: 'Harvard University', country: 'US', sourceUrl: 'https://guides.library.harvard.edu/zotero', retrievedAt: '2026-08-13' },
      { university: 'MIT', country: 'US', sourceUrl: 'https://libguides.mit.edu/cite-write/citetools', retrievedAt: '2026-08-13' },
      { university: 'New York University', country: 'US', sourceUrl: 'https://guides.nyu.edu/citations/tools', retrievedAt: '2026-08-13' },
      { university: 'Stanford University', country: 'US', sourceUrl: 'https://library.stanford.edu/research/bibliography-management/zotero', retrievedAt: '2026-08-13' },
      { university: 'UC Berkeley', country: 'US', sourceUrl: 'https://guides.lib.berkeley.edu/cite-your-sources', retrievedAt: '2026-08-13' },
      { university: 'UCLA', country: 'US', sourceUrl: 'https://guides.library.ucla.edu/citing', retrievedAt: '2026-08-13' },
      { university: 'University of Chicago', country: 'US', sourceUrl: 'https://guides.lib.uchicago.edu/citation_management', retrievedAt: '2026-08-13' },
      { university: 'University of Michigan', country: 'US', sourceUrl: 'https://guides.lib.umich.edu/citationmanagement', retrievedAt: '2026-08-13' },
      { university: 'University of Pennsylvania', country: 'US', sourceUrl: 'https://guides.library.upenn.edu/citationmgmt', retrievedAt: '2026-08-13' },
      { university: 'University of Texas at Austin', country: 'US', sourceUrl: 'https://guides.lib.utexas.edu/citation-managers', retrievedAt: '2026-08-13' },
      { university: 'University of Washington', country: 'US', sourceUrl: 'https://guides.lib.uw.edu/citation-tools', retrievedAt: '2026-08-13' },
      { university: 'Yale University', country: 'US', sourceUrl: 'https://www.library.yale.edu/help-and-research-support/citation-tools', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'endnote',
    name: 'EndNote',
    website: 'https://endnote.com',
    category: 'reference',
    vendorId: 'endnote',
    listings: [
      { university: 'Australian National University', country: 'AU', sourceUrl: 'https://libguides.anu.edu.au/endnote', retrievedAt: '2026-08-13' },
      { university: 'Curtin University', country: 'AU', sourceUrl: 'https://libguides.library.curtin.edu.au/endnote', retrievedAt: '2026-08-13' },
      { university: 'Deakin University', country: 'AU', sourceUrl: 'https://www.deakin.edu.au/library/research/use-research-tools-and-software/endnote-guide', retrievedAt: '2026-08-13' },
      { university: 'Griffith University', country: 'AU', sourceUrl: 'https://www.griffith.edu.au/library/research-publishing/working-with-literature/referencing-software', retrievedAt: '2026-08-13' },
      { university: 'Macquarie University', country: 'AU', sourceUrl: 'https://libguides.mq.edu.au/referencing-software', retrievedAt: '2026-08-13' },
      { university: 'Queensland University of Technology', country: 'AU', sourceUrl: 'https://studysmart.library.qut.edu.au/modules/3/2/3/', retrievedAt: '2026-08-13' },
      { university: 'RMIT University', country: 'AU', sourceUrl: 'https://www.rmit.edu.au/library/research/searching-referencing-copyright/reference-management-tools', retrievedAt: '2026-08-13' },
      { university: 'University of Adelaide', country: 'AU', sourceUrl: 'https://libguides.adelaide.edu.au/c.php?g=874062&p=7079095', retrievedAt: '2026-08-13' },
      { university: 'University of Queensland', country: 'AU', sourceUrl: 'https://guides.library.uq.edu.au/tools-and-techniques/endnote-referencing-software/other-software', retrievedAt: '2026-08-13' },
      { university: 'University of Sydney', country: 'AU', sourceUrl: 'https://www.library.sydney.edu.au/support/referencing/reference-management-tools', retrievedAt: '2026-08-13' },
      { university: 'University of Technology Sydney', country: 'AU', sourceUrl: 'https://www.lib.uts.edu.au/referencing/other-referencing-resources', retrievedAt: '2026-08-13' },
      { university: 'University of Western Australia', country: 'AU', sourceUrl: 'https://guides.library.uwa.edu.au/referencinguwa/managing', retrievedAt: '2026-08-13' },
      { university: 'University of Wollongong', country: 'AU', sourceUrl: 'https://www.uow.edu.au/library/endnote/', retrievedAt: '2026-08-13' },
      { university: 'UNSW Sydney', country: 'AU', sourceUrl: 'https://www.library.unsw.edu.au/research/support-for-your-research/managing-references', retrievedAt: '2026-08-13' },
      { university: 'McMaster University', country: 'CA', sourceUrl: 'https://libguides.mcmaster.ca/cms', retrievedAt: '2026-08-13' },
      { university: 'Queen\'s University', country: 'CA', sourceUrl: 'https://guides.library.queensu.ca/citing-and-citation-managers/endnote', retrievedAt: '2026-08-13' },
      { university: 'Université de Montréal', country: 'CA', sourceUrl: 'https://boite-outils.bib.umontreal.ca/citer', retrievedAt: '2026-08-13' },
      { university: 'University of Alberta', country: 'CA', sourceUrl: 'https://guides.library.ualberta.ca/citing', retrievedAt: '2026-08-13' },
      { university: 'University of British Columbia', country: 'CA', sourceUrl: 'https://guides.library.ubc.ca/citationmanagement', retrievedAt: '2026-08-13' },
      { university: 'University of Calgary', country: 'CA', sourceUrl: 'https://libguides.ucalgary.ca/guides/endnote', retrievedAt: '2026-08-13' },
      { university: 'University of Waterloo', country: 'CA', sourceUrl: 'https://uwaterloo.ca/lib/research-supports/reference-management-software', retrievedAt: '2026-08-13' },
      { university: 'Aarhus University', country: 'DK', sourceUrl: 'https://library.au.dk/en/researchers/reference-management', retrievedAt: '2026-08-13' },
      { university: 'IT University of Copenhagen', country: 'DK', sourceUrl: 'https://kub.kb.dk/itlibrary', retrievedAt: '2026-08-13' },
      { university: 'University of Copenhagen', country: 'DK', sourceUrl: 'https://kub.kb.dk/systematicreviews/reference-managers', retrievedAt: '2026-08-13' },
      { university: 'University of Southern Denmark', country: 'DK', sourceUrl: 'https://libguides.sdu.dk/literaturesearching-reviews/referencemanagement', retrievedAt: '2026-08-13' },
      { university: 'Universidad Complutense de Madrid', country: 'ES', sourceUrl: 'https://biblioguias.ucm.es/gestoresbibliograficos', retrievedAt: '2026-08-13' },
      { university: 'Universidad de Salamanca', country: 'ES', sourceUrl: 'https://bibliotecas.usal.es/gestores-bibliograficos/', retrievedAt: '2026-08-13' },
      { university: 'Universidad de Sevilla', country: 'ES', sourceUrl: 'https://guiasbus.us.es/gestoresbibliograficos', retrievedAt: '2026-08-13' },
      { university: 'Universitat de Barcelona', country: 'ES', sourceUrl: 'https://crai.ub.edu/en/crai-services/citations-reference/bibliography-tools', retrievedAt: '2026-08-13' },
      { university: 'Universitat Politècnica de Catalunya', country: 'ES', sourceUrl: 'https://guies.bibliotecnica.upc.edu/com-citar/', retrievedAt: '2026-08-13' },
      { university: 'Aalto University', country: 'FI', sourceUrl: 'https://libguides.aalto.fi/c.php?g=410674&p=2797604', retrievedAt: '2026-08-13' },
      { university: 'University of Helsinki', country: 'FI', sourceUrl: 'https://libraryguides.helsinki.fi/viitteidenhallinta/uh_en', retrievedAt: '2026-08-13' },
      { university: 'Université Paris Cité', country: 'FR', sourceUrl: 'https://u-paris.libguides.com/redigeretciter/logiciels', retrievedAt: '2026-08-13' },
      { university: 'BI Norwegian Business School', country: 'NO', sourceUrl: 'https://libguides.bi.no/endnote', retrievedAt: '2026-08-13' },
      { university: 'Norwegian University of Life Sciences', country: 'NO', sourceUrl: 'https://www.nmbu.no/en/library/write-and-cite', retrievedAt: '2026-08-13' },
      { university: 'NTNU Norwegian University of Science and Technology', country: 'NO', sourceUrl: 'https://www.ntnu.edu/ub/subject-page-for-medicine-and-health/endnote-and-zotero', retrievedAt: '2026-08-13' },
      { university: 'UiT The Arctic University of Norway', country: 'NO', sourceUrl: 'https://en.uit.no/ub/writeandcite/citation-tools', retrievedAt: '2026-08-13' },
      { university: 'University of Oslo', country: 'NO', sourceUrl: 'https://www.ub.uio.no/english/writing-publishing/referencing/', retrievedAt: '2026-08-13' },
      { university: 'University of Stavanger', country: 'NO', sourceUrl: 'https://www.uis.no/en/library/endnote', retrievedAt: '2026-08-13' },
      { university: 'Chalmers University of Technology', country: 'SE', sourceUrl: 'https://guides.lib.chalmers.se/reference_management_software', retrievedAt: '2026-08-12' },
      { university: 'Karolinska Institutet', country: 'SE', sourceUrl: 'https://kib.ki.se/en/write-cite/reference-management-software', retrievedAt: '2026-08-12' },
      { university: 'KTH Royal Institute of Technology', country: 'SE', sourceUrl: 'https://www.kth.se/en/biblioteket/skriva-referera/referenshanteringsprogram', retrievedAt: '2026-08-12' },
      { university: 'Lund University', country: 'SE', sourceUrl: 'https://www.lub.lu.se/en/find/reference-management-programs', retrievedAt: '2026-08-12' },
      { university: 'Malmö University', country: 'SE', sourceUrl: 'https://libguides.mau.se/referenshanteringsprogram', retrievedAt: '2026-08-12' },
      { university: 'Umeå University', country: 'SE', sourceUrl: 'https://www.umu.se/en/library/search-write-study/writing-references/software-for-writing-references/', retrievedAt: '2026-08-12' },
      { university: 'University of Gothenburg', country: 'SE', sourceUrl: 'https://www.ub.gu.se/en/services-and-support/help-with-endnote-and-zotero', retrievedAt: '2026-08-12' },
      { university: 'Brown University', country: 'US', sourceUrl: 'https://libguides.brown.edu/citations', retrievedAt: '2026-08-13' },
      { university: 'Cornell University', country: 'US', sourceUrl: 'https://www.library.cornell.edu/study/citation-management/', retrievedAt: '2026-08-13' },
      { university: 'Dartmouth College', country: 'US', sourceUrl: 'https://researchguides.dartmouth.edu/citingsources/refman', retrievedAt: '2026-08-13' },
      { university: 'New York University', country: 'US', sourceUrl: 'https://guides.nyu.edu/citations/tools', retrievedAt: '2026-08-13' },
      { university: 'UC Berkeley', country: 'US', sourceUrl: 'https://guides.lib.berkeley.edu/cite-your-sources', retrievedAt: '2026-08-13' },
      { university: 'UCLA', country: 'US', sourceUrl: 'https://guides.library.ucla.edu/citing', retrievedAt: '2026-08-13' },
      { university: 'University of Chicago', country: 'US', sourceUrl: 'https://guides.lib.uchicago.edu/citation_management', retrievedAt: '2026-08-13' },
      { university: 'University of Michigan', country: 'US', sourceUrl: 'https://guides.lib.umich.edu/citationmanagement', retrievedAt: '2026-08-13' },
      { university: 'University of Pennsylvania', country: 'US', sourceUrl: 'https://guides.library.upenn.edu/citationmgmt', retrievedAt: '2026-08-13' },
      { university: 'University of Texas at Austin', country: 'US', sourceUrl: 'https://guides.lib.utexas.edu/citation-managers', retrievedAt: '2026-08-13' },
      { university: 'University of Washington', country: 'US', sourceUrl: 'https://guides.lib.uw.edu/citation-tools', retrievedAt: '2026-08-13' },
      { university: 'Yale University', country: 'US', sourceUrl: 'https://www.library.yale.edu/help-and-research-support/citation-tools', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'mendeley',
    name: 'Mendeley',
    website: 'https://www.mendeley.com',
    category: 'reference',
    vendorId: 'mendeley',
    listings: [
      { university: 'Griffith University', country: 'AU', sourceUrl: 'https://www.griffith.edu.au/library/research-publishing/working-with-literature/referencing-software', retrievedAt: '2026-08-13' },
      { university: 'Macquarie University', country: 'AU', sourceUrl: 'https://libguides.mq.edu.au/referencing-software/mendeley', retrievedAt: '2026-08-13' },
      { university: 'Queensland University of Technology', country: 'AU', sourceUrl: 'https://studysmart.library.qut.edu.au/modules/3/2/3/', retrievedAt: '2026-08-13' },
      { university: 'RMIT University', country: 'AU', sourceUrl: 'https://www.rmit.edu.au/library/research/searching-referencing-copyright/reference-management-tools', retrievedAt: '2026-08-13' },
      { university: 'University of Adelaide', country: 'AU', sourceUrl: 'https://libguides.adelaide.edu.au/mendeley', retrievedAt: '2026-08-13' },
      { university: 'University of Queensland', country: 'AU', sourceUrl: 'https://guides.library.uq.edu.au/tools-and-techniques/endnote-referencing-software/other-software', retrievedAt: '2026-08-13' },
      { university: 'University of Technology Sydney', country: 'AU', sourceUrl: 'https://www.lib.uts.edu.au/referencing/other-referencing-resources', retrievedAt: '2026-08-13' },
      { university: 'University of Wollongong', country: 'AU', sourceUrl: 'https://www.uow.edu.au/student/support-services/academic-skills/online-resources/technology-and-software/', retrievedAt: '2026-08-13' },
      { university: 'McMaster University', country: 'CA', sourceUrl: 'https://libguides.mcmaster.ca/cms', retrievedAt: '2026-08-13' },
      { university: 'University of Alberta', country: 'CA', sourceUrl: 'https://guides.library.ualberta.ca/citing', retrievedAt: '2026-08-13' },
      { university: 'University of British Columbia', country: 'CA', sourceUrl: 'https://guides.library.ubc.ca/citationmanagement', retrievedAt: '2026-08-13' },
      { university: 'Western University', country: 'CA', sourceUrl: 'https://www.lib.uwo.ca/essayhelp/citationmanagementsoftware.html', retrievedAt: '2026-08-13' },
      { university: 'Copenhagen Business School', country: 'DK', sourceUrl: 'https://www.cbs.dk/en/library/search-library/online-resources/mendeley', retrievedAt: '2026-08-13' },
      { university: 'Technical University of Denmark', country: 'DK', sourceUrl: 'https://www.bibliotek.dtu.dk/en/publishing/reference-management', retrievedAt: '2026-08-13' },
      { university: 'Universidad Complutense de Madrid', country: 'ES', sourceUrl: 'https://biblioguias.ucm.es/gestoresbibliograficos', retrievedAt: '2026-08-13' },
      { university: 'Universidad de Salamanca', country: 'ES', sourceUrl: 'https://bibliotecas.usal.es/gestores-bibliograficos/', retrievedAt: '2026-08-13' },
      { university: 'Universidad de Sevilla', country: 'ES', sourceUrl: 'https://guiasbus.us.es/gestoresbibliograficos', retrievedAt: '2026-08-13' },
      { university: 'Universitat de Barcelona', country: 'ES', sourceUrl: 'https://crai.ub.edu/en/crai-services/citations-reference/bibliography-tools', retrievedAt: '2026-08-13' },
      { university: 'Universitat Politècnica de Catalunya', country: 'ES', sourceUrl: 'https://guies.bibliotecnica.upc.edu/com-citar/', retrievedAt: '2026-08-13' },
      { university: 'Aalto University', country: 'FI', sourceUrl: 'https://libguides.aalto.fi/c.php?g=410674&p=2797604', retrievedAt: '2026-08-13' },
      { university: 'University of Helsinki', country: 'FI', sourceUrl: 'https://libraryguides.helsinki.fi/viitteidenhallinta/uh_en', retrievedAt: '2026-08-13' },
      { university: 'University of Jyväskylä', country: 'FI', sourceUrl: 'https://www.jyu.fi/en/for-students/instructions-for-bachelors-and-masters-students/information-seeking-and-research-data-management/library-tutorial/reference-management-software', retrievedAt: '2026-08-13' },
      { university: 'University of Lapland', country: 'FI', sourceUrl: 'https://libguides.luc.fi/research', retrievedAt: '2026-08-13' },
      { university: 'University of Oulu', country: 'FI', sourceUrl: 'https://libguides.oulu.fi/actaguide/bibliographicmanagement', retrievedAt: '2026-08-13' },
      { university: 'University of Turku', country: 'FI', sourceUrl: 'https://utuguides.fi/reference', retrievedAt: '2026-08-13' },
      { university: 'University of Vaasa', country: 'FI', sourceUrl: 'https://uva.libguides.com/reference_management', retrievedAt: '2026-08-13' },
      { university: 'Université Paris Cité', country: 'FR', sourceUrl: 'https://u-paris.libguides.com/redigeretciter/logiciels', retrievedAt: '2026-08-13' },
      { university: 'Chalmers University of Technology', country: 'SE', sourceUrl: 'https://guides.lib.chalmers.se/reference_management_software', retrievedAt: '2026-08-12' },
      { university: 'KTH Royal Institute of Technology', country: 'SE', sourceUrl: 'https://www.kth.se/en/biblioteket/skriva-referera/referenshanteringsprogram', retrievedAt: '2026-08-12' },
      { university: 'Umeå University', country: 'SE', sourceUrl: 'https://www.umu.se/en/library/search-write-study/writing-references/software-for-writing-references/', retrievedAt: '2026-08-12' },
      { university: 'Brown University', country: 'US', sourceUrl: 'https://libguides.brown.edu/citations', retrievedAt: '2026-08-13' },
      { university: 'Cornell University', country: 'US', sourceUrl: 'https://www.library.cornell.edu/study/citation-management/', retrievedAt: '2026-08-13' },
      { university: 'Dartmouth College', country: 'US', sourceUrl: 'https://researchguides.dartmouth.edu/citingsources/refman', retrievedAt: '2026-08-13' },
      { university: 'MIT', country: 'US', sourceUrl: 'https://libguides.mit.edu/cite-write/citetools', retrievedAt: '2026-08-13' },
      { university: 'UC Berkeley', country: 'US', sourceUrl: 'https://guides.lib.berkeley.edu/cite-your-sources', retrievedAt: '2026-08-13' },
      { university: 'University of Chicago', country: 'US', sourceUrl: 'https://guides.lib.uchicago.edu/citation_management', retrievedAt: '2026-08-13' },
      { university: 'University of Michigan', country: 'US', sourceUrl: 'https://guides.lib.umich.edu/citationmanagement', retrievedAt: '2026-08-13' },
      { university: 'University of Pennsylvania', country: 'US', sourceUrl: 'https://guides.library.upenn.edu/citationmgmt', retrievedAt: '2026-08-13' },
      { university: 'University of Washington', country: 'US', sourceUrl: 'https://guides.lib.uw.edu/citation-tools', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'refworks',
    name: 'RefWorks',
    website: 'https://refworks.proquest.com',
    category: 'reference',
    listings: [
      { university: 'University of Technology Sydney', country: 'AU', sourceUrl: 'https://www.lib.uts.edu.au/referencing/other-referencing-resources', retrievedAt: '2026-08-13' },
      { university: 'University of Waterloo', country: 'CA', sourceUrl: 'https://uwaterloo.ca/lib/research-supports/reference-management-software', retrievedAt: '2026-08-13' },
      { university: 'Universidad Autónoma de Madrid', country: 'ES', sourceUrl: 'https://biblioguias.uam.es/tutoriales/refworksproquest', retrievedAt: '2026-08-13' },
      { university: 'Universidad Complutense de Madrid', country: 'ES', sourceUrl: 'https://biblioguias.ucm.es/gestoresbibliograficos', retrievedAt: '2026-08-13' },
      { university: 'Universidad de Salamanca', country: 'ES', sourceUrl: 'https://bibliotecas.usal.es/gestores-bibliograficos/', retrievedAt: '2026-08-13' },
      { university: 'Umeå University', country: 'SE', sourceUrl: 'https://www.umu.se/en/library/search-write-study/writing-references/software-for-writing-references/', retrievedAt: '2026-08-12' },
      { university: 'New York University', country: 'US', sourceUrl: 'https://guides.nyu.edu/citations/tools', retrievedAt: '2026-08-13' },
      { university: 'University of Pennsylvania', country: 'US', sourceUrl: 'https://guides.library.upenn.edu/citationmgmt', retrievedAt: '2026-08-13' },
      { university: 'Yale University', country: 'US', sourceUrl: 'https://www.library.yale.edu/help-and-research-support/citation-tools', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'papers',
    name: 'Papers',
    website: 'https://www.papersapp.com',
    category: 'reference',
    listings: [
      { university: 'Karolinska Institutet', country: 'SE', sourceUrl: 'https://kib.ki.se/en/write-cite/reference-management-software', retrievedAt: '2026-08-12' },
      { university: 'Dartmouth College', country: 'US', sourceUrl: 'https://researchguides.dartmouth.edu/citingsources/refman', retrievedAt: '2026-08-13' },
      { university: 'UC Berkeley', country: 'US', sourceUrl: 'https://guides.lib.berkeley.edu/cite-your-sources', retrievedAt: '2026-08-13' },
      { university: 'University of Chicago', country: 'US', sourceUrl: 'https://guides.lib.uchicago.edu/citation_management', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'paperpile',
    name: 'Paperpile',
    website: 'https://paperpile.com',
    category: 'reference',
    listings: [
      { university: 'Queensland University of Technology', country: 'AU', sourceUrl: 'https://studysmart.library.qut.edu.au/modules/3/2/3/', retrievedAt: '2026-08-13' },
      { university: 'Aarhus University', country: 'DK', sourceUrl: 'https://library.au.dk/en/researchers/reference-management', retrievedAt: '2026-08-13' },
      { university: 'UC Berkeley', country: 'US', sourceUrl: 'https://guides.lib.berkeley.edu/cite-your-sources', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'covidence',
    name: 'Covidence',
    website: 'https://www.covidence.org',
    category: 'reference',
    listings: [
      { university: 'Griffith University', country: 'AU', sourceUrl: 'https://www.griffith.edu.au/library/research-publishing/working-with-literature/referencing-software', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'jabref',
    name: 'JabRef',
    website: 'https://www.jabref.org',
    category: 'reference',
    listings: [
      { university: 'Aarhus University', country: 'DK', sourceUrl: 'https://library.au.dk/en/researchers/reference-management', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'overleaf',
    name: 'Overleaf',
    website: 'https://www.overleaf.com',
    category: 'reference',
    listings: [
      { university: 'Macquarie University', country: 'AU', sourceUrl: 'https://libguides.mq.edu.au/referencing-software', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    website: 'https://copilot.microsoft.com',
    category: 'ai',
    listings: [
      { university: 'Australian National University', country: 'AU', sourceUrl: 'https://services.anu.edu.au/information-technology/software-systems/microsoft-copilot-ai', retrievedAt: '2026-08-13' },
      { university: 'University of British Columbia', country: 'CA', sourceUrl: 'https://it.ubc.ca/services/artificial-intelligence/microsoft-copilot-ubc', retrievedAt: '2026-08-13' },
      { university: 'University of Waterloo', country: 'CA', sourceUrl: 'https://uwaterloo.ca/associate-vice-president-academic/artificial-intelligence-uw', retrievedAt: '2026-08-13' },
      { university: 'Copenhagen Business School', country: 'DK', sourceUrl: 'https://teach.cbs.dk/ai/', retrievedAt: '2026-08-13' },
      { university: 'Roskilde University', country: 'DK', sourceUrl: 'https://libguides.ruc.dk/AIatRUC', retrievedAt: '2026-08-13' },
      { university: 'University of Copenhagen', country: 'DK', sourceUrl: 'https://phd.ku.dk/english/regulations/ai-assisted-technologies/', retrievedAt: '2026-08-13' },
      { university: 'Universidad Complutense de Madrid', country: 'ES', sourceUrl: 'https://ssii.ucm.es/herramientas-ia-generativa', retrievedAt: '2026-08-13' },
      { university: 'LUT University', country: 'FI', sourceUrl: 'https://elut.lut.fi/en/it-instructions-and-study-tools/study-systems/microsoft-copilot', retrievedAt: '2026-08-13' },
      { university: 'Tampere University', country: 'FI', sourceUrl: 'https://www.tuni.fi/en/it-services/handbook/artificial-intelligence/ai-applications/copilot-chat', retrievedAt: '2026-08-13' },
      { university: 'University of Helsinki', country: 'FI', sourceUrl: 'https://helpdesk.it.helsinki.fi/en/instructions/information-security-and-cloud-services/cloud-services/microsoft-copilot-university', retrievedAt: '2026-08-13' },
      { university: 'University of Oulu', country: 'FI', sourceUrl: 'https://ict.oulu.fi/20642/?lang=en', retrievedAt: '2026-08-13' },
      { university: 'Nord University', country: 'NO', sourceUrl: 'https://www.nord.no/en/about/generative-artificial-intelligence', retrievedAt: '2026-08-13' },
      { university: 'NTNU Norwegian University of Science and Technology', country: 'NO', sourceUrl: 'https://i.ntnu.no/en/wiki/-/wiki/English/Bing+Chat+Enterprise/', retrievedAt: '2026-08-13' },
      { university: 'UiT The Arctic University of Norway', country: 'NO', sourceUrl: 'https://en.uit.no/om/kunstigintelligens', retrievedAt: '2026-08-13' },
      { university: 'University of Agder', country: 'NO', sourceUrl: 'https://www.uia.no/intranett/english/work-support/ai-in-teaching/approved-ai-resources-at-uia.html', retrievedAt: '2026-08-13' },
      { university: 'University of Oslo', country: 'NO', sourceUrl: 'https://www.uio.no/english/services/it/ai/copilot/', retrievedAt: '2026-08-13' },
      { university: 'Karolinska Institutet', country: 'SE', sourceUrl: 'https://staff.ki.se/tools-and-support/it-and-telephony/order-it-and-telephony-services/microsoft-365-for-staff/ai-for-staff-microsoft-copilot-chat', retrievedAt: '2026-08-12' },
      { university: 'Lund University', country: 'SE', sourceUrl: 'https://www.staff.lu.se/support-and-tools/it-mail-and-telephony/ai-lund-university', retrievedAt: '2026-08-12' },
      { university: 'Mid Sweden University', country: 'SE', sourceUrl: 'https://www.miun.se/en/student/service-and-support/it-services/Office-365/AI-M365/', retrievedAt: '2026-08-12' },
      { university: 'Stockholm University', country: 'SE', sourceUrl: 'https://medarbetare.su.se/en/support-and-service/it/ai-recourses-at-stockholm-university', retrievedAt: '2026-08-12' },
      { university: 'MIT', country: 'US', sourceUrl: 'https://mitsloanedtech.mit.edu/2024/02/05/microsoft-copilot-chat-now-available-for-faculty-staff/', retrievedAt: '2026-08-13' },
      { university: 'Yale University', country: 'US', sourceUrl: 'https://ai.yale.edu/yales-ai-tools-and-resources', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'keenious',
    name: 'Keenious',
    website: 'https://keenious.com',
    category: 'ai',
    listings: [
      { university: 'Copenhagen Business School', country: 'DK', sourceUrl: 'https://www.cbs.dk/en/library/search-library/how-search-using-ai', retrievedAt: '2026-08-13' },
      { university: 'University of Jyväskylä', country: 'FI', sourceUrl: 'https://www.jyu.fi/en/for-students/instructions-for-bachelors-and-masters-students/information-seeking-and-research-data-management/ai-tools-for-finding-scientific-sources', retrievedAt: '2026-08-13' },
      { university: 'University of Lapland', country: 'FI', sourceUrl: 'https://libguides.luc.fi/research', retrievedAt: '2026-08-13' },
      { university: 'University of Oulu', country: 'FI', sourceUrl: 'https://www.oulu.fi/en/news/keenious-trial-use-university-oulu', retrievedAt: '2026-08-13' },
      { university: 'Norwegian University of Life Sciences', country: 'NO', sourceUrl: 'https://www.nmbu.no/en/guidelines-use-artificial-intelligence-ai-nmbu', retrievedAt: '2026-08-13' },
      { university: 'OsloMet', country: 'NO', sourceUrl: 'https://www.oslomet.no/en/ul/ai-tools', retrievedAt: '2026-08-13' },
      { university: 'UiT The Arctic University of Norway', country: 'NO', sourceUrl: 'https://en.uit.no/om/kunstigintelligens', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    website: 'https://chatgpt.com',
    category: 'ai',
    listings: [
      { university: 'Copenhagen Business School', country: 'DK', sourceUrl: 'https://www.cbs.dk/en/library/search-library/how-search-using-ai', retrievedAt: '2026-08-13' },
      { university: 'Roskilde University', country: 'DK', sourceUrl: 'https://libguides.ruc.dk/AIatRUC', retrievedAt: '2026-08-13' },
      { university: 'Harvard University', country: 'US', sourceUrl: 'https://provost.harvard.edu/guidelines-using-chatgpt-and-other-generative-ai-tools-harvard', retrievedAt: '2026-08-13' },
      { university: 'Stanford University', country: 'US', sourceUrl: 'https://guides.library.stanford.edu/ai_research/stanford_resources', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    website: 'https://gemini.google.com',
    category: 'ai',
    listings: [
      { university: 'BI Norwegian Business School', country: 'NO', sourceUrl: 'https://www.bi.no/en/about-bi/news/2026/06/bi-introduces-ai-tools-to-strengthen-teaching-and-student-learning/', retrievedAt: '2026-08-13' },
      { university: 'Harvard University', country: 'US', sourceUrl: 'https://bokcenter.harvard.edu/getting-started-huit-supported-ai-tools', retrievedAt: '2026-08-13' },
      { university: 'Stanford University', country: 'US', sourceUrl: 'https://guides.library.stanford.edu/ai_research/stanford_resources', retrievedAt: '2026-08-13' },
      { university: 'Yale University', country: 'US', sourceUrl: 'https://ai.yale.edu/yales-ai-tools-and-resources', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'notebooklm',
    name: 'NotebookLM',
    website: 'https://notebooklm.google.com',
    category: 'ai',
    listings: [
      { university: 'Roskilde University', country: 'DK', sourceUrl: 'https://ruc.dk/en/generative-ai-roskilde-university', retrievedAt: '2026-08-13' },
      { university: 'BI Norwegian Business School', country: 'NO', sourceUrl: 'https://www.bi.no/en/about-bi/news/2026/06/bi-introduces-ai-tools-to-strengthen-teaching-and-student-learning/', retrievedAt: '2026-08-13' },
      { university: 'Harvard University', country: 'US', sourceUrl: 'https://bokcenter.harvard.edu/getting-started-huit-supported-ai-tools', retrievedAt: '2026-08-13' },
      { university: 'Yale University', country: 'US', sourceUrl: 'https://ai.yale.edu/yales-ai-tools-and-resources', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    website: 'https://claude.ai',
    category: 'ai',
    listings: [
      { university: 'Copenhagen Business School', country: 'DK', sourceUrl: 'https://www.cbs.dk/en/library/search-library/how-search-using-ai', retrievedAt: '2026-08-13' },
      { university: 'Stanford University', country: 'US', sourceUrl: 'https://guides.library.stanford.edu/ai_research/stanford_resources', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'gpt-uio',
    name: 'GPT UiO',
    website: 'https://www.uio.no/english/services/it/ai/gpt-uio/',
    category: 'ai',
    listings: [
      { university: 'University of Agder', country: 'NO', sourceUrl: 'https://www.uia.no/intranett/english/work-support/ai-in-teaching/approved-ai-resources-at-uia.html', retrievedAt: '2026-08-13' },
      { university: 'University of Oslo', country: 'NO', sourceUrl: 'https://www.ub.uio.no/english/courses-events/courses/gpt-uio/', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'research-rabbit',
    name: 'ResearchRabbit',
    website: 'https://www.researchrabbit.ai',
    category: 'ai',
    listings: [
      { university: 'Roskilde University', country: 'DK', sourceUrl: 'https://libguides.ruc.dk/AIatRUC', retrievedAt: '2026-08-13' },
      { university: 'University of Jyväskylä', country: 'FI', sourceUrl: 'https://www.jyu.fi/en/for-students/instructions-for-bachelors-and-masters-students/information-seeking-and-research-data-management/ai-tools-for-finding-scientific-sources', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'scite',
    name: 'Scite',
    website: 'https://scite.ai',
    category: 'ai',
    listings: [
      { university: 'Copenhagen Business School', country: 'DK', sourceUrl: 'https://www.cbs.dk/en/library/search-library/how-search-using-ai', retrievedAt: '2026-08-13' },
      { university: 'University of Southern Denmark', country: 'DK', sourceUrl: 'https://libguides.sdu.dk/HealthSciences/software', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'aalto-ai',
    name: 'Aalto AI Assistant',
    website: 'https://www.aalto.fi/en/services/aalto-ai-assistant',
    category: 'ai',
    listings: [
      { university: 'Aalto University', country: 'FI', sourceUrl: 'https://www.aalto.fi/en/services/aalto-ai-assistant', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'chatuit',
    name: 'ChatUiT',
    website: 'https://chat.uit.no',
    category: 'ai',
    listings: [
      { university: 'UiT The Arctic University of Norway', country: 'NO', sourceUrl: 'https://en.uit.no/om/kunstigintelligens', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'currechat',
    name: 'CurreChat',
    website: 'https://curre.helsinki.fi/chat',
    category: 'ai',
    listings: [
      { university: 'University of Helsinki', country: 'FI', sourceUrl: 'https://helpdesk.it.helsinki.fi/en/instructions/information-security-and-cloud-services/cloud-services/currechat', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'litmaps',
    name: 'Litmaps',
    website: 'https://www.litmaps.com',
    category: 'ai',
    listings: [
      { university: 'University of Jyväskylä', country: 'FI', sourceUrl: 'https://www.jyu.fi/en/for-students/instructions-for-bachelors-and-masters-students/information-seeking-and-research-data-management/ai-tools-for-finding-scientific-sources', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    website: 'https://mistral.ai',
    category: 'ai',
    listings: [
      { university: 'Aalborg University', country: 'DK', sourceUrl: 'https://www.researcher.aau.dk/guides/research-data-and-software/software-and-tools/mistral-ai', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'scopus-ai',
    name: 'Scopus AI',
    website: 'https://www.scopus.com',
    category: 'ai',
    listings: [
      { university: 'University of Agder', country: 'NO', sourceUrl: 'https://www.uia.no/intranett/english/work-support/ai-in-teaching/approved-ai-resources-at-uia.html', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'sikt-ki-chat',
    name: 'Sikt KI-chat',
    website: 'https://sikt.no',
    category: 'ai',
    listings: [
      { university: 'Norwegian University of Life Sciences', country: 'NO', sourceUrl: 'https://www.nmbu.no/en/guidelines-use-artificial-intelligence-ai-nmbu', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'qualtrics',
    name: 'Qualtrics',
    website: 'https://www.qualtrics.com',
    category: 'survey',
    vendorId: 'qualtrics',
    listings: [
      { university: 'University of Melbourne', country: 'AU', sourceUrl: 'https://blogs.unimelb.edu.au/researcher-library/2020/08/13/survey-tools-for-your-research/', retrievedAt: '2026-08-13' },
      { university: 'University of Western Australia', country: 'AU', sourceUrl: 'https://guides.library.uwa.edu.au/surveytools/Qualtrics', retrievedAt: '2026-08-13' },
      { university: 'Queen\'s University', country: 'CA', sourceUrl: 'https://www.queensu.ca/planningandbudget/irp/qualtrics/training-support', retrievedAt: '2026-08-13' },
      { university: 'University of British Columbia', country: 'CA', sourceUrl: 'https://it.ubc.ca/services/teaching-learning-tools/survey-tool', retrievedAt: '2026-08-13' },
      { university: 'University of Calgary', country: 'CA', sourceUrl: 'https://www.ucalgary.ca/provost/oia/survey/accessing-qualtrics/ucalgary-qualtrics', retrievedAt: '2026-08-13' },
      { university: 'University of Waterloo', country: 'CA', sourceUrl: 'https://uwaterloo.ca/educational-technology-hub/catalogs/centrally-supported-tools/qualtrics', retrievedAt: '2026-08-13' },
      { university: 'Western University', country: 'CA', sourceUrl: 'https://wts.uwo.ca/services/o/surveys-and-data-collection-qualtrics/index.html', retrievedAt: '2026-08-13' },
      { university: 'Aarhus University', country: 'DK', sourceUrl: 'https://studerende.au.dk/en/it-support/software/qualtrics', retrievedAt: '2026-08-13' },
      { university: 'Copenhagen Business School', country: 'DK', sourceUrl: 'https://www.cbs.dk/en/library/search-library/online-resources/qualtrics-xm', retrievedAt: '2026-08-13' },
      { university: 'Aalto University', country: 'FI', sourceUrl: 'https://www.aalto.fi/en/services/survey-and-audience-interaction-tools', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'webropol',
    name: 'Webropol',
    website: 'https://webropol.com',
    category: 'survey',
    listings: [
      { university: 'Aalto University', country: 'FI', sourceUrl: 'https://www.aalto.fi/en/services/survey-and-audience-interaction-tools', retrievedAt: '2026-08-13' },
      { university: 'Åbo Akademi University', country: 'FI', sourceUrl: 'https://www.abo.fi/en/data-procteting-notice-for-abo-akademi-university-student-survey/', retrievedAt: '2026-08-13' },
      { university: 'LUT University', country: 'FI', sourceUrl: 'https://elut.lut.fi/en/it-instructions-and-study-tools/webropol', retrievedAt: '2026-08-13' },
      { university: 'Tampere University', country: 'FI', sourceUrl: 'https://www.tuni.fi/en/it-services/handbook/it-research/collecting-research-data-0/choosing-online-survey-tool', retrievedAt: '2026-08-13' },
      { university: 'University of Eastern Finland', country: 'FI', sourceUrl: 'https://kamu.uef.fi/en/tools/web-survey-forms/', retrievedAt: '2026-08-13' },
      { university: 'University of Helsinki', country: 'FI', sourceUrl: 'https://studies.helsinki.fi/instructions/news/webropol-survey-tool-available-university-community-members-beginning-december-2025', retrievedAt: '2026-08-13' },
      { university: 'University of Jyväskylä', country: 'FI', sourceUrl: 'https://www.jyu.fi/en/research/research-data-management/guide/surveys-interviews-transcription', retrievedAt: '2026-08-13' },
      { university: 'University of Oulu', country: 'FI', sourceUrl: 'https://ict.oulu.fi/17180/?lang=en', retrievedAt: '2026-08-13' },
      { university: 'University of Turku', country: 'FI', sourceUrl: 'https://utuguides.fi/rdm-for-students/before-collecting-data', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'redcap',
    name: 'REDCap',
    website: 'https://www.project-redcap.org',
    category: 'survey',
    listings: [
      { university: 'University of Melbourne', country: 'AU', sourceUrl: 'https://blogs.unimelb.edu.au/researcher-library/2020/08/13/survey-tools-for-your-research/', retrievedAt: '2026-08-13' },
      { university: 'University of Western Australia', country: 'AU', sourceUrl: 'https://guides.library.uwa.edu.au/surveytools/RedCap', retrievedAt: '2026-08-13' },
      { university: 'Aalborg University', country: 'DK', sourceUrl: 'https://www.researcher.aau.dk/guides/research-data/software-and-tools', retrievedAt: '2026-08-13' },
      { university: 'Aalto University', country: 'FI', sourceUrl: 'https://www.aalto.fi/en/services/survey-and-audience-interaction-tools', retrievedAt: '2026-08-13' },
      { university: 'University of Jyväskylä', country: 'FI', sourceUrl: 'https://www.jyu.fi/en/research/research-data-management/guide/surveys-interviews-transcription', retrievedAt: '2026-08-13' },
      { university: 'University of Turku', country: 'FI', sourceUrl: 'https://utuguides.fi/rdm-for-students/before-collecting-data', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'nettskjema',
    name: 'Nettskjema',
    website: 'https://nettskjema.no',
    category: 'survey',
    listings: [
      { university: 'Norwegian University of Life Sciences', country: 'NO', sourceUrl: 'https://www.nmbu.no/en/nettskjema-create-questionnaires', retrievedAt: '2026-08-13' },
      { university: 'University of Agder', country: 'NO', sourceUrl: 'https://libguides.uia.no/SurveyXact/nettskjema', retrievedAt: '2026-08-13' },
      { university: 'University of Stavanger', country: 'NO', sourceUrl: 'https://www.uis.no/en/student/nettskjema', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'limesurvey',
    name: 'LimeSurvey',
    website: 'https://www.limesurvey.org',
    category: 'survey',
    listings: [
      { university: 'Universitat de Barcelona', country: 'ES', sourceUrl: 'https://www.ub.edu/surveyil3/', retrievedAt: '2026-08-13' },
      { university: 'Tampere University', country: 'FI', sourceUrl: 'https://www.tuni.fi/en/it-services/handbook/it-research/collecting-research-data-0/choosing-online-survey-tool', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'surveyxact',
    name: 'SurveyXact',
    website: 'https://www.surveyxact.com',
    category: 'survey',
    listings: [
      { university: 'Aalborg University', country: 'DK', sourceUrl: 'https://www.researcher.aau.dk/guides/research-data/software-and-tools', retrievedAt: '2026-08-13' },
      { university: 'University of Agder', country: 'NO', sourceUrl: 'https://libguides.uia.no/SurveyXact', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'questionpro',
    name: 'QuestionPro',
    website: 'https://www.questionpro.com',
    category: 'survey',
    listings: [
      { university: 'University of Western Australia', country: 'AU', sourceUrl: 'https://guides.library.uwa.edu.au/surveytools/Qualtrics', retrievedAt: '2026-08-13' },
    ],
  },
  {
    id: 'sunet-survey',
    name: 'Sunet Survey',
    website: 'https://www.sunet.se',
    category: 'survey',
    listings: [
      { university: 'University of Gothenburg', country: 'SE', sourceUrl: 'https://medarbetarportalen.gu.se/internt-uf/Kommunikation/webbenkatverktyg', retrievedAt: '2026-08-12' },
    ],
  },
]

// The 2026-08-21 Swedish and Nordic sweeps: new tools are appended whole;
// patches for existing ids only add listings for universities not already
// present, so the base entries keep their names, categories and earlier
// citations. Later patches for an id added by an earlier sweep merge into it.
const merge = (patches: typeof SE_SWEEP) => {
  for (const patch of patches) {
    const existing = PEER_TOOLS.find((t) => t.id === patch.id)
    if (!existing) {
      PEER_TOOLS.push({ id: patch.id, name: patch.name, website: patch.website, category: patch.category, vendorId: patch.vendorId, listings: patch.listings.map((l) => ({ ...l })) })
      continue
    }
    for (const l of patch.listings) {
      const same = existing.listings.find((x) => x.university === l.university)
      if (!same) existing.listings.push({ ...l })
    }
  }
}
merge([...SE_SWEEP, ...NORDIC_SWEEP])

/**
 * Tools narrowed to one country's listings; tools with none are dropped.
 * No country (the global English locale) returns the full dataset.
 */
export function peerToolsForCountry(country?: string): PeerTool[] {
  if (!country) return PEER_TOOLS
  return PEER_TOOLS.map((tool) => ({
    ...tool,
    listings: tool.listings.filter((l) => l.country === country),
  })).filter((tool) => tool.listings.length > 0)
}

/** Distinct universities present in the dataset (per country). */
export function peerUniversities(country?: string, opts: { publicOnly?: boolean } = {}): string[] {
  const set = new Set<string>()
  for (const tool of PEER_TOOLS)
    for (const l of tool.listings)
      if ((!country || l.country === country) && (!opts.publicOnly || l.sourceUrl)) set.add(l.university)
  return [...set].sort()
}

/** Countries with at least one listing, for the directory's country filter. */
export function peerCountries(): string[] {
  return [...new Set(PEER_TOOLS.flatMap((t) => t.listings.map((l) => l.country)))].sort()
}

/**
 * Public listings for a demo/assessed vendor id, for the compare view.
 */
export function peerListingsForVendor(vendorId: string): PeerTool | undefined {
  const tool = PEER_TOOLS.find((t) => t.vendorId === vendorId)
  if (!tool) return undefined
  const listings = tool.listings.filter((l) => l.sourceUrl)
  return listings.length ? { ...tool, listings } : undefined
}
