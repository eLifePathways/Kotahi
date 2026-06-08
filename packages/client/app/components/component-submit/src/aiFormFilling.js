import { gql } from '@apollo/client'

/**
 * @typedef {Object} AiConfig
 * @property {boolean} AiOn
 *
 * @typedef {Object} File
 * @property {string} name
 *
 * @typedef {Object} FormComponentConfig
 * @property {string} name - e.g. submission.$title or submission.$abstract
 * @property {string?} component
 * @property {string} aiPrompt - The AI prompt for the component

 * @typedef {Object} GetSubmissionFormComponentsStructure
 * @property {FormComponentConfig[]} children
 *
 * @typedef {Object} GetSubmissionFormComponentsFormForPurposeAndCategoryResult
 * @property {GetSubmissionFormComponentsStructure} structure
 *
 * @typedef {Object} GetSubmissionFormComponentsData
 * @property {GetSubmissionFormComponentsFormForPurposeAndCategoryResult} formForPurposeAndCategory
 *
 * @typedef {Object} GetSubmissionFormComponentsResponse
 * @property {GetSubmissionFormComponentsData} data
 */

const GET_SUBMISSION_FORM_COMPONENTS_QUERY = gql`
  query FormForPurposeAndCategory($groupId: ID!) {
    formForPurposeAndCategory(
      purpose: "submit"
      category: "submission"
      groupId: $groupId
    ) {
      structure {
        children {
          name
          component
          aiPrompt
        }
      }
    }
  }
`

const EXTRACT_USING_OPEN_AI_TEXT_MODEL = gql`
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

export const AUTHORS_INPUT_RESPONSE_SHAPE = [
  {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    middleName: 'Middle name',
    orcid: 'ORCID',
  },
]

export const RESPONSE_SHAPE_BY_COMPONENT = {
  AuthorsInput: AUTHORS_INPUT_RESPONSE_SHAPE,
}

export const MAIN_EXTRACTION_PROMPT =
  'You are an AI assistant that extracts data from HTML documents as JSON.\nIf information is unclear or missing, mark it as null.'

const generateTitle = name =>
  name
    .replace(/[_-]+/g, ' ') // convert hyphens/underscores to space
    .replace(/\.[^.]+$/, '') // remove file extension

// TODO: preserve italics (use parse5?)
const extractTitle = source => {
  const doc = new DOMParser().parseFromString(source, 'text/html')
  const heading = doc.querySelector('h1')

  return heading ? heading.textContent : null
}

/**
 * @param {GetSubmissionFormComponentsResponse} result
 * @returns {FormComponentConfig[]}
 */
export const getAiEnabledSubmissionFormComponentsConfigFromResult = result => {
  return result.data.formForPurposeAndCategory.structure.children.filter(
    componentConfig => componentConfig.aiPrompt,
  )
}

/**
 * @param {ApolloClient} client
 * @param {string} groupId
 * @returns {Promise<FormComponentConfig[]>}
 */
export const getAiEnabledSubmissionFormComponentsConfigPromise = async (
  client,
  groupId,
) => {
  const result = await client.query({
    query: GET_SUBMISSION_FORM_COMPONENTS_QUERY,
    variables: { groupId },
    fetchPolicy: 'network-only',
  })

  return getAiEnabledSubmissionFormComponentsConfigFromResult(result)
}

/**
 * @param {string} name
 * @returns {string}
 */
const getResponseFieldNameForFormComponentName = name => {
  const parts = name.split('.')
  return parts[parts.length - 1]
}

/**
 * @param {FormComponentConfig} componentConfig
 * @returns {string | object}
 */
const getResponseValueForFormComponentConfig = componentConfig => {
  return (
    RESPONSE_SHAPE_BY_COMPONENT[componentConfig.component] ||
    componentConfig.aiPrompt
  )
}

/**
 * @param {FormComponentConfig[]} componentsConfig
 * @returns {object}
 */
export const getResponseShapeForFormComponentConfigList = componentsConfig => {
  return componentsConfig.reduce((accumulator, config) => {
    return {
      ...accumulator,
      [getResponseFieldNameForFormComponentName(config.name)]:
        getResponseValueForFormComponentConfig(config),
    }
  }, {})
}

/**
 * @param {FormComponentConfig[]} componentsConfig
 * @returns {string}
 */
export const getExtractionPrompt = componentsConfig => {
  const aiPromptNotInResponseShapeComponentsConfig = componentsConfig.filter(
    ({ component }) => !!RESPONSE_SHAPE_BY_COMPONENT[component],
  )

  if (aiPromptNotInResponseShapeComponentsConfig.length === 0) {
    return MAIN_EXTRACTION_PROMPT
  }

  const additionalAiPrompts = aiPromptNotInResponseShapeComponentsConfig
    .map(
      ({ name, aiPrompt }) =>
        `- \`${getResponseFieldNameForFormComponentName(name)}\`: ${aiPrompt}`,
    )
    .join('\n')

  return `${MAIN_EXTRACTION_PROMPT}\n\nDescriptions of the fields:\n${additionalAiPrompts}`
}

