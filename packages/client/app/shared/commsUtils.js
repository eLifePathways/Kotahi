import { gql } from '@apollo/client'

const VALIDATE_DOI = gql`
  query validateDOI($doiOrUrl: String) {
    validateDOI(doiOrUrl: $doiOrUrl) {
      isDOIValid
    }
  }
`

/** 2nd-order function to get a validator for DOIs.
 * E.g. `const errorMessage = validateDoi(client)(value)`
 * If value is not a valid, existing DOI, return an error string for display.
 * Else return undefined. This contacts the server for the result,
 * which in turn attempts to retrieve the DOI.
 */

export const validateDoi = client => async value => {
  return client
    .query({
      query: VALIDATE_DOI,
      variables: {
        doiOrUrl: value,
      },
    })
    .then(result => {
      if (!result.data.validateDOI.isDOIValid) return 'DOI is invalid'
      return undefined
    })
}

const VALIDATE_SUFFIX = gql`
  query validateSuffix($suffix: String, $groupId: ID!) {
    validateSuffix(suffix: $suffix, groupId: $groupId) {
      isDOIValid
    }
  }
`

// TODO: Test this changes refelect as expected in sandbox crossref
export const validateSuffix = (client, groupId) => async value => {
  const res = await client.query({
    query: VALIDATE_SUFFIX,
    variables: {
      suffix: value,
      groupId,
    },
  })

  if (res.data.validateSuffix.isDOIValid) {
    return null
  }

  return 'Suffix is invalid or not available'
}

export const VALIDATE_ORCID = gql`
  query ($input: String!) {
    orcidValidate(input: $input)
  }
`
