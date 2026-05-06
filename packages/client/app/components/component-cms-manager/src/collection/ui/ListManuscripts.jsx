/* eslint-disable react-hooks/exhaustive-deps, react-hooks/refs */
/* eslint-disable react/prop-types */

/* eslint-disable no-shadow */
import { useEffect, useState, useRef } from 'react'
import { debounce } from 'lodash'
import AsyncSelect from 'react-select/async'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { ActionButton, Action } from '../../../../shared'

const SelectWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  > div {
    flex-grow: 1;
  }

  > div > div {
    border-radius: 4px 0 0 4px;
  }

  > button {
    border-radius: 0 6px 6px 0;
    min-height: 34px;
  }
`

const ListItem = styled.div`
  border: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px;
`

const ListManuscripts = ({
  uiSchema: {
    'ui:options': { manuscriptLoadOptions: loadOptions },
  },
  formData,
  onChange,
}) => {
  const asyncSelectRef = useRef(null)

  const [toBeAdded, addedFn] = useState([])
  const { t } = useTranslation()

  const onDragEnd = result => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    // reorder using index of source and destination.
    const updatedFormData = formData.slice()
    const [removed] = updatedFormData.splice(result.source.index, 1)
    // put the removed one into destination.
    updatedFormData.splice(result.destination.index, 0, removed)

    onChange(updatedFormData)
  }

  const onDelete = debounce(id => {
    onChange([...formData.filter(sh => sh.value !== id)])
  }, 100)

  const onAdd = debounce(() => {
    onChange([...formData.concat(toBeAdded)])

    if (asyncSelectRef.current.select) {
      asyncSelectRef.current.select.select.clearValue() // Clears selected values
      addedFn([])
    }
  }, 100)

  useEffect(() => {
    onAdd.flush()
    onDelete.flush()
  }, [])

  return (
    <>
      <SelectWrapper>
        <AsyncSelect
          cacheOptions
          isClearable
          isMulti
          loadOptions={loadOptions}
          menuPortalTarget={document.body}
          menuPosition="absolute"
          onChange={val => {
            const found = val.filter(
              s => !formData.find(v => s.value === v.value),
            )

            if (found.length > 0) {
              addedFn([...found])
            }
          }}
          placeholder="Start Typing to Search for Manuscripts"
          ref={asyncSelectRef}
        />
        <ActionButton onClick={() => onAdd()} primary>
          Add
        </ActionButton>
      </SelectWrapper>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="column1">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {formData.map((it, i) => (
                <Draggable draggableId={it.value} index={i} key={it.value}>
                  {(provided, snap) => (
                    <ListItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        backgroundColor: snap.isDragging ? '#3aae2a' : '#fff',

                        ...provided.draggableProps.style,
                      }}
                    >
                      <span>{it.label}</span>
                      <Action onClick={() => onDelete(it.value)}>
                        {t('cmsPage.metadata.delete')}
                      </Action>
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  )
}

export default ListManuscripts
