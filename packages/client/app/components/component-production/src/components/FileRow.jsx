import PropTypes from 'prop-types'
import 'rc-tooltip/assets/bootstrap_white.css'

import { Cell, StyledFileRow } from './styles'

const FileRow = ({ file, columnDefinitions }) => {
  const rowCells = columnDefinitions.map(column => {
    const Renderer = column.component
    return (
      <Cell key={column.name} {...column}>
        <Renderer file={file} />
      </Cell>
    )
  })

  return <StyledFileRow>{rowCells}</StyledFileRow>
}

FileRow.propTypes = {
  file: PropTypes.shape({
    created: PropTypes.string.isRequired,
    id: PropTypes.string,
    updated: PropTypes.string,
  }).isRequired,
  columnDefinitions: PropTypes.arrayOf(
    PropTypes.shape({
      /** The column name, corresponding either to a field name e.g. 'meta.title' or to a special built-in column type */
      name: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
}

export default FileRow
