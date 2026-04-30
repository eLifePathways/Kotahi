/* eslint-disable */

/**
 * @import {ApolloClient} from '@apollo/client'
 */

import {
  getAiEnabledSubmissionFormComponentsConfigFromResult,
  getResponseShapeForFormComponentConfigList,
  getExtractionPrompt,
  getHtmlForAi,
  getExtractUsingAiVariables,
  getSubmissionDataFromOpenAiQueryResult,
  getSubmissionWithDefaultTitleIfNotPresent,
  getInitialSubmissionDataForFilePromise,
  AUTHORS_INPUT_RESPONSE_SHAPE,
  MAIN_EXTRACTION_PROMPT,
} from '../aiFormFilling'

const RESPONSE_1 = 'HTML response 1'
const GROUP_ID_1 = 'group_id_1'
const SUBMISSION_1 = { $title: 'Submission Title 1' }

const COMPONENT_CONFIG_1 = {
  name: 'submission.$title',
  component: 'TextField',
  aiPrompt: 'The title',
}

const COMPONENTS_CONFIG_1 = [COMPONENT_CONFIG_1]

const AUTHORS_INPUT_COMPONENT_CONFIG_1 = {
  name: 'submission.$authors',
  component: 'AuthorsInput',
  aiPrompt: 'The authors',
}

const FILE_1 = { name: 'File 1.docx' }

const EMPTY_SUBMISSION = {}

describe('getAiEnabledSubmissionFormComponentsConfigFromResult', () => {
  test('should extract components config from children', () => {
    const componentsConfig =
      getAiEnabledSubmissionFormComponentsConfigFromResult({
        data: {
          formForPurposeAndCategory: {
            structure: {
              children: COMPONENTS_CONFIG_1,
            },
          },
        },
      })

    expect(componentsConfig).toEqual(COMPONENTS_CONFIG_1)
  })

  test('should ignore components without ai prompt', () => {
    const componentsConfig =
      getAiEnabledSubmissionFormComponentsConfigFromResult({
        data: {
          formForPurposeAndCategory: {
            structure: {
              children: [
                {
                  ...COMPONENT_CONFIG_1,
                  aiPrompt: null,
                },
              ],
            },
          },
        },
      })

    expect(componentsConfig).toEqual([])
  })
})

describe('getResponseShapeForFormComponentConfigList', () => {
  test('should generate simple response shape for title AI prompt', () => {
    const responseShape = getResponseShapeForFormComponentConfigList([
      {
        ...COMPONENT_CONFIG_1,
        name: 'submission.$title',
        aiPrompt: 'The title',
      },
    ])

    expect(responseShape).toEqual({
      $title: 'The title',
    })
  })

  test('should generate nested response shape for AuthorsInput', () => {
    const responseShape = getResponseShapeForFormComponentConfigList([
      AUTHORS_INPUT_COMPONENT_CONFIG_1,
    ])

    expect(responseShape).toEqual({
      $authors: AUTHORS_INPUT_RESPONSE_SHAPE,
    })
  })
})

describe('getExtractionPrompt', () => {
  test('should return main extraction prompt', () => {
    const prompt = getExtractionPrompt([COMPONENT_CONFIG_1])

    expect(prompt).toEqual(MAIN_EXTRACTION_PROMPT)
  })

  test('should add authors ai prompt to main extraction prompt', () => {
    const responseFieldName = '$authors'
    const { aiPrompt } = AUTHORS_INPUT_COMPONENT_CONFIG_1
    const name = `submission.${responseFieldName}`

    const prompt = getExtractionPrompt([
      { ...AUTHORS_INPUT_COMPONENT_CONFIG_1, name },
    ])

    expect(prompt).toEqual(
      `${MAIN_EXTRACTION_PROMPT}\n\nDescriptions of the fields:\n- \`${responseFieldName}\`: ${aiPrompt}`,
    )
  })
})

