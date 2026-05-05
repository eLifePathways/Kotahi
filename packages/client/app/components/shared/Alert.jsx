import { Alert as AntAlert } from 'antd'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

const Alert = ({ description, message, showIcon = false, type = 'info' }) => {
  const { t } = useTranslation()

  return (
    <AntAlert
      description={description}
      message={message ?? t(`common.statuses.${type}`)}
      showIcon={showIcon}
      type={type}
    />
  )
}

Alert.propTypes = {
  description: PropTypes.node,
  message: PropTypes.node,
  showIcon: PropTypes.bool,
  type: PropTypes.oneOf(['success', 'info', 'warning', 'error']),
}

export default Alert
