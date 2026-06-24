/* eslint-disable react/prop-types */

import React from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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

const SortablePageItem = ({ item, index, toggleChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id })

  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <LayoutHeaderListItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
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
  )
}

const PageOrder = ({ initialItems, onPageOrderUpdated }) => {
  const [items, setItems] = React.useState(reformObject(initialItems))

  const updateItems = updatedItems => {
    setItems(updatedItems)
    onPageOrderUpdated(updatedItems)
  }

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    updateItems(reorder(items, oldIndex, newIndex))
  }

  const toggleChange = (item, index) => {
    const updatedItems = Array.from(items)
    updatedItems[index].shownInMenu = !item.shownInMenu
    updateItems(updatedItems)
  }

  return (
    <div>
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <LayoutHeaderListContainer>
            {items.map((item, index) => (
              <SortablePageItem
                index={index}
                item={item}
                key={item.id}
                toggleChange={toggleChange}
              />
            ))}
          </LayoutHeaderListContainer>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default PageOrder
