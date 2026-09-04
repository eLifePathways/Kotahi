/* eslint-disable react/prop-types */

import { useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import { grid } from '@coko/client'
import Page from '../../../ui/shared/Page'
import ManuscriptsTable from '../../../ui/shared/ManuscriptsTable'
import useManuscriptsTable from '../../../pages/hooks/useManuscriptsTable'

import MessageContainer from '../../component-chat/src/MessageContainer'
import {
  ActionButton,
  Columns,
  CommsErrorBanner,
  Container,
  RoundIconButton,
  ScrollableContent,
  Spinner,
} from '../../shared'
import { ControlsContainer } from './style'
import { ConfigContext } from '../../config/src'

const OuterContainer = styled(Container)`
  overflow: hidden;
  padding: 0;
  height: 100%;
`

const ManuscriptsColumns = styled(Columns)`
  gap: ${grid(4)};
  height: 100%;
`

const ManuscriptsPane = styled.div`
  overflow-y: auto;
`

const FlexRow = styled.div`
  display: flex;
  gap: ${grid(2)};
  justify-content: flex-end;
  margin-bottom: ${grid(2)};
`

const TableWrapper = styled.div`
  padding: ${grid(3)} ${grid(2)};
`

const RoundIconButtonWrapper = styled(RoundIconButton).attrs({
  'data-testid': 'round-icon-button-wrapper',
})`
  position: sticky;
`

const Manuscripts = ({
  hideManuscriptsChat,
  importManuscripts,
  isImporting,
  shouldAllowBulkImport,
  currentUser,
  chatProps,
  groupManagerDiscussionChannel,
  channels,
  chatExpand,
}) => {
  const navigate = useNavigate()
  const { groupName } = useParams()
  const { t } = useTranslation()
  const config = useContext(ConfigContext)

  const channelData = chatProps?.channelsData?.find(
    channel => channel?.channelId === groupManagerDiscussionChannel?.id,
  )

  const [isAdminChatOpen, setIsAdminChatOpen] = useState(
    currentUser.chatExpanded,
  )

  const { loading, error, ...tableProps } = useManuscriptsTable('admin')

  const hideChat = async () => {
    try {
      setIsAdminChatOpen(false)
      chatExpand({ variables: { state: false } })
      const { channelsData } = chatProps || {}

      const dataRefetchPromises = channelsData?.map(async channel => {
        await channel?.refetchUnreadMessagesCount?.()
        await channel?.refetchNotificationOptionData?.()
      })

      await Promise.all(dataRefetchPromises)
    } catch (hideChatError) {
      console.error('Error hiding chat:', hideChatError)
    }
  }

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  return (
    <Page
      title={t(
        tableProps.viewingArchived
          ? 'manuscriptsPage.archivedManuscripts'
          : 'manuscriptsPage.Manuscripts',
      )}
    >
      <OuterContainer>
        <ManuscriptsColumns>
          <ManuscriptsPane>
            <FlexRow>
              <ControlsContainer>
                {config?.manuscript?.newSubmission &&
                  !tableProps.viewingArchived && (
                    <ActionButton
                      onClick={() => navigate(`/${groupName}/newSubmission`)}
                      primary
                    >
                      {t('dashboardPage.New submission')}
                    </ActionButton>
                  )}
                {shouldAllowBulkImport && !tableProps.viewingArchived && (
                  <ActionButton
                    onClick={importManuscripts}
                    status={
                      isImporting ? t('manuscriptsPage.importPending') : ''
                    }
                  >
                    {isImporting
                      ? t('manuscriptsPage.Refreshing')
                      : t('manuscriptsPage.Refresh')}
                  </ActionButton>
                )}
                {!isAdminChatOpen && !hideManuscriptsChat && (
                  <RoundIconButtonWrapper
                    iconName="MessageSquare"
                    onClick={() => {
                      setIsAdminChatOpen(true)
                      chatExpand({ variables: { state: true } })
                    }}
                    title={t('chat.Show group manager discussion')}
                    unreadMessagesCount={channelData?.unreadMessagesCount}
                  />
                )}
              </ControlsContainer>
            </FlexRow>

            <ScrollableContent>
              <TableWrapper>
                <ManuscriptsTable {...tableProps} />
              </TableWrapper>
            </ScrollableContent>
          </ManuscriptsPane>

          {isAdminChatOpen && !hideManuscriptsChat && (
            <MessageContainer
              channelId={groupManagerDiscussionChannel?.id}
              channels={channels}
              chatProps={chatProps}
              currentUser={currentUser}
              hideChat={hideChat}
            />
          )}
        </ManuscriptsColumns>
      </OuterContainer>
    </Page>
  )
}

export default Manuscripts
