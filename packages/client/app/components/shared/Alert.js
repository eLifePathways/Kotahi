import React from 'react'
import { Alert as AntAlert } from 'antd'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { grid } from '@coko/client'

const StyledAntAlert = styled(AntAlert)`
  margin-bottom: ${({ $marginBottom }) => grid($marginBottom) ?? 0};
`

const Alert = ({ bottomMargin, description, message, showIcon, type }) => {
  const { t } = useTranslation()

  return (
    <StyledAntAlert
      $marginBottom={bottomMargin}
      description={description}
      message={message ?? t(`common.statuses.${type}`)}
      showIcon={showIcon}
      type={type}
    />
  )
}

Alert.propTypes = {
  bottomMargin: PropTypes.number,
  description: PropTypes.node,
  message: PropTypes.node,
  showIcon: PropTypes.bool,
  type: PropTypes.oneOf(['success', 'info', 'warning', 'error']),
}

Alert.defaultProps = {
  bottomMargin: 0,
  description: null,
  message: null,
  showIcon: false,
  type: 'info',
}

export default Alert
