/* eslint-disable react/prop-types */

import { UserCombo, Primary, Secondary, UserInfo } from '../../../shared'
import { UserAvatar } from '../../../component-avatar/src'

const Submitter = ({ manuscript }) => {
  if (manuscript.submitter)
    return (
      <UserCombo>
        <UserAvatar user={manuscript.submitter} />
        <UserInfo>
          <Primary>{manuscript.submitter.username}</Primary>
          <Secondary>
            {manuscript.submitter.defaultIdentity.identifier}
          </Secondary>
        </UserInfo>
      </UserCombo>
    )

  return null
}

export default Submitter
