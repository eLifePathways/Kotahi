import React from 'react'
import { useTranslation } from 'react-i18next'
import CoarMessages from '../component-review/src/components/coar/CoarMessages'
import { Container, FlexRow, Heading } from '../shared'
import SearchControl from '../component-manuscripts/src/SearchControl'

const CoarNotifyInbox = ({
  config = {},
  loading,
  messages,
  onResendCoarNotifyPayload,
}) => {
  const { t } = useTranslation()
  return (
    <Container>
      <FlexRow>
        <Heading>{t('coarNotifyInboxPage.title')}</Heading>
        {/* <ControlsCon */}
        <SearchControl />
      </FlexRow>
      <CoarMessages
        collapsible
        config={config}
        loading={loading}
        messages={messages}
        onResendCoarNotifyPayload={onResendCoarNotifyPayload}
      />
    </Container>
  )
}

export default CoarNotifyInbox
