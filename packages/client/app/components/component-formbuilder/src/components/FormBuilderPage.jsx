/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

import { useState, useEffect, useContext } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { cloneDeep, omitBy } from 'lodash'
import { ConfigContext } from '../../../config/src'
import FormBuilderLayout from './FormBuilderLayout'
import { Spinner, CommsErrorBanner } from '../../../shared'
import pruneEmpty from '../../../../shared/pruneEmpty'
import {
  GET_FORM,
  CREATE_FORM,
  UPDATE_FORM,
  UPDATE_FORM_ELEMENT,
  DELETE_FORM_ELEMENT,
  DELETE_FORM,
} from '../../../../queries'

const prepareForSubmit = values => {
  const cleanedValues = omitBy(cloneDeep(values), value => value === '')
  return cleanedValues
}

const FormBuilderPage = ({ category }) => {
  const config = useContext(ConfigContext)

  const { loading, data, error } = useQuery(GET_FORM, {
    variables: { category, groupId: config.groupId },
  })

  const cleanedForms = pruneEmpty(data?.formsByCategory)

  // TODO Structure forms for graphql and retrieve IDs from these mutations to allow Apollo Cache to do its magic, rather than forcing refetch.
  const [deleteForm] = useMutation(DELETE_FORM, {
    refetchQueries: [
      { query: GET_FORM, variables: { category, groupId: config.groupId } },
    ],
  })

  const [deleteFormElement] = useMutation(DELETE_FORM_ELEMENT, {
    refetchQueries: [
      { query: GET_FORM, variables: { category, groupId: config.groupId } },
    ],
  })

  const [updateForm] = useMutation(UPDATE_FORM, {
    refetchQueries: [
      { query: GET_FORM, variables: { category, groupId: config.groupId } },
    ],
  })

  const [updateFormElement] = useMutation(UPDATE_FORM_ELEMENT, {
    refetchQueries: [
      { query: GET_FORM, variables: { category, groupId: config.groupId } },
    ],
  })

  const [createForm] = useMutation(CREATE_FORM, {
    refetchQueries: [
      { query: GET_FORM, variables: { category, groupId: config.groupId } },
    ],
  })

  const [selectedFormId, setSelectedFormId] = useState()
  const [selectedFieldId, setSelectedFieldId] = useState()
  const [forms, setForms] = useState(cleanedForms)

  useEffect(() => {
    setForms(cleanedForms)
  }, [data?.formsByCategory])

  const moveFieldUp = (form, fieldId) => {
    const fields = form.structure.children
    const currentIndex = fields.findIndex(field => field.id === fieldId)
    if (currentIndex < 1) return

    const fieldsToSwapA = fields[currentIndex - 1]
    const fieldsToSwapB = fields[currentIndex]
    const newFields = [...fields]
    newFields.splice(currentIndex - 1, 2, fieldsToSwapB, fieldsToSwapA)

    updateForm({
      variables: {
        form: prepareForSubmit({
          ...form,
          structure: { ...form.structure, children: newFields },
        }),
      },
    })
  }

  const moveFieldDown = (form, fieldId) => {
    const fields = form.structure.children
    const currentIndex = fields.findIndex(field => field.id === fieldId)
    if (currentIndex < 0 || currentIndex >= fields.length - 1) return

    const fieldsToSwapA = fields[currentIndex]
    const fieldsToSwapB = fields[currentIndex + 1]
    const newFields = [...fields]
    newFields.splice(currentIndex, 2, fieldsToSwapB, fieldsToSwapA)

    updateForm({
      variables: {
        form: prepareForSubmit({
          ...form,
          structure: { ...form.structure, children: newFields },
        }),
      },
    })
  }

  const dragField = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const form = pruneEmpty(
      data.formsByCategory.find(f => f.id === selectedFormId),
    )

    const fields = form.structure.children
    const fromIndex = fields.findIndex(f => f.id === active.id)
    const toIndex = fields.findIndex(f => f.id === over.id)
    const draggedField = fields[fromIndex]
    const newFields = [...fields]
    newFields.splice(fromIndex, 1)
    newFields.splice(toIndex, 0, draggedField)
    setForms(existingForms =>
      existingForms.map(f =>
        f.id === form.id
          ? { ...form, structure: { ...form.structure, children: newFields } }
          : f,
      ),
    )

    updateForm({
      variables: {
        form: prepareForSubmit({
          ...form,
          structure: { ...form.structure, children: newFields },
        }),
      },
    })
  }

  useEffect(() => {
    if (!data?.formsByCategory?.length) {
      setSelectedFormId(null)
      return
    }

    const formIds = new Set(data.formsByCategory.map(f => f.id))

    setSelectedFormId(prev => {
      if (prev && formIds.has(prev)) {
        return prev
      }

      return (
        data.formsByCategory.find(
          f =>
            f.purpose === (f.category === 'submission' ? 'submit' : f.category),
        )?.id ?? data.formsByCategory[0].id
      )
    })
  }, [data])

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  return (
    <FormBuilderLayout
      category={category}
      createForm={async payload => {
        const result = await createForm(payload)
        setSelectedFormId(result.data.createForm.id)
      }}
      deleteField={deleteFormElement}
      deleteForm={deleteForm}
      dragField={dragField}
      forms={forms}
      moveFieldDown={moveFieldDown}
      moveFieldUp={moveFieldUp}
      selectedFieldId={selectedFieldId}
      selectedFormId={selectedFormId}
      setSelectedFieldId={setSelectedFieldId}
      setSelectedFormId={setSelectedFormId}
      shouldAllowAiPrompt={
        config?.groupIdentity?.toggleAi && config?.groupIdentity?.AiSubmission
      }
      shouldAllowHypothesisTagging={
        config?.publishing?.hypothesis?.shouldAllowTagging
      }
      updateField={updateFormElement}
      updateForm={updateForm}
    />
  )
}

export default FormBuilderPage
