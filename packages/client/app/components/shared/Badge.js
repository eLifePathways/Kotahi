import PropTypes from 'prop-types'
import styled from 'styled-components'
import { grid, theme } from '@coko/client'
import i18next from 'i18next'
import { keys } from 'lodash'
import { color } from '../../theme'
import { FlexRow } from '../../globals'

const bRadius = '8px'

// TODO: clickable prop should not be necessary here, unless we make it a button, in that case we could use onClick instead
const BadgesWrapper = styled(FlexRow)`
  align-items: center;
  border-radius: ${bRadius};
  box-shadow: 0 0 1px #0003;
  cursor: ${p => p.clickable && 'pointer'};
  justify-content: center;
  overflow: hidden;
`

export const Status = styled.span`
  background-color: ${p => p.$bg};
  border-radius: ${p => p.$bRadius};
  box-shadow: inset 0 0 1px #0004;
  color: ${p => p.$text};
  font-size: 10px;
  font-weight: 700;
  line-height: 0.5;
  padding-block: ${grid(1.2)};
  padding-left: ${p => p.$pLeft || grid(1.2)};
  padding-right: ${p => p.$pRight || grid(1.2)};
  text-rendering: optimizeLegibility;
  text-shadow: ${p => (p.$textShadow ? '0 0 2px #0005' : '')};
  text-transform: uppercase;
`

export const ConfigurableStatus = styled(Status)`
  background-color: ${p => p.color};
  color: ${p => (p.lightText ? color.textReverse : color.text)};
`

export const safeLabel = status => {
  const unknownFallback = `${i18next.t('msStatus.unknown')} (${status})`
  return i18next.t(`msStatus.${status}`, unknownFallback)
}

const statusColorsMap = {
  submitted: [theme.colorWarning, color.warning.shade50],
  inProgress: [theme.colorWarning, color.warning.shade50],
  underEmbargo: [theme.colorWarning, color.warning.shade50],
  published: [theme.colorSuccess, color.textReverse],
  completed: [theme.colorSuccess, color.textReverse],
  embargoReleased: [theme.colorSuccess, color.textReverse],
  unpublished: [theme.colorError, color.textReverse],
  rejected: [theme.colorError, color.textReverse],
  default: ['#ddd', '#333'],
}

// IDEA: This could be extended to be a prop: an array of objects where each: { [statuskey] : [...array of statuses to override] }
// Slightly changes on the component's implementation will be needed though
const statusesToOverride = ['evaluated']

/**
 * StatusBadge component to display status with optional published badge.
 *
 * @param {string} status - The status to display.
 * @param {boolean} clickable - To check if cursor should be 'pointer' (must remove).
 * @param {string} [published] - A string containing a date, if present it means the published badge should be displayed.
 * @param {Object} [colorMap={}] - Custom colors map for statuses.
 *
 * @example
 * // colorMap should be an object where keys are status strings and values are arrays of two strings:
 * // [backgroundColor, textColor]
 * // if status is not present in colorMap, it will fallback to default colors.
 *
 * const colorMap = {
 *   accepted: ['#00ff00', '#ffffff'],
 *   rejected: ['#ff0000', '#ffffff'],
 *   default: ['#dddddd', '#333333'],
 * }
 *
 * <StatusBadge status="accepted" published="2023-10-01" colorMap={colorMap} />
 */
export const StatusBadge = ({
  status,
  published: publishedDate,
  colorMap,
  ...rest
}) => {
  const safeStatusKey = keys(colorMap).includes(status) ? status : 'default'
  const [bg, text] = colorMap[safeStatusKey]
  const [publishedBg, publishedText] = colorMap.published

  const publishedAndMore = !!publishedDate && status !== 'published'
  const forceToPublished = statusesToOverride.includes(status)
  const showPublishedStatus = publishedAndMore || forceToPublished

  return (
    <BadgesWrapper {...rest}>
      {showPublishedStatus && (
        <Status
          $bg={publishedBg}
          $bRadius={`${bRadius} 0 0 ${bRadius}`}
          $pRight={!forceToPublished && grid(1)}
          $text={publishedText}
          $textShadow={publishedText === color.textReverse}
        >
          {safeLabel('published')}
        </Status>
      )}
      {!forceToPublished && (
        <Status
          $bg={bg}
          $bRadius={
            showPublishedStatus ? `0 ${bRadius} ${bRadius} 0` : `${bRadius}`
          }
          $pLeft={showPublishedStatus && grid(1)}
          $text={text}
          $textShadow={text === color.textReverse}
        >
          {safeLabel(status)}
        </Status>
      )}
    </BadgesWrapper>
  )
}

StatusBadge.propTypes = {
  clickable: PropTypes.bool,
  colorMap: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
  published: PropTypes.string,
  status: PropTypes.string.isRequired,
}

StatusBadge.defaultProps = {
  clickable: false,
  colorMap: statusColorsMap,
  published: '',
}
