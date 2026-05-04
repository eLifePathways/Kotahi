/* eslint-disable react/prop-types */

import { useState } from 'react'
import styled, { css } from 'styled-components'
import { grid, rotate360 } from '@coko/client'
import { Check, AlertCircle } from 'react-feather'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import theme, { color } from '../../theme'

const ActionLink = styled.button`
  background: transparent;
  border-bottom: 2px solid transparent;
  color: ${color.brand1.base};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  display: inline-flex;
  flex-direction: row;
  font-size: inherit;
  gap: ${theme.spacing.d};
  line-height: inherit;
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
  width: fit-content;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${({ disabled }) =>
    disabled
      ? ''
      : css`
          &:hover {
            border-bottom: 2px solid ${color.brand1.base};
            transition: border-bottom 0.2s;
          }
        `}
`

const Spinner = styled.div`
  display: inline-block;
  vertical-align: -2px;

  &::after {
    animation: ${rotate360} 1s linear infinite;
    border: 2.5px solid ${color.brand1.base};
    border-color: ${color.brand1.base} transparent ${color.brand1.base}
      transparent;
    border-radius: 50%;
    box-sizing: border-box;
    /* stylelint-disable-next-line string-quotes */
    content: '';
    display: block;
    height: ${grid(2)};
    width: ${grid(2)};
  }
`

const IconContainer = styled.div`
  height: ${grid(2)};
  width: ${grid(2)};
`

/** Equivalent of <a href="...">, styled the same as other Actions */
export const LinkAction = ({
  children,
  isDisabled,
  to,
  'data-testid': dataTestId,
}) => {
  const navigate = useNavigate()
  return (
    <Action
      data-testid={dataTestId}
      isDisabled={isDisabled}
      onClick={() => navigate(to)}
    >
      {children}
    </Action>
  )
}

LinkAction.propTypes = {
  isDisabled: PropTypes.bool,
  to: PropTypes.string.isRequired,
}

LinkAction.defaultProps = { isDisabled: false }

/** A control appearing like a link, that invokes some action on click.
 * While waiting for the action, it displays a small spinner.
 * When that action is completed, it passes the return value to onActionCompleted,
 * which can do other jobs like displaying the results. If onActionCompleted
 * returns "success" or "failure", appropriate icons will be shown.
 */
const Action = ({
  children,
  className,
  'data-testid': dataTestId,
  isDisabled,
  onActionCompleted,
  onClick,
  title,
}) => {
  const [resultStatus, setResultStatus] = useState(null)
  const [isInProgress, setIsInProgress] = useState(false)

  return (
    <ActionLink
      className={className}
      data-testid={dataTestId}
      disabled={isInProgress || isDisabled || typeof onClick !== 'function'}
      onClick={async e => {
        setIsInProgress(true)
        const result = await onClick(e)
        if (onActionCompleted) setResultStatus(await onActionCompleted(result))
        setIsInProgress(false)
      }}
      title={title}
      type="button"
    >
      {children}
      {isInProgress && <Spinner />}
      {!isInProgress && resultStatus === 'success' && (
        <IconContainer>
          <Check
            color={color.brand1.base}
            data-testid="check-svg"
            size={16}
            strokeWidth={2}
          />
        </IconContainer>
      )}
      {!isInProgress && resultStatus === 'failure' && (
        <IconContainer>
          <AlertCircle
            color={color.warning.base}
            data-testid="alert-circle-svg"
            size={16}
            strokeWidth={2}
          />
        </IconContainer>
      )}
    </ActionLink>
  )
}

Action.propTypes = {
  /** Disable the control */
  isDisabled: PropTypes.bool,
  /** If supplied, this will be passed the return value of the onClick handler, for further processing.
   * If onActionCompleted returns "success" or "failure" strings, these will be used to display a tick or a warning icon on the control. */
  onActionCompleted: PropTypes.func,
  /** A function to perform some action on user click. Its return value will be passed to onActionCompleted, if this is supplied. */
  onClick: PropTypes.func,
}

Action.defaultProps = {
  isDisabled: false,
  onActionCompleted: null,
  onClick: null,
}

export default Action
