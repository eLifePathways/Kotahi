import { useContext, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import Article from './article/article'
import { ConfigContext } from '../../config/src'
import { Spinner, CommsErrorBanner } from '../../shared'

import {
  ARTICLE_TEMPLATE,
  UPDATE_TEMPLATE,
  REBUILD_FLAX_SITE,
} from '../../../queries'

const CMSArticlePage = () => {
  const { groupId, controlPanel } = useContext(ConfigContext)
  const [updateTempl] = useMutation(UPDATE_TEMPLATE)
  const [rebuildFlaxSite] = useMutation(REBUILD_FLAX_SITE)

  const { t } = useTranslation()

  const [submitButtonText, setSubmitButtonText] = useState(
    t('cmsPage.layout.Publish'),
  )

  const updateTemplate = (id, input) =>
    updateTempl({ variables: { id, input } })

  const { data, loading, error } = useQuery(ARTICLE_TEMPLATE, {
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
