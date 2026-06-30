import React, { useState } from 'react'
import styled from 'styled-components'
import Moment from 'react-moment'
import { useTranslation } from 'react-i18next'
import { values } from 'lodash'
import { grid, th } from '@coko/client'
import { useHistory } from 'react-router-dom'
import {
  ActionButton,
  Collapse,
  FlexRow,
  Spinner,
  Tag,
} from '../../../../shared'
import { articleStatuses } from '../../../../../globals'
import EditPayloadModal from './EditPayloadModal'

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${grid(2)};
  padding: ${grid(4)} 0;
`

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(1)};
`

const CodeWrapper = styled.div`
  background-color: #ddd;
  border: 1px solid black;
  border-radius: ${th('borderRadius')};
  padding: ${grid(2)};
`

const FlexRowItem = styled.div``

const patterns = [
  'Offer',
  'Accept',
  'Reject',
  'TentativeAccept',
  'TentativeReject',
  'Announce',
  'Flag',
  'Undo',
]

const getPatternType = rawType => {
  return Array.isArray(rawType)
    ? rawType.find(t => patterns.includes(t))
    : rawType
}

const getActivityType = rawType =>
  Array.isArray(rawType)
    ? rawType
        .find(t => t.startsWith('coar-notify:'))
        ?.replace('coar-notify:', '')
    : undefined

const CoarLabel = ({
  allowPayloadEdit,
  config,
  message,
  onSetSelectedMessage,
}) => {
  const { t } = useTranslation()
  const history = useHistory()

  const { instanceName, urlFrag } = config
  const { created, manuscript, payload } = message
  const { type: rawType } = payload

  const activityType = getActivityType(rawType)

  const type = getPatternType(rawType)

  const { $title } = JSON.parse(manuscript?.submission || '{}')

  let color

  if (['Accept'].includes(type)) {
    color = 'success'
  } else if (['TentativeAccept', 'TentativeReject'].includes(type)) {
    color = 'warning'
  } else if (['Reject', 'Undo'].includes(type)) {
    color = 'error'
  }

  const handleEditPayload = () => {
    onSetSelectedMessage(message)
  }

  return (
    <div>
      <FlexRow>
        <FlexRowItem>
          <Tag color={color} fontSize="base">
            {t(`decisionPage.coarTab.${type}`)}
            {activityType && `: ${t(`decisionPage.coarTab.${activityType}`)}`}
          </Tag>
          <Moment format="DD MMM YYYY, HH:mm:ss">{created}</Moment>
        </FlexRowItem>
        {$title && (
          <FlexRowItem>
            {$title.length > 50 ? `${$title.slice(0, 50)}...` : $title}
          </FlexRowItem>
        )}
        {allowPayloadEdit && activityType !== 'UnprocessableNotification' && (
          <FlexRowItem>
            {manuscript && (
              <>
                {['preprint1', 'preprint2'].includes(instanceName) &&
                  values(articleStatuses).includes(manuscript.status) && (
                    <ActionButton
                      onClick={() =>
                        history.push(
                          `${urlFrag}/versions/${manuscript.id}/evaluation`,
                        )
                      }
                      primary
                    >
                      {t('coarNotifyInboxPage.evaluateManuscript')}
                    </ActionButton>
                  )}
                {['journal', 'prc'].includes(instanceName) && (
                  <ActionButton
                    onClick={() =>
                      history.push(
                        `${urlFrag}/versions/${manuscript.id}/decision`,
                      )
                    }
                    primary
                  >
                    {t('coarNotifyInboxPage.controlManuscript')}
                  </ActionButton>
                )}
              </>
            )}
            {!manuscript && (
              <ActionButton onClick={handleEditPayload} status="failure">
                {t('coarNotifyInboxPage.editPayload')}
              </ActionButton>
            )}
          </FlexRowItem>
        )}
      </FlexRow>
    </div>
  )
}

const CoarMessage = ({ payload }) => {
  const { t } = useTranslation()

  const { actor, object, origin } = payload

  const actorName = actor?.name

  const actorOrcid = actor.id?.match(/\d{4}-\d{4}-\d{4}-\d{3}[0-9X]\b/) ?? ''

  const doi = object['ietf:cite-as']?.includes('doi.org/')
    ? object['ietf:cite-as'].split('org/')[1]
    : object['ietf:cite-as']

  const objectUrl = object.object?.id ?? object.id

  const originId = origin.id

  return (
    <MessageWrapper>
      <div>
        <b>{t('decisionPage.coarTab.actor')}:</b> {actorName}{' '}
        {actorOrcid && (
          <a
            href={`https://orcid.org/${actorOrcid}`}
            rel="noreferrer"
            target="_blank"
          >
            <img
              alt="ORCID ID icon"
              height={20}
              src="/orcid-id-icon.svg"
              width={20}
            />
            {/* <img alt="ORCID ID icon" height={20} src={OcridIcon} width={20} /> */}
          </a>
        )}
      </div>
      {doi && (
        <div>
          <b>DOI:</b> {doi}
        </div>
      )}
      <div>
        <b>{t('decisionPage.coarTab.resourceUrl')}:</b> {objectUrl}
      </div>
      <div>
        <b>{t('decisionPage.coarTab.from')}:</b> {originId}
      </div>
      <div>
        <b>{t('decisionPage.coarTab.rawPayload')}:</b>
      </div>
      <CodeWrapper>
        <pre>{JSON.stringify(payload, null, 2)}</pre>
      </CodeWrapper>
    </MessageWrapper>
  )
}

const CoarMessages = ({
  collapsible = false,
  config = {},
  loading,
  messages,
  onResendCoarNotifyPayload = null,
}) => {
  const { t } = useTranslation()

  const [isEditPayloadModalOpen, setIsEditingPayload] = useState(false)
  const [currentMessage, setCurrentMessage] = useState(null)

  if (loading) {
    return <Spinner />
  }

  if (!messages.length) {
    return <Container>{t('decisionPage.coarTab.noMessages')}</Container>
  }

  const parsedMessages = messages.map(m => ({
    ...m,
    payload: JSON.parse(m.payload),
  }))

  const handleSelectPayload = message => {
    setCurrentMessage(message)
    setIsEditingPayload(true)
  }

  const handleSubmitEditedPayload = async editPayload => {
    return onResendCoarNotifyPayload(editPayload)
  }

  return (
    <>
      <Container>
        <Collapse
          accordion
          collapsible={collapsible ? 'icon' : 'disabled'}
          items={parsedMessages.map(m => ({
            key: m.id,
            label: (
              <CoarLabel
                allowPayloadEdit={!!onResendCoarNotifyPayload}
                config={config}
                message={m}
                onSetSelectedMessage={handleSelectPayload}
              />
            ),
            children: <CoarMessage payload={m.payload} />,
          }))}
        />
      </Container>
      <EditPayloadModal
        isOpen={isEditPayloadModalOpen}
        onClose={() => setIsEditingPayload(false)}
        onSubmit={handleSubmitEditedPayload}
        originalMessage={currentMessage}
      />
    </>
  )
}

export default CoarMessages
