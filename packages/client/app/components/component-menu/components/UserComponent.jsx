/* eslint-disable react/prop-types */

/* eslint-disable new-cap */

import PropTypes from 'prop-types'
import { UserAvatar } from '../../component-avatar/src'
import {
  FormattedGlobalAndGroupRoles,
  RolesLabel,
  UserInfo,
  UserItem,
  UserMenuContainer,
  UserName,
} from '../styles'
import NavItem from './NavItem'

const UserComponent = ({ user, loginLink, profileLink, t, expanded }) => {
  return (
    <UserMenuContainer>
      {user && (
        <UserItem
          $expanded={expanded}
          title={t('leftMenu.Go to your profile')}
          to={profileLink}
        >
          <UserAvatar
            isClickable={false}
            size={expanded ? 48 : 35}
            user={user}
          />
          <UserInfo expanded={expanded}>
            <UserName>{user.username}</UserName>
            {!user.isOnline && <span>Offline</span>}
            <RolesLabel>({FormattedGlobalAndGroupRoles(user, t)})</RolesLabel>
          </UserInfo>
        </UserItem>
      )}
      {!user && <NavItem icon="logIn" link={loginLink} name="Login" />}
    </UserMenuContainer>
  )
}

UserComponent.propTypes = {
  user: PropTypes.oneOfType([PropTypes.object]),
  loginLink: PropTypes.string.isRequired,
  profileLink: PropTypes.string.isRequired,
}

export default UserComponent
