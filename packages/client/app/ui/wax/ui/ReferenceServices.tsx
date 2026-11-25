import { createContext, useContext } from 'react'

export type Csl = {
  formattedCitation?: string
  citeHtml?: string
  'citation-number'?: string
  author?: { given?: string; family?: string }[]
  title?: string
  'container-title'?: string
  journalTitle?: string
  doi?: string
  volume?: string
  issue?: string
  page?: string
  issued?: { raw?: string } | string
  [key: string]: unknown
}

export type DataciteResponse = { matches?: Csl[]; fromCrossref?: boolean }

export type ReferenceServices = {
  anyStyle?: (input: { content: string }) => Promise<string>
  crossRef?: (
    text: string,
    useDatacite: boolean,
    noDoi?: boolean,
  ) => Promise<Csl[] & DataciteResponse>
  citeProc?: (
    csl: Csl,
  ) => Promise<{ formattedCitation: string; citeHtml?: string }>
  updateCallout?: (
    references: { items: Record<string, unknown>[] },
    callouts: { citationID: string; citationItems: unknown[] }[],
  ) => Promise<{
    calloutTexts: { id: string; text: string }[]
    orderedReferenceIds: string[]
  }>
  getDataFromDatacite?: boolean
  readOnly?: boolean
  styleName?: string
}

const ReferenceServicesContext = createContext<ReferenceServices>({})

export const ReferenceServicesProvider = ReferenceServicesContext.Provider

export const useReferenceServices = (): ReferenceServices =>
  useContext(ReferenceServicesContext)
