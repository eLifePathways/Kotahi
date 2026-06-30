/* eslint-disable react-hooks/static-components */
/* eslint-disable react/prop-types */
/* eslint-disable new-cap */

import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import User from './User'
import {
  Table,
  Header,
  Content,
  Pagination,
  PaginationContainer,
  SortUp,
  SortDown,
  TightRow,
} from '../../shared'
import Page from '../../../ui/shared/Page'

const StyledTable = styled(Table)`
  border-radius: 0;
  border-width: 0;
  margin-top: 0;
`

const HeaderCell = styled.th`
  cursor: pointer;
`

const UsersTable = ({
  changeSort,
  currentUser,
  deleteUser,
  limit,
  page,
  setGlobalRole,
  setGroupRole,
  setPage,
  sortDirection,
  sortName,
  totalCount,
  users,
}) => {
  const SortHeader = ({ thisSortName, children }) => {
    const UpDown = () => {
      if (thisSortName !== sortName) return null
      return sortDirection === 'ASC' ? <SortDown /> : <SortUp />
    }

    return thisSortName ? (
      <HeaderCell onClick={() => changeSort(thisSortName)}>
        <TightRow>
          {children} {UpDown()}
        </TightRow>
      </HeaderCell>
    ) : (
      <th>
        <TightRow>{children}</TightRow>
      </th>
    )
  }

  const { t } = useTranslation()

  return (
    <Page title={t('usersTable.Users')}>
      <Content>
        <StyledTable>
          <Header>
            <tr>
              <SortHeader thisSortName="username">
                {t('usersTable.Name')}
              </SortHeader>
              <SortHeader thisSortName="created">
                {t('usersTable.Created')}
              </SortHeader>
              <SortHeader thisSortName="lastOnline">
                {t('usersTable.Last Online')}
              </SortHeader>
              <SortHeader>{t('usersTable.Roles')}</SortHeader>
              {}
              <th />
            </tr>
          </Header>
          <tbody>
            {users.map(user => (
              <User
                currentUser={currentUser}
                deleteUser={deleteUser}
                key={user.id}
                setGlobalRole={setGlobalRole}
                setGroupRole={setGroupRole}
                user={user}
              />
            ))}
          </tbody>
        </StyledTable>

        <Pagination
          limit={limit}
          page={page}
          PaginationContainer={PaginationContainer}
          setPage={setPage}
          totalCount={totalCount}
        />
      </Content>
    </Page>
  )
}

export default UsersTable
