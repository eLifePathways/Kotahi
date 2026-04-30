import { useContext } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ConfigContext } from '../../../../config/src'

import ShareIcon from '../../../../../shared/icons/share'
import { UserCombo, Primary, Secondary, UserInfo } from '../../../../shared'
import { UserAvatar } from '../../../../component-avatar/src'

const Name = styled.span`
  display: flex;
  margin-left: 1em;
`

const Reviewer = ({
  isHiddenReviewerName,
  isControlPage,
  user,
  currentUserIsEditor,
  currentUser,
  canBePublishedPublicly,
}) => {
  const config = useContext(ConfigContext)
  const { t } = useTranslation()

  return (
    user && (
      <Name>
        <UserCombo>
          <UserAvatar
            user={isHiddenReviewerName && !isControlPage ? null : user}
          />
          <UserInfo>
            {isHiddenReviewerName && !isControlPage ? (
              <Primary>
                {t('decisionPage.decisionTab.Anonmyous Reviewer')}
              </Primary>
            ) : (
              <>
                <Primary>{user.username}</Primary>
                <Secondary>{user.defaultIdentity.identifier}</Secondary>
              </>
            )}
          </UserInfo>
        </UserCombo>

        {(currentUserIsEditor ||
          currentUser.groupRoles.includes('groupManager')) &&
          canBePublishedPublicly &&
          config.instanceName === 'prc' && (
            <>
              &nbsp;
              <ShareIcon />
            </>
          )}
      </Name>
    )
  )
}

Reviewer.propTypes = {
  isHiddenReviewerName: PropTypes.bool,
  isControlPage: PropTypes.bool,

  user: PropTypes.object.isRequired,
  currentUserIsEditor: PropTypes.bool,

  currentUser: PropTypes.object.isRequired,
  canBePublishedPublicly: PropTypes.bool,
}
Reviewer.defaultProps = {
  isHiddenReviewerName: false,
  isControlPage: false,
  currentUserIsEditor: false,
  canBePublishedPublicly: false,
}

export default Reviewer
