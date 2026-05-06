/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability, react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
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

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const PartnerFileListing = ({
  files,
  deleteFile,
  remove,
  formikProps,
  triggerAutoSave,
}) => {
  const [orderedPartnerFiles, setOrderedPartnerFiles] = useState(files)
  useEffect(() => setOrderedPartnerFiles(files), files.length + 1)

  const onPartnerDataChanged = partnerData => {
    formikProps.setFieldValue('partners', partnerData)
    triggerAutoSave({ partners: partnerData })
  }

  const addUrlToFile = (url, id) => {
    const partnerFiles = formikProps.values.partners
    const currentPartnerIndex = partnerFiles.findIndex(file => file.id === id)
    if (currentPartnerIndex < 0) return
    partnerFiles[currentPartnerIndex].url = url
    onPartnerDataChanged(partnerFiles)
  }

  const getFileUrl = fileId => {
    const partnerFiles = formikProps.values.partners

    const currentPartnerIndex = partnerFiles.findIndex(
      file => file.id === fileId,
    )

    if (currentPartnerIndex < 0) return ''
    return partnerFiles[currentPartnerIndex].url
  }

  const setOrderedPartners = reorderedFiles => {
    const partnerFiles = formikProps.values.partners
    const reorderedFileIds = reorderedFiles.map(file => file.id)

    const orderedPartnerData = reorderedFileIds.map((fileId, index) => {
      const partnerFileObject = partnerFiles.find(
        partnerFile => partnerFile.id === fileId,
      )

      partnerFileObject.sequenceIndex = index + 1
      return partnerFileObject
    })

    onPartnerDataChanged(orderedPartnerData)
  }

  const onDragEnd = result => {
    const reorderedFiles = reorder(
      orderedPartnerFiles,
      result.source.index,
      result.destination.index,
    )

    setOrderedPartnerFiles(reorderedFiles)
    setOrderedPartners(reorderedFiles)
  }

  const renderFileItems = (file, index) => {
    return (
      <Draggable draggableId={file.id} index={index} key={file.id}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <PartnerListItem
              deleteFile={deleteFile}
              file={file}
              index={file.originalIndex}
              key={file.name}
              onUrlAdded={addUrlToFile}
              remove={remove}
              uploaded
              url={getFileUrl(file.id)}
            />
          </div>
        )}
      </Draggable>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable direction="horizontal" droppableId="droppable">
        {provided => (
          <Files ref={provided.innerRef} {...provided.droppableProps}>
            {orderedPartnerFiles.map((file, index) =>
              renderFileItems(file, index),
            )}
            {provided.placeholder}
          </Files>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default PartnerFileListing
