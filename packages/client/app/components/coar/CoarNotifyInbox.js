import React from 'react'
import { useTranslation } from 'react-i18next'
import CoarMessages from '../component-review/src/components/coar/CoarMessages'
import {
  Container,
  FlexRow,
  Heading,
  Pagination,
  PaginationContainerShadowed,
} from '../shared'
import SearchControl from '../component-manuscripts/src/SearchControl'
import { URI_PAGENUM_PARAM, URI_SEARCH_PARAM } from '../../shared/urlParamUtils'

const CoarNotifyInbox = ({
  applyQueryParams,
  config = {},
  currentSearchPage,
  currentSearchQuery,
  loading,
  messageLimit,
  messages,
  onResendCoarNotifyPayload,
  totalMessageCount,
}) => {
  const { t } = useTranslation()

  return (
    <Container>
      <FlexRow>
        <Heading>{t('coarNotifyInboxPage.title')}</Heading>
        <SearchControl
          applySearchQuery={newQuery =>
            applyQueryParams({
              [URI_PAGENUM_PARAM]: 1,
              [URI_SEARCH_PARAM]: newQuery,
            })
          }
          currentSearchQuery={currentSearchQuery}
        />
      </FlexRow>
      <div>
        <CoarMessages
          collapsible
          config={config}
          loading={loading}
          messages={messages}
          onResendCoarNotifyPayload={onResendCoarNotifyPayload}
        />
        {!loading && (
          <Pagination
            limit={messageLimit}
            page={currentSearchPage}
            PaginationContainer={PaginationContainerShadowed}
            setPage={newPage =>
              applyQueryParams({ [URI_PAGENUM_PARAM]: newPage })
            }
            totalCount={totalMessageCount}
          />
        )}
      </div>
    </Container>
  )
}

export default CoarNotifyInbox
