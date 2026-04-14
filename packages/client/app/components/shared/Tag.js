import React from 'react'
import { Tag as AntTag } from 'antd'
import PropTypes from 'prop-types'
import { capitalize } from 'lodash'
import { grid, theme } from '@coko/client'

const Tag = ({ children, color, fontSize }) => {
  const colorLabel = color ? `color${capitalize(color)}` : undefined
  const fontSizeLabel = `fontSize${capitalize(fontSize)}`

  return (
    <AntTag
      color={theme[colorLabel]}
      style={{
        fontSize: theme[fontSizeLabel],
        padding: `${grid(2)} ${grid(4)}`,
      }}
    >
      {children}
    </AntTag>
  )
}

Tag.propTypes = {
  color: PropTypes.oneOf(['success', 'warning', 'error', undefined]),
  fontSize: PropTypes.oneOf([
    'base',
    'baseSmall',
    'baseSmaller',
    'Heading1',
    'Heading2',
    'Heading3',
    'Heading4',
    'Heading5',
    'Heading6',
  ]),
}

Tag.defaultProps = {
  color: undefined,
  fontSize: 'baseSmall',
}

export default Tag
