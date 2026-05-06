/* eslint-disable react/prop-types */

import {
  Cell,
  StyledFileRow,
} from '../../../component-production/src/components/styles'

const CollectionTable = ({ columnDefinitions, collection }) => {
  const rowCells = columnDefinitions.map(column => {
    const Renderer = column.component
    return (
      <Cell key={column.name} {...column}>
        <Renderer collection={collection} />
      </Cell>
    )
  })

  return <StyledFileRow>{rowCells}</StyledFileRow>
}

export default CollectionTable