/**
 * @param {string} html
 * @returns {string}
 */
export const getHtmlForAi = html => {
  return html.replace(/"data:[^"]*"/g, '""')
}

/**
 * @param {string} response
 * @param {string} groupId
 * @param {FormComponentConfig[]} componentsConfig
 * @returns {object}
 */
export const getExtractUsingAiVariables = (
  response,
  groupId,
  componentsConfig,
) => {
  const input = {
    text: getExtractionPrompt(componentsConfig),
  }

  const htmlForAi = getHtmlForAi(response)

  const history = [
    {
      role: 'user',
      content: `HTML:\n${htmlForAi}`,
    },
  ]

  const responseShape =
    getResponseShapeForFormComponentConfigList(componentsConfig)

  const format = 'json_object'

  const system = {
    context: '',
    response: {
      shape: JSON.stringify(responseShape),
      type: 'json',
    },
  }

  return { input, groupId, history, system, format }
}

/**
 * @param {object} result
 * @returns {object}
 */
export const getSubmissionDataFromOpenAiQueryResult = result => {
  const {
    data: { openAi },
  } = result

  const {
    message: { content },
  } = JSON.parse(openAi)

  return JSON.parse(content)
}

/**
 * @param {string} response
 * @param {ApolloClient} client
 * @param {string} groupId
 * @returns {Promise<object>}
 */
export const getExtractedSubmissionUsingAiPromise = async (
  response,
  client,
  groupId,
) => {
  const componentsConfig =
    await getAiEnabledSubmissionFormComponentsConfigPromise(client, groupId)

  if (componentsConfig.length === 0) {
    return {}
  }

  const variables = getExtractUsingAiVariables(
    response,
    groupId,
    componentsConfig,
  )

  const result = await client.query({
    query: EXTRACT_USING_OPEN_AI_TEXT_MODEL,
    variables,
    fetchPolicy: 'network-only',
  })

  const submission = getSubmissionDataFromOpenAiQueryResult(result)

  return submission
}

/**
 * @param {File} file
 * @param {string} response
 * @param {object} submission
 * @returns {object}
 */
export const getSubmissionWithDefaultTitleIfNotPresent = (
  file,
  response,
  submission,
) => {
  if (submission.$title) {
    return submission
  }

  return {
    ...submission,
    $title: extractTitle(response) || generateTitle(file.name),
  }
}

/**
 * @param {File} file
 * @param {string} response
 * @param {ApolloClient} client
 * @param {string} groupId
 * @param {AiConfig} aiConfig
 * @returns {Promise<object>}
 */
export const getInitialSubmissionDataForFilePromise = async (
  file,
  response,
  client,
  groupId,
  aiConfig,
) => {
  let submission = {}

  if (aiConfig.AiOn) {
    try {
      submission = await getExtractedSubmissionUsingAiPromise(
        response,
        client,
        groupId,
      )
    } catch (error) {
      console.error(
        'AI extraction failed, falling back to regular title extraction',
        error,
      )
    }
  }

  return getSubmissionWithDefaultTitleIfNotPresent(file, response, submission)
}

export const getInitialSubmissionDataWithoutFile = () => {
  return { $title: `New submission ${new Date().toLocaleString()}` }
}
