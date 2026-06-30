/* eslint-disable react/prop-types */

import { Link } from 'react-router-dom'
import { useTheme } from 'styled-components'

import { Icon } from '../../../shared'

const SubmitChevron = ({ manuscript, urlFrag }) => {
  const theme = useTheme()
  return (
    <Link
      to={`${urlFrag}/versions/${manuscript.parentId || manuscript.id}/submit`}
    >
      <Icon color={theme.color.brand2.base} noPadding size={2.5}>
        chevron_right
      </Icon>
    </Link>
  )
}

export default SubmitChevron
