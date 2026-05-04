/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { th } from '@coko/client'
import { convertTimestampToDateTimeString } from '../../../../shared/dateUtils'

export const VerticalBar = styled.div`
  border-right: 1px solid #111;
  height: 16px;
  margin: 0 10px;
`

export const FlexCenter = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`

export const StatusInfoText = styled.div`
  display: flex;
  font-size: ${th('fontSizeBaseSmall')};
  font-weight: 400;
`

const SubmittedStatus = ({ authorFeedback }) => {
  const { t } = useTranslation()
  const isSubmitted = () => !!authorFeedback.submitted

  return (
    <StatusInfoText>
      {authorFeedback.edited && (
        <FlexCenter>
          {t('productionPage.Edited on', {
            date: convertTimestampToDateTimeString(authorFeedback.edited),
          })}
        </FlexCenter>
      )}

      <FlexCenter>
        {isSubmitted() && (
          <>
            <VerticalBar />
            {t('productionPage.submittedOn', {
              submitterName:
                authorFeedback.submitter?.username ||
                authorFeedback.submitter?.defaultIdentity?.name,
              date: convertTimestampToDateTimeString(authorFeedback.submitted),
            })}
          </>
        )}
      </FlexCenter>
    </StatusInfoText>
  )
}

export default SubmittedStatus
