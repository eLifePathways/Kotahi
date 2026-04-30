/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

import { useState, useEffect, useContext } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { cloneDeep, omitBy } from 'lodash'
import { ConfigContext } from '../../../config/src'
import FormBuilderLayout from './FormBuilderLayout'
import { Spinner, CommsErrorBanner } from '../../../shared'
import pruneEmpty from '../../../../shared/pruneEmpty'

const formFieldsSegment = `
id
created
updated
purpose
category
groupId
structure {
  name
  description
  haspopup
  popuptitle
  popupdescription
  children {
    title
    shortDescription
    id
    component
    name
    description
    doiValidation
    doiUniqueSuffixValidation
    allowFutureDatesOnly
    uploadAttachmentSource
	isS3Component
    s3Url
    s3Bucket
    s3Region
    allowFutureDatesOnly
    placeholder
    inline
    sectioncss
    parse
    format
    options {
      id
      label
      labelColor
      defaultValue
      value
    }
    validate {
      id
      label
      value
    }
    validateValue {
      minChars
      maxChars
      minSize
    }
    isReadOnly
    hideFromReviewers
    hideFromAuthors
    permitPublishing
    publishingTag
    aiPrompt
	metadataMapping
  }
}
`

const createFormMutation = gql`
  mutation ($form: CreateFormInput!) {
    createForm(form: $form) {
      id
    }
  }
`

const updateFormMutation = gql`
  mutation($form: FormInput!) {
    updateForm(form: $form) {
      ${formFieldsSegment}
    }
  }
`

const updateFormElementMutation = gql`
  mutation ($element: FormElementInput!, $formId: ID!) {
    updateFormElement(element: $element, formId: $formId) {
      id
    }
  }
`

const deleteFormElementMutation = gql`
  mutation ($formId: ID!, $elementId: ID!) {
    deleteFormElement(formId: $formId, elementId: $elementId) {
      id
    }
  }
`

const deleteFormMutation = gql`
  mutation ($formId: ID!) {
    deleteForm(formId: $formId) {
      query {
        forms {
          id
        }
      }
    }
  }
`

const query = gql`
  query GET_FORM($category: String!, $groupId: ID) {
    formsByCategory(category: $category, groupId: $groupId) {
      ${formFieldsSegment}
    }
  }
`

const prepareForSubmit = values => {
  const cleanedValues = omitBy(cloneDeep(values), value => value === '')
  return cleanedValues
}

const FormBuilderPage = ({ category }) => {
  const config = useContext(ConfigContext)

  const { loading, data, error } = useQuery(query, {
    variables: { category, groupId: config.groupId },
  })

  const cleanedForms = pruneEmpty(data?.formsByCategory)

  // TODO Structure forms for graphql and retrieve IDs from these mutations to allow Apollo Cache to do its magic, rather than forcing refetch.
  const [deleteForm] = useMutation(deleteFormMutation, {
    refetchQueries: [
      { query, variables: { category, groupId: config.groupId } },
    ],
  })

  const [deleteFormElement] = useMutation(deleteFormElementMutation, {
    refetchQueries: [
      { query, variables: { category, groupId: config.groupId } },
    ],
  })

  const [updateForm] = useMutation(updateFormMutation, {
    refetchQueries: [
      { query, variables: { category, groupId: config.groupId } },
    ],
  })

  const [updateFormElement] = useMutation(updateFormElementMutation, {
    refetchQueries: [
      { query, variables: { category, groupId: config.groupId } },
    ],
  })

  const [createForm] = useMutation(createFormMutation, {
    refetchQueries: [
      { query, variables: { category, groupId: config.groupId } },
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

  const dragField = event => {
    const form = pruneEmpty(
      data.formsByCategory.find(f => f.id === selectedFormId),
    )

    const fields = form.structure.children
    const fromIndex = event.source.index
    const toIndex = event.destination.index
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
      optimisticResponse: {
        __typename: 'Mutation',
        updateForm: {
          id: form.id,
          __typename: 'FormStructure',
          structure: { ...form.structure, children: newFields },
        },
      },
    })
  }

  useEffect(() => {
    if (data?.formsByCategory?.length) {
      setSelectedFormId(
        prevFormId =>
          prevFormId ??
          data.formsByCategory.find(
            f =>
              f.purpose ===
              (f.category === 'submission' ? 'submit' : f.category),
          )?.id ??
          data.formsByCategory[0].id,
      )
    } else {
      setSelectedFormId(null)
    }
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
