/* eslint-disable react/prop-types */

import { th } from '@coko/client'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { UserAvatar } from '../../../../component-avatar/src'
import Modal, { StackedHeader } from '../../../../component-modal/src/Modal'
import {
  ActionButton,
  LooseColumn,
  MediumRow,
  Primary,
  Secondary,
  UserCombo,
  UserInfo,
} from '../../../../shared'

const ModalContainer = styled(LooseColumn)`
  background-color: ${th('colorBackground')};
`

const ReviewerName = styled.span`
  font-weight: normal;
`

const DeleteInvitationModal = ({
  reviewer,
  manuscriptId,
  isAuthorCard,
  isOpen,
  onClose,
  removeInvitation,
  removeUserFromTeam,
}) => {
  const { t } = useTranslation()

  const actions = (
    <MediumRow>
      <ActionButton
        onClick={() => {
          removeInvitation({
            variables: {
              id: reviewer.id,
            },
          })

          if (
            reviewer.user &&
            !(isAuthorCard && reviewer.status !== 'accepted')
          ) {
            removeUserFromTeam({
              variables: {
                userId: reviewer.user.id,
                manuscriptId,
              },
            })
          }
        }}
        primary
      >
        {t('modals.deleteReviewer.Ok')}
      </ActionButton>
      &nbsp;
      <ActionButton onClick={onClose}>
        {t('modals.deleteReviewer.Cancel')}
      </ActionButton>
    </MediumRow>
  )

  return (
    <Modal isOpen={isOpen} leftActions={actions}>
      <ModalContainer>
        <StackedHeader
          title={t(
            `modals.deleteReviewer.deleteThis${
              isAuthorCard ? 'Author' : 'Reviewer'
            }`,
          )}
        />
        {reviewer && (
          <UserCombo>
            <UserAvatar user={reviewer?.user ?? ''} />
            <UserInfo>
              <Primary>
                {t(
                  `modals.reviewReport.${isAuthorCard ? 'Author' : 'Reviewer'}`,
                )}{' '}
                <ReviewerName>
                  {reviewer.user?.username ?? reviewer?.invitedPersonName}
                </ReviewerName>
              </Primary>
              <Secondary>
                {reviewer?.user?.defaultIdentity?.identifier ??
                  reviewer?.toEmail}
              </Secondary>
            </UserInfo>
          </UserCombo>
        )}
      </ModalContainer>
    </Modal>
  )
}

export default DeleteInvitationModal
