/* eslint-disable react/prop-types */
/* eslint-disable new-cap */

import Moment from 'react-moment'
import { get } from 'lodash'
import FormCollaborateWax from '../../../../component-formbuilder/src/components/FormCollaborativeWax'
import CollaborativeTextFieldBuilder from '../../../../component-formbuilder/src/components/builderComponents/CollaborativeTextField'
import SimpleWaxEditor from '../../../../wax-collab/src/SimpleWaxEditor'
import { Affiliation, Email, BadgeContainer } from '../style'
import { Attachment, ColorBadge } from '../../../../shared'
import ThreadedDiscussion from '../../../../component-formbuilder/src/components/builderComponents/ThreadedDiscussion/ThreadedDiscussion'
import LocalContext from '../../../../component-submit/src/components/LocalContext'

const parseIdentifierAndName = id => {
  const lastIndex = id.lastIndexOf('-')

  // Split the input string at the last occurrence of '-' character
  const identifier = id.slice(0, lastIndex)
  const name = id.slice(lastIndex + 1)
  return { identifier, name }
}

const CollaborativeReadOnlyField = (Component, data) => {
  const RenderedComponent = FormCollaborateWax(Component)
  const { identifier, name } = parseIdentifierAndName(data)
  return (
    <RenderedComponent
      collaborativeObject={{ identifier }}
      name={name}
      onChange={() => {}}
      readonly
    />
  )
}

const ReadonlyFieldData = ({
  fieldName,
  form,
  formData,
  threadedDiscussionProps,
  isCollaborativeForm,
}) => {
  const data = get(formData, fieldName)
  const fieldDefinition = form.children?.find(field => field.name === fieldName)

  if (fieldDefinition?.component === 'LocalContext') {
    return <LocalContext readonly value={data} />
  }

  if (fieldDefinition?.component === 'AuthorsInput' && Array.isArray(data)) {
    return (data || []).map((author, i) => {
      const firstName = author.firstName || '?'
      const lastName = author.lastName || '?'

      const affiliation = author.affiliation ? ` (${author.affiliation})` : ''

      return (
        <p key={i}>
          {lastName}, {firstName}
          <Affiliation>{affiliation}</Affiliation> <Email>{author.email}</Email>
        </p>
      )
    })
  }

  if (fieldDefinition?.name === 'submission.$sourceUri') {
    return (
      <p key={data}>
        <a href={data} rel="noopener noreferrer" target="_blank">
          {data}
        </a>
      </p>
    )
  }

  if (fieldDefinition?.name === 'submission.$doi') {
    return (
      <p key={data}>
        <a
          href={`https://doi.org/${data}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          {data}
        </a>
      </p>
    )
  }

  if (fieldDefinition?.name === 'submission.$dois' && Array.isArray(data)) {
    return (data || []).map((d, i) => {
      const doi = d.name || d.doi || '?'

      return (
        <p key={`doi-${i}`}>
          <a
            href={`https://doi.org/${doi}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {doi}
          </a>
        </p>
      )
    })
  }

  if (fieldDefinition?.component === 'LinksInput' && Array.isArray(data)) {
    return data.map(link => (
      <p key={link.url}>
        <a href={link.url} rel="noopener noreferrer" target="_blank">
          {link.url}
        </a>
      </p>
    ))
  }

  if (fieldDefinition?.component === 'ThreadedDiscussion' && data) {
    // data should be the threadedDiscussion ID
    const discussion = threadedDiscussionProps.threadedDiscussions.find(
      d => d.id === data,
    ) || {
      threads: [],
    }

    const augmentedThreadedDiscussionProps = {
      ...threadedDiscussionProps,
      threadedDiscussion: discussion,
      threadedDiscussions: undefined,
      shouldRenderSubmitButton: true,
    }

    return (
      <ThreadedDiscussion
        threadedDiscussionProps={augmentedThreadedDiscussionProps}
      />
    )
  }

  if (
    ['SupplementaryFiles', 'VisualAbstract'].includes(
      fieldDefinition?.component,
    ) &&
    Array.isArray(data)
  ) {
    return data.map(file => (
      <Attachment file={file} key={file.storedObjects[0].url} uploaded />
    ))
  }

  if (
    // Shows supplementary, visualAbstract, manuscript tagged files in Metadata submission form
    ['SupplementaryFiles', 'VisualAbstract', 'ManuscriptFile'].includes(
      fieldDefinition?.component,
    ) &&
    Array.isArray(formData.files)
  ) {
    const supplementaryFiles = formData.files.filter(file =>
      file.tags.includes('supplementary'),
    )

    const visualAbstractFiles = formData.files.filter(file =>
      file.tags.includes('visualAbstract'),
    )

    const manuscriptFiles = formData.files.filter(file =>
      file.tags.includes('manuscript'),
    )

    if (
      fieldDefinition?.component === 'SupplementaryFiles' &&
      supplementaryFiles.length > 0
    )
      return supplementaryFiles.map(file => (
        <Attachment file={file} key={file.storedObjects[0].url} uploaded />
      ))

    if (
      fieldDefinition?.component === 'VisualAbstract' &&
      visualAbstractFiles.length > 0
    )
      return visualAbstractFiles.map(file => (
        <Attachment file={file} key={file.storedObjects[0].url} uploaded />
      ))

    if (
      fieldDefinition?.component === 'ManuscriptFile' &&
      manuscriptFiles.length > 0
    )
      return manuscriptFiles.map(file => (
        <Attachment file={file} key={file.storedObjects[0].url} uploaded />
      ))
  }

  if (
    data &&
    ['AbstractEditor', 'FullWaxField'].includes(fieldDefinition?.component)
  )
    return isCollaborativeForm ? (
      CollaborativeReadOnlyField(SimpleWaxEditor, data)
    ) : (
      <SimpleWaxEditor readonly value={data} />
    )

  if (
    data &&
    fieldDefinition?.component === 'TextField' &&
    isCollaborativeForm
  ) {
    const { identifier, name } = parseIdentifierAndName(data)
    return (
      <CollaborativeTextFieldBuilder
        collaborativeObject={{ identifier }}
        disabled
        identifier={data}
        name={name}
        onChange={() => {}}
      />
    )
  }

  if (fieldDefinition?.options) {
    const items = Array.isArray(data) ? data : [data]

    return (
      <BadgeContainer>
        {items.map(item => {
          if (!item && item !== 0) return null

          const option = fieldDefinition.options.find(x => x.value === item)

          if (option) {
            if (option.labelColor)
              return (
                <ColorBadge color={option.labelColor} key={option.id}>
                  {option.label}
                </ColorBadge>
              )

            return <div key={option.id}>{option.label}</div>
          }

          return <span key={item}>{item}</span> // Fallback for data not matching any option
        })}
      </BadgeContainer>
    )
  }

  if (fieldDefinition?.component === 'DatePicker' && data) {
    return (
      <p>
        <Moment format="DD-MM-YYYY">{data}</Moment>
      </p>
    )
  }

  return data || (data === 0 ? '0' : null)
}

export default ReadonlyFieldData
