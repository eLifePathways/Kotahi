import { gql } from '@apollo/client'

export const DOCX_TO_HTML = gql`
  query DocxToHtml($key: String!) {
    docxToHtml(key: $key) {
      html
      error
    }
  }
`

export const CONVERT_TO_JATS = gql`
  query ConvertToJats($manuscriptId: String!) {
    convertToJats(manuscriptId: $manuscriptId) {
      xml
      zipLink
      error
    }
  }
`

export const CONVERT_TO_PDF = gql`
  query ConvertToPdf($manuscriptId: String!, $useHtml: Boolean) {
    convertToPdf(manuscriptId: $manuscriptId, useHtml: $useHtml) {
      pdfUrl
    }
  }
`

export const UPDATE_TAB = gql`
  mutation UpdateRecentTab($tab: String) {
    updateRecentTab(tab: $tab) {
      id
      recentTab
    }
  }
`

export const UPDATE_MENU = gql`
  mutation UpdateMenu($expanded: Boolean!) {
    updateMenuUI(expanded: $expanded) {
      id
      menuPinned
    }
  }
`
