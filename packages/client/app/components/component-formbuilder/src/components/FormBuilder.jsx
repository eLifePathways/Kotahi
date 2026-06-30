/* eslint-disable react/prop-types */

import { useState } from 'react'
import PropTypes from 'prop-types'
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styled, { withTheme } from 'styled-components'
import { th, grid } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { Icon, Action } from '../../../pubsweet'
import { Page } from './style'
import { DragVerticalIcon } from '../../../shared/Icons'
import { ConfirmationModal } from '../../../component-modal/src/ConfirmationModal'
import { determineFieldAndComponent } from './config/Elements'

const FeildWrapper = styled.div`
  align-items: center;
  border-radius: ${th('borderRadius')};
  display: flex;
  padding: ${grid(0.5)};

  &.active {
    background-color: ${th('color.brand1.tint70')};
  }

  &:hover svg {
    stroke: ${th('color.brand1.base')};
  }
`

const Element = styled.div.attrs({
  'data-testid': 'formbuilder-element',
})`
  background-color: ${th('color.backgroundB')};
  border-radius: ${th('borderRadius')};
  display: flex;
  justify-content: space-between;
  width: 100%;

  &.active {
    background-color: ${th('color.brand1.tint70')};
  }
`

const MainAction = styled(Action)`
  flex-grow: 1;
  text-align: left;
`

const IconAction = styled(Action)`
  flex-grow: 0;
  margin: 0 ${grid(1)};
`

const DragIcon = styled(DragVerticalIcon)`
  height: 20px;
  margin-right: ${grid(1)};
  stroke: transparent;
  width: 20px;
`

const UnpaddedIcon = styled(Icon)`
  padding: 0;
  vertical-align: text-top;
`

const SmallIcon = withTheme(({ children }) => (
  <UnpaddedIcon color="transparent" size={2.5}>
    {children}
  </UnpaddedIcon>
))

const FieldTypeLabel = styled.span`
  color: ${th('color.brand1.tint50')};
  font-size: ${th('fontSizeBaseSmall')};
  margin-left: 0.5em;
`

const BuilderElement = ({
  category,
  element,
  isSelected,
  setSelectedFieldId,
  deleteField,
  formId,
  formFeildId,
}) => {
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
  const [formFieldId, setFormFieldId] = useState()
  const { t } = useTranslation()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: formFeildId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    margin: '0px 0px 8px',
  }

  const fieldTypeLabel = determineFieldAndComponent(
    element.name,
    element.component,
    category,
  ).fieldOption?.label

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <FeildWrapper
        className={isSelected || isDragging ? 'active' : undefined}
        id={formFeildId}
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div {...listeners}>
          <DragIcon />
        </div>
        <Element
          className={isSelected || isDragging ? 'active' : undefined}
          key={`element-${element.id}`}
          onClick={() => setSelectedFieldId(element.id)}
        >
          <MainAction>
            {element.shortDescription ?? element.title}{' '}
            <FieldTypeLabel>({fieldTypeLabel})</FieldTypeLabel>
          </MainAction>
          <IconAction
            onClick={e => {
              setDeleteModalIsOpen(true)
              setFormFieldId(element.id)
              e.stopPropagation()
            }}
          >
            <SmallIcon>x</SmallIcon>
          </IconAction>
        </Element>

        <ConfirmationModal
          closeModal={() => setDeleteModalIsOpen(false)}
          confirmationAction={() =>
            deleteField({ variables: { formId, elementId: formFieldId } })
          }
          confirmationButtonText={t('common.Delete')}
          isOpen={deleteModalIsOpen}
          message={t('modals.deleteField.Permanently delete this field')}
        />
      </FeildWrapper>
    </div>
  )
}

BuilderElement.propTypes = {
  element: PropTypes.shape({
    id: PropTypes.string.isRequired,
    shortDescription: PropTypes.string,
    title: PropTypes.string.isRequired,
    component: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  setSelectedFieldId: PropTypes.func.isRequired,
  deleteField: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
}

const FormBuilder = ({
  selectedFieldId,
  form,
  category,
  setSelectedFieldId,
  // addField,
  deleteField,
  dragField,
  moveFieldUp,
  moveFieldDown,
}) => {
  const { t } = useTranslation()
  // localize children elements
  const newForm = { ...form }

  if (form.structure.children) {
    newForm.structure.children = newForm.structure.children.map(element => {
      const newElement = { ...element }
      newElement.label = t(`formBuilder.typeOptions.${element.component}`)
      return newElement
    })
  }

  const fieldIds = form.structure.children?.map(el => el.id) ?? []

  return (
    <Page style={{ display: 'flex', flexDirection: 'column', minHeight: '0' }}>
      <DndContext collisionDetection={closestCenter} onDragEnd={dragField}>
        <SortableContext
          items={fieldIds}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ overflowY: 'scroll', flex: '1 1 0%', minHeight: '0' }}>
            {form.structure.children?.map((element, index) => (
              <BuilderElement
                category={category}
                deleteField={deleteField}
                element={element}
                formFeildId={element.id}
                formId={form.id}
                index={index}
                isSelected={selectedFieldId === element.id}
                key={`element-${element.id}`}
                moveFieldDown={moveFieldDown}
                moveFieldUp={moveFieldUp}
                setSelectedFieldId={setSelectedFieldId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </Page>
  )
}

FormBuilder.propTypes = {
  selectedFieldId: PropTypes.string,
  form: PropTypes.shape({
    id: PropTypes.string,
    purpose: PropTypes.string,
    structure: PropTypes.shape({
      children: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          title: PropTypes.string.isRequired,
          component: PropTypes.string,
        }).isRequired,
      ).isRequired,
    }),
  }).isRequired,
  setSelectedFieldId: PropTypes.func.isRequired,
  addField: PropTypes.func.isRequired,
  deleteField: PropTypes.func.isRequired,
  moveFieldUp: PropTypes.func.isRequired,
  moveFieldDown: PropTypes.func.isRequired,
}

export default FormBuilder
