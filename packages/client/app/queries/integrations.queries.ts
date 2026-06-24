import { gql } from '@apollo/client'

export const VALIDATE_DOI = gql`
  query validateDOI($doiOrUrl: String) {
    validateDOI(doiOrUrl: $doiOrUrl) {
      isDOIValid
    }
  }
`

export const VALIDATE_SUFFIX = gql`
  query validateSuffix($suffix: String, $groupId: ID!) {
    validateSuffix(suffix: $suffix, groupId: $groupId) {
      isDOIValid
    }
  }
`

export const VALIDATE_ORCID = gql`
  query OrcidValidate($input: String!) {
    orcidValidate(input: $input)
  }
`

export const CHAT_GPT = gql`
  query OpenAi(
    $input: UserMessage!
    $groupId: ID!
    $history: [OpenAiMessage]
    $system: SystemMessage
    $format: String
  ) {
    openAi(
      input: $input
      groupId: $groupId
      history: $history
      format: $format
      system: $system
    )
  }
`

export const EXTRACT_USING_OPEN_AI_TEXT_MODEL = gql`
  query OpenAi(
    $input: UserMessage!
    $groupId: ID!
    $history: [OpenAiMessage]
    $system: SystemMessage
    $format: String
  ) {
    openAi(
      input: $input
      groupId: $groupId
      history: $history
      format: $format
      system: $system
    )
  }
`

export const SEARCH_ROR = gql`
  query SearchRor($input: String!) {
    searchRor(input: $input) {
      id
      name
    }
  }
`

export const GET_COAR_NOTIFICATIONS_FOR_MANUSCRIPT = gql`
  query GetCoarNotificationsForManuscript($manuscriptId: ID!) {
    coarNotificationsForManuscript(manuscriptId: $manuscriptId) {
      id
      manuscriptId
      payload
      created
    }
  }
`

export const GENERATE_NEW_COAR_AUTH_TOKEN = gql`
  mutation GenerateNewToken($name: String!, $groupId: ID!) {
    generateNewToken(name: $name, groupId: $groupId)
  }
`

export const GET_ANYSTYLE_CSL = gql`
  query BuildCitationsCSL($textReferences: String!) {
    buildCitationsCSL(textReferences: $textReferences) {
      cslReferences
      error
    }
  }
`

export const GET_CROSSREF = gql`
  query GetFormattedReferences($input: CitationSearchInput) {
    getFormattedReferences(input: $input) {
      success
      message
      matches {
        doi
        author {
          given
          family
          sequence
        }
        issue
        issued {
          raw
        }
        page
        title
        volume
        journalTitle
        formattedCitation
        citeHtml
      }
    }
  }
`

export const GET_DATACITE = gql`
  query GetDataciteCslFromDOI($input: CitationSearchInput) {
    getDataciteCslFromDOI(input: $input) {
      success
      message
      matches {
        doi
        author {
          given
          family
          sequence
        }
        issue
        issued {
          raw
        }
        page
        title
        volume
        journalTitle
        formattedCitation
      }
    }
  }
`

export const GET_CITE_PROC = gql`
  query FormatCitation($citation: String!) {
    formatCitation(citation: $citation) {
      formattedCitation
      citeHtml
      error
    }
  }
`

export const GET_CALLOUT_TEXT = gql`
  query FormatMultipleCitations($input: CitationData) {
    formatMultipleCitations(input: $input) {
      orderedCitations
      calloutTexts {
        id
        text
      }
      orderedReferenceIds
      error
    }
  }
`

export const SEARCH_LOCAL_CONTEXT = gql`
  query searchLocalContext($input: InputSearchlocalContext!) {
    searchLocalContext(input: $input) {
      localContext {
        id
        notice {
          id
          identifier
          noticeType
          name
          imgUrl
          svgUrl
          defaultText
        }
        label {
          id
          identifier
          name
          labelType
          language
          languageTag
          labelText
          imgUrl
          svgUrl
        }
      }
      errorMessage
      errorCode
    }
  }
`

export const REFRESH_ADA_STATUS = gql`
  mutation RefreshAdaStatus($id: ID!) {
    refreshAdaStatus(id: $id) {
      id
      submission
    }
  }
`

export const UPDATE_ADA = gql`
  mutation UpdateAda($id: ID!, $adaState: String!) {
    updateAda(id: $id, adaState: $adaState) {
      manuscript {
        id
        published
      }
      steps {
        stepLabel
        succeeded
        errorMessage
        errorDetails
      }
    }
  }
`

export const CHECK_API_PAYLOAD = gql`
  query CheckApiPayload($id: String!, $api: String!) {
    checkApiPayload(id: $id, api: $api)
  }
`
