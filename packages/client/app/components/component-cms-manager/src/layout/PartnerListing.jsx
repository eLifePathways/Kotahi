/* eslint-disable react/prop-types */

import { useMemo } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styled from 'styled-components'
import { grid } from '@coko/client'
import PartnerListItem from './PartnerListItem'

const Files = styled.div`
  display: flex;
  gap: ${grid(2)};
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  margin-top: ${grid(2)};
  overflow: auto;
`

const SortablePartnerItem = ({ file, deleteFile, remove, onUrlAdded, url }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: file.id })

  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PartnerListItem
        deleteFile={deleteFile}
        file={file}
        index={file.originalIndex}
        key={file.name}
        onUrlAdded={onUrlAdded}
        remove={remove}
        uploaded
        url={url}
      />
    </div>
  )
}

const PartnerFileListing = ({
  files,
  deleteFile,
  remove,
  formikProps,
  triggerAutoSave,
}) => {
  const orderedPartnerFiles = useMemo(() => {
    const partners = formikProps.values.partners
    if (!partners?.length) return files
    return [...files].sort((a, b) => {
      const aSeq = partners.find(p => p.id === a.id)?.sequenceIndex ?? Infinity
      const bSeq = partners.find(p => p.id === b.id)?.sequenceIndex ?? Infinity
      return aSeq - bSeq
    })
  }, [files, formikProps.values.partners])

  const onPartnerDataChanged = partnerData => {
    formikProps.setFieldValue('partners', partnerData)
    triggerAutoSave({ partners: partnerData })
  }

  const addUrlToFile = (url, id) => {
    const partnerFiles = formikProps.values.partners
    const currentPartnerIndex = partnerFiles.findIndex(file => file.id === id)
    if (currentPartnerIndex < 0) return
    const updated = partnerFiles.map((f, i) =>
      i === currentPartnerIndex ? { ...f, url } : f,
    )
    onPartnerDataChanged(updated)
  }

  const getFileUrl = fileId => {
    const partnerFiles = formikProps.values.partners
    return partnerFiles.find(f => f.id === fileId)?.url ?? ''
  }

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = orderedPartnerFiles.findIndex(f => f.id === active.id)
    const newIndex = orderedPartnerFiles.findIndex(f => f.id === over.id)
    const reorderedFiles = arrayMove(orderedPartnerFiles, oldIndex, newIndex)

    const partnerFiles = formikProps.values.partners
    const orderedPartnerData = reorderedFiles.map((file, index) => ({
      ...partnerFiles.find(p => p.id === file.id),
      sequenceIndex: index + 1,
    }))

    onPartnerDataChanged(orderedPartnerData)
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext
        items={orderedPartnerFiles.map(f => f.id)}
        strategy={horizontalListSortingStrategy}
      >
        <Files>
          {orderedPartnerFiles.map(file => (
            <SortablePartnerItem
              deleteFile={deleteFile}
              file={file}
              key={file.id}
              onUrlAdded={addUrlToFile}
              remove={remove}
              url={getFileUrl(file.id)}
            />
          ))}
        </Files>
      </SortableContext>
    </DndContext>
  )
}

export default PartnerFileListing
