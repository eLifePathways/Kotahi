import { Alert as AntAlert } from 'antd'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { grid } from '@coko/client'

const StyledAntAlert = styled(AntAlert)`
  margin-bottom: ${({ $marginBottom }) => grid($marginBottom) ?? 0};
`

const Alert = ({ bottomMargin = 0, description, message, showIcon = false, type = 'info' }) => {
  const { t } = useTranslation()

  return (
    <StyledAntAlert
      $marginBottom={bottomMargin}
      description={description}
      showIcon={showIcon}
      title={message ?? t(`common.statuses.${type}`)}
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

export default Alert
