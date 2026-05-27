/* eslint-disable react/prop-types */

import {
  Cell,
  StyledFileRow,
} from '../../../component-production/src/components/styles'

const CollectionTable = ({ columnDefinitions, collection }) => {
  const rowCells = columnDefinitions.map(column => {
    return (
      <Cell
        $centered={column.centered}
        data-testid={column.name}
        key={column.name}
      >
        {column.component({ collection })}
      </Cell>
    )
  })

  return <StyledFileRow>{rowCells}</StyledFileRow>
}

export default CollectionTable