describe('getHtmlForAi', () => {
  test('should return passed in html as is if it does not contain data', () => {
    const htmlForAi = getHtmlForAi('<h1>The title</h1>')

    expect(htmlForAi).toEqual('<h1>The title</h1>')
  })

  test('should replace data attribute value with empty string', () => {
    const htmlForAi = getHtmlForAi(
      '<h1>The title</h1><img alt="image" src="data:some data"/>',
    )

    expect(htmlForAi).toEqual('<h1>The title</h1><img alt="image" src=""/>')
  })

  test('should replace multiple data attribute value with empty string', () => {
    const htmlForAi = getHtmlForAi(
      '<h1>The title</h1><img alt="image1" src="data:some data"/><img alt="image2" src="data:some data"/>',
    )

    expect(htmlForAi).toEqual(
      '<h1>The title</h1><img alt="image1" src=""/><img alt="image2" src=""/>',
    )
  })
})

describe('getExtractUsingAiVariables', () => {
  test('should pass main extraction prompt as input', () => {
    const variables = getExtractUsingAiVariables(
      RESPONSE_1,
      GROUP_ID_1,
      COMPONENTS_CONFIG_1,
    )

    expect(variables.input).toEqual({
      text: MAIN_EXTRACTION_PROMPT,
    })
  })

  test('should include response html in history', () => {
    const variables = getExtractUsingAiVariables(
      RESPONSE_1,
      GROUP_ID_1,
      COMPONENTS_CONFIG_1,
    )

    expect(variables.history).toEqual([
      {
        role: 'user',
        content: `HTML:\n${RESPONSE_1}`,
      },
    ])
  })

  test('should use response shape based on form components', () => {
    const variables = getExtractUsingAiVariables(
      RESPONSE_1,
      GROUP_ID_1,
      COMPONENTS_CONFIG_1,
    )

    expect(variables.system.response.shape).toEqual(
      JSON.stringify(
        getResponseShapeForFormComponentConfigList(COMPONENTS_CONFIG_1),
      ),
    )
  })
})

describe('getSubmissionDataFromOpenAiQueryResult', () => {
  test('should return parsed content', () => {
    const submission = getSubmissionDataFromOpenAiQueryResult({
      data: {
        openAi: JSON.stringify({
          message: {
            content: JSON.stringify(SUBMISSION_1),
          },
        }),
      },
    })

    expect(submission).toEqual(SUBMISSION_1)
  })
})

describe('getSubmissionWithDefaultTitleIfNotPresent', () => {
  test('should use title from ai extracted submission', () => {
    const submission = getSubmissionWithDefaultTitleIfNotPresent(
      FILE_1,
      RESPONSE_1,
      {
        $title: 'The AI extracted title',
      },
    )

    expect(submission).toEqual({
      $title: 'The AI extracted title',
    })
  })

  test('should extract title from HTML if not extracted by AI', () => {
    const submission = getSubmissionWithDefaultTitleIfNotPresent(
      FILE_1,
      '<h1>This is the title</h1><div>Other content</div>',
      EMPTY_SUBMISSION,
    )

    expect(submission).toEqual({
      $title: 'This is the title',
    })
  })

  test('should use filename as title if not extracted by AI and not in HTML', () => {
    const submission = getSubmissionWithDefaultTitleIfNotPresent(
      { name: 'File 1.docx' },
      RESPONSE_1,
      EMPTY_SUBMISSION,
    )

    expect(submission).toEqual({
      $title: 'File 1',
    })
  })
})

describe('getInitialSubmissionDataForFilePromise', () => {
  test('should fallback to regular extraction if AI fails', async () => {
    /** @type {any} */
    const mockClient = {
      query: jest.fn().mockRejectedValue(new Error('AI extraction failed')),
    }

    const result = await getInitialSubmissionDataForFilePromise(
      FILE_1,
      RESPONSE_1,
      mockClient,
      GROUP_ID_1,
      { AiOn: true },
    )

    expect(result).toEqual(
      getSubmissionWithDefaultTitleIfNotPresent(FILE_1, RESPONSE_1, {}),
    )
  })
})
