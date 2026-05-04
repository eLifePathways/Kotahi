/* eslint-disable promise/always-return, promise/no-callback-in-promise */

import { useQuery } from '@apollo/client'
import { SEARCH_ROR } from '../../userManuscriptFormQuery'
import { VALIDATE_ORCID } from '../../../../../shared/commsUtils'

// TODO: refactor and move to Pages
const useAuthorsFieldQueries = () => {
  const { refetch: rorSearch } = useQuery(SEARCH_ROR, { skip: true })

  const { refetch } = useQuery(VALIDATE_ORCID, {
    skip: true,
  })

  const searchRor = filterOptions => (inputValue, callback) => {
    const variables = {
      input: inputValue,
    }

    return rorSearch(variables)
      .then(response => {
        callback(filterOptions(response))
      })
      .catch(error => console.error(error))
  }

  const validationOrcid = inputValue => {
    const variables = {
      input: inputValue,
    }

    return refetch(variables)
  }

  return { validationOrcid, searchRor }
}

export default useAuthorsFieldQueries
