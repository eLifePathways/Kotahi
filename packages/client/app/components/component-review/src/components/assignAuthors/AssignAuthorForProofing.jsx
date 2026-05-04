/* eslint-disable react/prop-types */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AssignedAuthorForProofingLogsContainer,
  AssignedAuthorForProofingLogsToggle,
  AssignedAuthorForProofingLogs,
  AssignedAuthorForProofingInfo,
  SectionHeader,
  SectionRowGrid,
  Title,
} from '../style'
import { ActionButton, SectionContent } from '../../../../shared'
import { convertTimestampToDateTimeString } from '../../../../../shared/dateUtils'

const AssignAuthorForProofing = ({
  assignAuthorForProofing,
  isCurrentVersion,
  manuscript,
}) => {
  const [isToggled, setToggled] = useState(false)

  const isAuthorProofingEnabled = ['assigned', 'inProgress'].includes(
    manuscript.status,
  )

  const [submitAuthorProofingStatus, setSubmitAuthorProofingStatus] =
    useState(null)

  const authorTeam = manuscript.teams.find(team => team.role === 'author')

  const { t } = useTranslation()

  return (
    <SectionContent>
      <SectionHeader>
        <Title>{t('decisionPage.Assign Author for Proofing')}</Title>
      </SectionHeader>
      <SectionRowGrid>
        <ActionButton
          dataTestid="submit-author-proofing"
          disabled={
            authorTeam?.members.length === 0 ||
            isAuthorProofingEnabled ||
            !isCurrentVersion
          }
          onClick={async () => {
            setSubmitAuthorProofingStatus('pending')

            await assignAuthorForProofing({
              variables: {
                id: manuscript?.id,
              },
            })

            setSubmitAuthorProofingStatus('success')
          }}
          primary
          status={submitAuthorProofingStatus}
        >
          {t('decisionPage.Submit for author proofing')}
        </ActionButton>
        <AssignedAuthorForProofingInfo>
          {authorTeam?.members?.length === 0 &&
            t('decisionPage.authorRequired')}
        </AssignedAuthorForProofingInfo>
      </SectionRowGrid>
      {manuscript.authorFeedback.assignedAuthors?.length > 0 ? (
        <AssignedAuthorForProofingLogsContainer>
          <AssignedAuthorForProofingLogsToggle
            onClick={() => setToggled(!isToggled)}
          >
            {isToggled
              ? t('decisionPage.hideAssignedAuthors')
              : t('decisionPage.showAssignedAuthors')}
          </AssignedAuthorForProofingLogsToggle>
          {isToggled && (
            <AssignedAuthorForProofingLogs>
              {manuscript.authorFeedback.assignedAuthors.map(a => (
                <React.Fragment key={`author-assigned-${a.assignedOnDate}`}>
                  <span>
                    {t('decisionPage.assignedOn', {
                      assigneeName: a.authorName,
                      date: convertTimestampToDateTimeString(a.assignedOnDate),
                    })}
                  </span>
                  <br />
                </React.Fragment>
              ))}
            </AssignedAuthorForProofingLogs>
          )}
        </AssignedAuthorForProofingLogsContainer>
      ) : null}
    </SectionContent>
  )
}

export default AssignAuthorForProofing
