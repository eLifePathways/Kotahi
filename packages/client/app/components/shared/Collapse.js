import React from 'react'
import { grid } from '@coko/client'
import { Collapse as AntCollapse } from 'antd'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const StyledCollapse = styled(AntCollapse)`
  padding: 0 ${grid(2)};
  width: 100%;
`

const Collapse = ({ accordion, expandIconPosition, items, ...otherProps }) => {
  return (
    <StyledCollapse
      {...otherProps}
      accordion={accordion}
      expandIconPosition={expandIconPosition}
      items={items}
    />
  )
}

Collapse.propTypes = {
  accordion: PropTypes.bool,
  expandIconPosition: PropTypes.oneOf(['start', 'end']),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      label: PropTypes.node,
      children: PropTypes.node,
    }),
  ),
}

Collapse.defaultProps = {
  accordion: false,
  expandIconPosition: 'start',
  items: [],
}

export default Collapse
