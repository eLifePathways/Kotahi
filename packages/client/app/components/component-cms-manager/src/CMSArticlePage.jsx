import { useContext, useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import Article from './article/article'
import { ConfigContext } from '../../config/src'
import { Spinner, CommsErrorBanner } from '../../shared'

import { rebuildFlaxSiteMutation } from './queries'

const fileFragment = `
  files {
    id
    name
    tags
    created
    storedObjects {
      type
      key
      mimetype
      size
      url
    }
  }
`

const formFields = `
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
      placeholder
      permitPublishing
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
    }
  }
`

const query = gql`
  query($groupId: ID!, $isCms: Boolean!) {

    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${formFields}
    }

    articleTemplate(groupId: $groupId, isCms: $isCms) {
      id
      name
      groupId
      ${fileFragment}
      article
      css
    }
	}
`

export const updateTemplateMutation = gql`
  mutation($id: ID!, $input: UpdateTemplateInput!) {
    updateTemplate(id: $id, input: $input) {
      id
      name
      groupId
      ${fileFragment}
      article
      css
    }
  }
`

const CMSArticlePage = () => {
  const { groupId, controlPanel } = useContext(ConfigContext)
  const [updateTempl] = useMutation(updateTemplateMutation)
  const [rebuildFlaxSite] = useMutation(rebuildFlaxSiteMutation)

  const { t } = useTranslation()

  const [submitButtonText, setSubmitButtonText] = useState(
    t('cmsPage.layout.Publish'),
  )

  const updateTemplate = (id, input) =>
    updateTempl({ variables: { id, input } })

  const { data, loading, error } = useQuery(query, {
    variables: {
      groupId,
      isCms: true,
    },
  })

  const publish = async () => {
    setSubmitButtonText(t('cmsPage.layout.Saving data'))

    setSubmitButtonText(t('cmsPage.layout.Rebuilding Site'))
    await rebuildFlaxSite({
      variables: {
        params: JSON.stringify({
          path: 'pages',
        }),
      },
    })
    setSubmitButtonText(t('cmsPage.layout.Published'))
  }

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const { submissionForm, articleTemplate } = data

  const form = submissionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  return (
    <Article
      articleTemplate={articleTemplate}
      displayShortIdAsIdentifier={controlPanel?.displayManuscriptShortId}
      form={form}
      onPublish={publish}
      submitButtonText={submitButtonText}
      updateTemplate={updateTemplate}
    />
  )
}

export default CMSArticlePage
