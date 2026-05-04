/* eslint-disable react/prop-types */

import { gql, useQuery, useMutation } from '@apollo/client'
import { CommsErrorBanner, Spinner } from '../../shared'
import {
  extractSortData,
  URI_PAGENUM_PARAM,
  URI_SORT_PARAM,
  useQueryParams,
} from '../../../shared/urlParamUtils'
import UsersTable from './UsersTable'

const defaultSortDirections = {
  username: 'ASC',
  created: 'DESC',
  lastOnline: 'DESC',
  groupManager: 'ASC',
}

export const GET_USERS = gql`
  query Users($sort: UsersSort, $offset: Int, $limit: Int) {
    paginatedUsers(sort: $sort, offset: $offset, limit: $limit) {
      totalCount
      users {
        id
        username
        globalRoles
        groupRoles
        email
        profilePicture
        defaultIdentity {
          id
          identifier
        }
        created
        isOnline
        lastOnline
      }
    }
  }
`

const DELETE_USER = gql`
  mutation ($id: ID) {
    deleteUser(id: $id) {
      id
    }
  }
`

const SET_GLOBAL_ROLE = gql`
  mutation ($userId: ID!, $role: String!, $shouldEnable: Boolean!) {
    setGlobalRole(userId: $userId, role: $role, shouldEnable: $shouldEnable) {
      id
      groupRoles
      globalRoles
    }
  }
`

const SET_GROUP_ROLE = gql`
  mutation ($userId: ID!, $role: String!, $shouldEnable: Boolean!) {
    setGroupRole(userId: $userId, role: $role, shouldEnable: $shouldEnable) {
      id
      groupRoles
      globalRoles
    }
  }
`

const UsersPage = ({ history, currentUser }) => {
  const applyQueryParams = useQueryParams()

  const params = new URLSearchParams(history.location.search)
  const page = params.get(URI_PAGENUM_PARAM) || 1
  const sortName = extractSortData(params).name || 'created'
  const sortDirection = extractSortData(params).direction || 'DESC'
  const limit = 10
  const sort = sortName && sortDirection && `${sortName}_${sortDirection}`

  const { loading, error, data, refetch } = useQuery(GET_USERS, {
    variables: {
      sort,
      offset: (page - 1) * limit,
      limit,
    },
    fetchPolicy: 'cache-and-network',
  })

  const [deleteUser] = useMutation(DELETE_USER, { onCompleted: refetch })
  const [setGroupRole] = useMutation(SET_GROUP_ROLE)
  const [setGlobalRole] = useMutation(SET_GLOBAL_ROLE)

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const { users, totalCount } = data.paginatedUsers

  const setPage = newPage => applyQueryParams({ [URI_PAGENUM_PARAM]: newPage })

  const changeSort = async newSortName => {
    let newSortDirection

    if (newSortName !== sortName) {
      newSortDirection = defaultSortDirections[newSortName] || 'ASC'
    } else if (sortDirection === 'ASC') {
      newSortDirection = 'DESC'
    } else if (sortDirection === 'DESC') {
      newSortDirection = 'ASC'
    }

    applyQueryParams({
      [URI_SORT_PARAM]: `${newSortName}_${newSortDirection}`,
      [URI_PAGENUM_PARAM]: 1,
    })
  }

  return (
    <UsersTable
      changeSort={changeSort}
      currentUser={currentUser}
      deleteUser={deleteUser}
      limit={limit}
      page={page}
      setGlobalRole={setGlobalRole}
      setGroupRole={setGroupRole}
      setPage={setPage}
      sortDirection={sortDirection}
      sortName={sortName}
      totalCount={totalCount}
      users={users}
    />
  )
}

export default UsersPage
