import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { color } from '../../../theme'

const Row = styled.div`
  align-content: stretch;
  align-items: stretch;
  border: 1px solid ${color.gray80};
  border-bottom: none;
  display: flex;
  flex-direction: row;

  ${props =>
    props.isHeadingRow
      ? css`
          position: sticky;
          top: 0;
          z-index: 2;
        `
      : css`
          &:hover {
            box-shadow: inset 0 0 4px ${color.brand1.base};
          }
        `}

  width: 100%;

  &:last-of-type {
    border-bottom: 1px solid ${color.gray80};
  }
`

const Cell = styled.div`
  border-right: 1px solid ${color.gray80};
  flex: ${props => props.flexGrow} 1 ${props => props.width};

  ${props =>
    props.isHeading &&
    css`
      background-color: ${color.brand1.tint70};
      line-height: 120%;
    `}

  overflow-wrap: break-word;
  overflow-x: hidden;
  padding: 0.5em;

  &:last-child {
    border-right: none;
  }
`

const TableRow = ({ cells, isHeadingRow }) => {
  return (
    <Row data-testid="row" isHeadingRow={isHeadingRow}>
      {cells.map((cell, index) => (
        <Cell
          data-testid="cell"
          flexGrow={cell.flexGrow ?? 0}
          isHeading={isHeadingRow || cell.isHeading}
          key={index}
          width={cell.width}
        >
          {cell.content || '-'}
        </Cell>
      ))}
    </Row>
  )
}

TableRow.propTypes = {
  cells: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.node,
      flexGrow: PropTypes.number,
      isHeading: PropTypes.bool,
      width: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  isHeadingRow: PropTypes.bool,
}

TableRow.defaultProps = {
  isHeadingRow: false,
}

export default TableRow
