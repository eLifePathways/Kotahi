/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Moment from 'react-moment'
import { grid, th } from '@coko/client'
import { Collapse, Spinner, Tag } from '../../../../shared'

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

const CoarLabel = ({ message }) => {
  const { t } = useTranslation()

  const { created, payload } = message

  const { type: rawType } = payload

  const activityType = getActivityType(rawType)

  const type = getPatternType(rawType)

  let color

  if (['Accept'].includes(type)) {
    color = 'success'
  } else if (['TentativeAccept', 'TentativeReject'].includes(type)) {
    color = 'warning'
  } else if (['Reject', 'Undo'].includes(type)) {
    color = 'error'
  }

  return (
    <div>
      <Tag color={color} fontSize="base">
        {t(`decisionPage.coarTab.${type}`)}
        {activityType && `: ${t(`decisionPage.coarTab.${activityType}`)}`}
      </Tag>
      <Moment format="DD MMM YYYY, HH:mm:ss">{created}</Moment>
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

  const objectUrl = object.id

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

const CoarMessages = ({ loading, messages }) => {
  const { t } = useTranslation()

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

  return (
    <Container>
      <Collapse
        accordion
        items={parsedMessages.map(m => ({
          key: m.id,
          label: <CoarLabel message={m} />,
          children: <CoarMessage payload={m.payload} />,
        }))}
      />
    </Container>
  )
}

export default CoarMessages
