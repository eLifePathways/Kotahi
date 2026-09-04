import { useNavigate, useLocation } from 'react-router-dom'

export const URI_SEARCH_PARAM = 'search'
export const URI_PAGENUM_PARAM = 'pagenum'
export const URI_SORT_PARAM = 'sort'

/**
 * Extracts sortName and sortDirection from url query param of the form <sort_name>_<sort_direction>
 *
 * @param {URLSearchParams} params
 */
export const extractSortData = params => ({
  name: params.get(URI_SORT_PARAM)?.split('_')[0],
  direction: params.get(URI_SORT_PARAM)?.split('_')[1],
})

/**
 * Extracts filters from query param and returns them as [{field, value}]
 *
 * @param {URLSearchParams} params
 */
export const extractFilters = params =>
  Array.from(params.keys())
    .filter(field => field !== URI_PAGENUM_PARAM && field !== URI_SORT_PARAM)
    .map(field => ({ field, value: params.get(field) }))

/**
 * Custom hook to return a function that can load a new page with certain URI query params
 */
export const useQueryParams = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const applyQueryParams = queryParams => {
    const params = new URLSearchParams(window.location.search)
    Object.entries(queryParams).forEach(([fieldName, fieldValue]) => {
      if (fieldValue) params.set(fieldName, fieldValue)
      else params.delete(fieldName)
    })

    navigate({
      pathname: location.pathname,
      search: `?${params}`,
    })
  }

  return applyQueryParams
}
