/* eslint-disable react/prop-types */

import React from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { DragVerticalIcon } from '../../../shared/Icons'
import { LayoutHeaderListContainer, LayoutHeaderListItem } from '../style'

const reorder = (list, fromIndex, toIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, removed)

  const reorderedItems = result.map((item, index) => {
    item.sequenceIndex = index + 1
    return item
  })

  return reorderedItems
}

const reformObject = values => {
  return values.map(item => ({
    id: item.id,
    title: item.title,
    sequenceIndex: item.sequenceIndex,
    shownInMenu: item.shownInMenu,
  }))
}

const PageOrder = ({ initialItems, onPageOrderUpdated }) => {
  const [items, setItems] = React.useState(reformObject(initialItems))

  const updateItems = updatedItems => {
    setItems(updatedItems)
    onPageOrderUpdated(updatedItems)
  }

  const onDragEnd = result => {
    if (!result.destination) {
      return
    }

    const updatedItems = reorder(
      items,
      result.source.index,
      result.destination.index,
    )

    updateItems(updatedItems)
  }

  const toggleChange = (item, index) => {
    const updatedItems = Array.from(items)
    updatedItems[index].shownInMenu = !item.shownInMenu
    updateItems(updatedItems)
  }

  const renderItemList = (item, index) => {
    return (
      <Draggable draggableId={item.id} index={index} key={item.id}>
        {provided => (
          <LayoutHeaderListItem
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div>
              <input
                checked={item.shownInMenu || false}
                name={item.id}
                onChange={() => toggleChange(item, index)}
                style={{ margin: '10px' }}
                type="checkbox"
                value={item.id || false}
              />
              {item.title}
            </div>
            <DragVerticalIcon />
          </LayoutHeaderListItem>
        )}
      </Draggable>
    )
  }

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <LayoutHeaderListContainer
              {...provided.droppableProps}
              isDraggingOver={snapshot.isDraggingOver}
              ref={provided.innerRef}
            >
              {items.map((item, index) => renderItemList(item, index))}
              {provided.placeholder}
            </LayoutHeaderListContainer>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default PageOrder
