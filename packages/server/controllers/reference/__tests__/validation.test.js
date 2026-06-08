/* eslint-disable */

const {
  getMatchingReferencesFromCrossRef,
  getReferenceWithDoi,
} = require('../reference.controllers')

const crossrefRetrievalEmail = 'test@gmail.com'

const referenceMatches =
  'Fitzpatrick AL, Kuller LH, Lopez OL, Diehr P, O’Meara ES, Longstreth WT Jr, Luchsinger JA (2009): Midlife and late-life obesity and the risk of dementia: cardiovascular health study. Arch Neurol 66: 336–342.'

const referenceNoMatches = '!!!!!!'

const sampleDOI = '10.1159/000345136'

// This is what should come back from that DOI:

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

const getRefWrapper = async ref => {
  let response = null

  try {
    response = await getMatchingReferencesFromCrossRef(
      ref,
      3,
      crossrefRetrievalEmail,
    )
  } catch (error) {
    console.error('Response Error:', error.message)
  }

  return response
}

const getDOIWrapper = async doi => {
  let response = null

  try {
    response = await getReferenceWithDoi(doi, crossrefRetrievalEmail)
  } catch (error) {
    console.error('Response Error:', error.message)
  }

  return response
}

const getTestValues = async () => {
  const response1 = await getRefWrapper(referenceMatches)
  const response2 = await getRefWrapper(referenceNoMatches)
  const response3 = await getDOIWrapper(sampleDOI)
  return { response1, response2, response3 }
}

describe('checkCrossRefValidation', () => {
  const { response1, response2, response3 } = getTestValues()
  test('valid references', () => {
    expect(response1?.length).toEqual(3)
  })
  test('invalid references', () => {
    expect(response2?.length).toEqual(0)
  })
  test('get reference from DOI', () => {
    expect(JSON.stringify(response3)).toEqual(JSON.stringify(doiResult))
  })
})
