/* eslint-disable react/prop-types */

import ReactPagination from 'react-paginate'
import styled from 'styled-components'
import { th, grid } from '@coko/client'
import { Trans, useTranslation } from 'react-i18next'

const PaginationInfo = styled.div`
  strong {
    font-weight: 500;
  }
`

export const PaginationContainer = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: ${grid(2)} ${grid(3)};
`

export const PaginationContainerShadowed = styled(PaginationContainer)`
  background-color: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
`

const Styles = styled.div`
  .pagination {
    align-items: center;
    background-color: ${th('colorBackground')};
    border-radius: ${th('borderRadius')};
    box-shadow: ${th('boxShadow')};
    display: flex;
    flex-wrap: wrap;
    justify-content: start;

    li {
      border: 1px solid ${th('colorFurniture')};
      cursor: pointer;
      list-style-type: none;
      margin-left: -1px;
      text-align: center;
    }

    a {
      display: block;
      padding: ${grid(1)} ${grid(2)};
    }
  }

  .active {
    background-color: #eee;
  }
`

export const Pagination = ({
  setPage,
  limit,
  page,
  totalCount,
  // eslint-disable-next-line no-shadow
  PaginationContainer,
}) => {
  const { t } = useTranslation()

  // e.g. Get [1,2,3] from totalCount 9, limit 3
  const pages = [...new Array(Math.ceil(totalCount / limit)).keys()].map(
    p => p + 1,
  )

  const firstResult = (page - 1) * limit + 1
  const lastResult = Math.min((page - 1) * limit + limit, totalCount)

  return (
    <PaginationContainer>
      <PaginationInfo>
        {totalCount > 0 ? (
          <Trans
            count={totalCount}
            i18nKey="manuscriptsTable.pagination"
            values={{
              firstResult,
              lastResult,
              totalCount,
            }}
          />
        ) : (
          t('manuscriptsTable.No results found')
        )}
      </PaginationInfo>
      <Styles>
        <ReactPagination
          activeClassName="active"
          containerClassName="pagination"
          disableInitialCallback
          initialPage={page - 1}
          marginPagesDisplay={3}
          nextLabel=">"
          onPageChange={nmb => setPage(nmb.selected + 1)}
          pageCount={pages.length}
          pageRangeDisplayed={9}
          previousLabel="<"
        />
      </Styles>
    </PaginationContainer>
  )
}
