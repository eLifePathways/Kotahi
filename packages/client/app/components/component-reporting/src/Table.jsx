import PropTypes from 'prop-types'
import TableRow from './TableRow'

const Table = ({ columnSchemas = [], rows }) => {
  const hasHeadings = columnSchemas.some(col => !!col.heading)
  return (
    <div>
      {hasHeadings && (
        <TableRow
          cells={columnSchemas.map(col => ({
            ...col,
            content: col.heading,
          }))}
          isHeadingRow
        />
      )}
      {rows.map((row, index) => (
        <TableRow
          cells={row.map((cell, i) => {
            return cell?.content
              ? { ...cell, ...columnSchemas[i] }
              : { content: cell, ...columnSchemas[i] }
          })}
          key={row.key ?? index}
        />
      ))}
    </div>
  )
}

Table.propTypes = {
  /** Properties for each column */
  columnSchemas: PropTypes.arrayOf(
    PropTypes.shape({
      flexGrow: PropTypes.number,
      heading: PropTypes.node,
      width: PropTypes.string.isRequired,
    }).isRequired,
  ),
  /** Rows of cells. Each cell can be specified either as plain content (string, number or React node) or an object {content, isHeading} */
  rows: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.node,
        PropTypes.shape({
          content: PropTypes.node.isRequired,
          isHeading: PropTypes.bool,
        }),
      ]),
    ).isRequired,
  ).isRequired,
}

export default Table
