/* eslint-disable react/prop-types */

import {
  Cell,
  StyledFileRow,
} from '../../../component-production/src/components/styles'

const CollectionTable = ({ columnDefinitions, collection }) => {
  const rowCells = columnDefinitions.map(column => {
    const Renderer = column.component

    return (
      <Cell $centered={column.centered} key={column.name}>
        <Renderer collection={collection} />
      </Cell>
    )
  })

  return <StyledFileRow>{rowCells}</StyledFileRow>
}

export default CollectionTable
