import { useTranslation } from 'react-i18next'
import CoarMessages from '../component-review/src/components/coar/CoarMessages'
import { Container, FlexRow, Heading } from '../shared'
import SearchControl from '../component-manuscripts/src/SearchControl'

type CoarNotifyMessageProps = {
	id: string
  manuscriptId: string | null
  manuscript: any // Manuscript
  payload: string
  groupId: string | null
  created: Date
}

type CoarNotifyInboxProps = {
  config: any
  loading: boolean
  messages: CoarNotifyMessageProps[]
  onResendCoarNotifyPayload?: (
    payload: string,
  ) => Promise<{ reason?: string | null; success: boolean }>
}

const CoarNotifyInbox = ({
  config = {},
  loading,
  messages,
  onResendCoarNotifyPayload,
}: CoarNotifyInboxProps) => {
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
        onResendCoarNotifyPayload={onResendCoarNotifyPayload ?? null}
      />
    </Container>
  )
}

export default CoarNotifyInbox
