/* eslint-disable react/prop-types */

/* stylelint-disable declaration-block-no-redundant-longhand-properties */

import { useState } from 'react'
import styled from 'styled-components'
import { th } from '@coko/client'
import { Mail } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Primary, Secondary } from '../../../shared'
import { convertTimestampToRelativeDateString } from '../../../../shared/dateUtils'
import { UserAction } from '../../../component-manuscripts-table/src/style'
import InviteDeclineModal from './InviteDeclineModal'
import { color } from '../../../../theme'

const DeclinedReviewerContainer = styled.div`
  display: flex;
  font-size: 14px;
  justify-content: space-between;
  margin: 1.5em 1em;
  overflow: hidden auto;
`

const UserName = styled.div`
  display: flex;
  flex: 2;
  flex-direction: row;
  word-break: break-all;
`

const Date = styled.div`
  flex: 1;
  word-break: break-all;
`

const TextChange = styled.div`
  color: ${color.brand2.base};
`

const EmailDisplay = styled(Secondary)`
  align-items: center;
  color: ${color.brand2.base};
  display: flex;
  margin-left: calc(${th('gridUnit')} * 2);
`

const MailIcon = styled(Mail)`
  height: ${th('fontSizeBase')};
  margin-right: calc(${th('gridUnit')} / 2);
  width: auto;
`

const ViewDetailsWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
`

const ViewDetails = styled(UserAction)`
  width: auto;
`

const DeclinedReviewer = ({ declined }) => {
  const [isModalOpen, setModalOpen] = useState(false)
  const { t } = useTranslation()

  const declinedDateString = convertTimestampToRelativeDateString(
    declined.responseComment ? declined.responseDate : declined.updated,
  )

  return (
    <>
      <InviteDeclineModal
        invitation={declined}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
      <DeclinedReviewerContainer>
        <UserName>
          <Primary>
            {declined.user?.username ?? declined.invitedPersonName}
          </Primary>
          {declined.isEmail && (
            <EmailDisplay>
              <MailIcon /> {t('decisionPage.Invited via email')}
            </EmailDisplay>
          )}
        </UserName>

        <Date>
          <Secondary>
            <TextChange>
              {t('decisionPage.declinedInvitation', {
                dateString: declinedDateString,
              })}
            </TextChange>
          </Secondary>
        </Date>

        <ViewDetailsWrapper>
          <ViewDetails onClick={() => setModalOpen(true)}>
            {t('decisionPage.View Details')}
          </ViewDetails>
        </ViewDetailsWrapper>
      </DeclinedReviewerContainer>
    </>
  )
}

export default DeclinedReviewer
