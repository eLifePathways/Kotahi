/* eslint-disable */

const { formatCitation } = require('../reference')
const { Config } = require('../../models')

const doiResult = {
  doi: '10.1159/000345136',
  author: [
    { given: 'José A.', family: 'Luchsinger', sequence: 'first' },
    { given: 'Mary L.', family: 'Biggs', sequence: 'additional' },
    { given: 'Jorge R.', family: 'Kizer', sequence: 'additional' },
    { given: 'Joshua', family: 'Barzilay', sequence: 'additional' },
    { given: 'Annette', family: 'Fitzpatrick', sequence: 'additional' },
    { given: 'Anne', family: 'Newman', sequence: 'additional' },
    {
      given: 'William T.',
      family: 'Longstreth',
      sequence: 'additional',
    },
    { given: 'Oscar', family: 'Lopez', sequence: 'additional' },
    { given: 'David', family: 'Siscovick', sequence: 'additional' },
    { given: 'Lewis', family: 'Kuller', sequence: 'additional' },
  ],
  page: '274-281',
  issue: '4',
  volume: '40',
  title: 'Adiposity and Cognitive Decline in the Cardiovascular Health Study',
  journalTitle: 'Neuroepidemiology',
}

const formattedResult =
  '<p class="ref">Luchsinger, J. A., Biggs, M. L., Kizer, J. R., Barzilay, J., Fitzpatrick, A., Newman, A., … Kuller, L. (n.d.). <i>Adiposity and Cognitive Decline in the Cardiovascular Health Study</i>.</p>'

const getTestValues = async () => {
  const activeConfig = await Config.query().first()
  const { groupId } = activeConfig

  // This is being done to get an async result in the test, which might not be async?
  const response1 = await formatCitation(doiResult, groupId)
  return { response1 }
}

describe('checkFormatting', () => {
  const { response1 } = getTestValues()
  // Note that this test is dependent on the styleguide & locale passed to formatCitation being what was
  // used to create formattedResult. If the styleguide or locale changes, this test will fail.
  test('formatted correctly', () => {
    expect(response1?.result).toEqual(formattedResult)
  })
})
