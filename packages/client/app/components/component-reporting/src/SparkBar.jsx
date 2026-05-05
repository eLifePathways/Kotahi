import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'

const Container = styled.div`
  position: relative;
  width: 100%;
  z-index: 0;
`

const Value = styled.div`
  ${props =>
    props.onClick &&
    css`
      cursor: pointer;
    `}

  padding-left: 0.2em;
  position: absolute;
  z-index: 1;
`

const Bar = styled.div`
  background-color: ${props => props.color};

  ${props =>
    props.onClick &&
    css`
      cursor: pointer;
    `}

  overflow: hidden;
  width: ${props => props.barWidthPercent};
`

const SparkBar = ({
  label,
  value,
  rangeMax,
  onClick,
  color = 'cornflowerblue',
}) => {
  const barWidthPercent =
    rangeMax > 0 ? `${Math.round((value / rangeMax) * 100)}%` : '0'

  return (
    <Container>
      <Value data-testid="cell-value" onClick={onClick}>
        {label ?? value}
      </Value>
      <Bar barWidthPercent={barWidthPercent} color={color} onClick={onClick}>
        &nbsp;
      </Bar>
    </Container>
  )
}

SparkBar.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Bar width will be value/rangeMax * available space */
  value: PropTypes.number.isRequired,
  /** Bar width will be value/rangeMax * available space */
  rangeMax: PropTypes.number.isRequired,
  /** If onClick callback is set, the cursor will be "pointer" on hover. */
  onClick: PropTypes.func,
  /** bar color */
  color: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
}

export default SparkBar
