/* eslint-disable react-hooks/exhaustive-deps, react-hooks/refs */
/* eslint-disable react/prop-types */

import { useEffect, useState, useRef } from 'react'
import { debounce } from 'lodash'
import AsyncSelect from 'react-select/async'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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

const SortableManuscriptItem = ({ it, onDelete, t }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: it.value })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? '#3aae2a' : '#fff',
  }

  return (
    <ListItem ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span>{it.label}</span>
      <Action onClick={() => onDelete(it.value)}>
        {t('cmsPage.metadata.delete')}
      </Action>
    </ListItem>
  )
}

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

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = formData.findIndex(it => it.value === active.id)
    const newIndex = formData.findIndex(it => it.value === over.id)
    onChange(arrayMove(formData, oldIndex, newIndex))
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
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={formData.map(it => it.value)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {formData.map(it => (
              <SortableManuscriptItem
                it={it}
                key={it.value}
                onDelete={onDelete}
                t={t}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  )
}

export default ListManuscripts
