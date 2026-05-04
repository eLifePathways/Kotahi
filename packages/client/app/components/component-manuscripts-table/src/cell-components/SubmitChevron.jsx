/* eslint-disable react/prop-types */

import { Link } from 'react-router-dom'
import { Icon } from '../../../shared'
import { color } from '../../../../theme'

const SubmitChevron = ({ manuscript, urlFrag }) => {
  return (
    <Link
      to={`${urlFrag}/versions/${manuscript.parentId || manuscript.id}/submit`}
    >
      <Icon color={color.brand2.base} noPadding size={2.5}>
        chevron_right
      </Icon>
    </Link>
  )
}

export default SubmitChevron
