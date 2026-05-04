/* eslint-disable react-hooks/exhaustive-deps, react-hooks/use-memo */
/* eslint-disable react/prop-types */

import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { grid, th } from '@coko/client'
import { withRouter } from 'react-router-dom'
import { debounce } from 'lodash'
import { useTranslation } from 'react-i18next'
import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'

import {
  Heading,
  HeadingWithAction,
  HiddenTabs,
  Manuscript,
  ErrorBoundary,
} from '../../../shared'

import { FormActionButton } from '../style'

import UploadAsset from '../../../component-production/src/components/uploadManager/UploadAsset'
import ManuscriptMetadata from './ManuscriptMetadata'
import { color } from '../../../../theme'

const FlexRow = styled.div`
  display: flex;
  gap: ${grid(1)};
  justify-content: space-between;
`

const StyledManuscript = styled(Manuscript)`
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  width: 100%;
`

const ScrollableTabContent = styled.section`
  background-color: ${color.backgroundA};
  border-radius: ${th('borderRadius')};
  border-top-left-radius: ${th('borderRadius')};
  box-shadow: ${({ theme }) => theme.boxShadow.shades[200]};
  height: calc(100vh - 108px);
  overflow: auto;
  width: calc(100% - 50px);
`

const Article = ({
  articleTemplate,
  displayShortIdAsIdentifier,
  form,
  onPublish,
  submitButtonText,
  updateTemplate,
}) => {
  const [cssValue, setCssValue] = useState(articleTemplate.css)

  const [htmlValue, setHtmlValue] = useState(articleTemplate.article)

  const onChangeCss = useCallback(
    debounce(cssContent => {
      setCssValue(cssContent)
      updateTemplate(articleTemplate.id, {
        css: cssContent,
      })
    }, 2000),
    [],
  )

  const onChangeHtml = useCallback(
    debounce(article => {
      setHtmlValue(article)
      updateTemplate(articleTemplate.id, { article })
    }, 2000),
    [],
  )

  useEffect(
    () => () => {
      onChangeCss.flush()
      onChangeHtml.flush()
    },
    [],
  )

  const { t } = useTranslation()

  const onCopyAsImage = file => {
    return () => {
      const imageTag = `<img data-name="${file.name}" data-id="${file.id}" src="${file.storedObjects[0].url}" alt="${file.name}" />`

      const copiedStr = `{{ '${imageTag}' | imagesHandler(article.shortId, 'articles', cmsConfig.group, cmsLayout.hexCode) | makeSvgsFromLatex(true) | safe }}`

      return navigator.clipboard.writeText(copiedStr)
    }
  }

  // Don't let users copy handlebars code for fields such as 'manuscriptFile' or 'visualAbstract',
  // as these aren't actually stored in the submission or even the manuscript object.
  // TODO: Provide a way for users to insert such fields into the template.
  const formWithSubmissionFieldsOnly = {
    ...form,
    children: form.children.filter(field =>
      field.name.startsWith('submission.'),
    ),
  }

  const cssArticle = {
    content: (
      <ScrollableTabContent>
        <CodeMirror
          extensions={[css()]}
          onChange={onChangeCss}
          value={cssValue}
        />
      </ScrollableTabContent>
    ),
    key: 'article-css',
    label: 'Article Css',
  }

  const htmlTemplate = {
    content: (
      <ScrollableTabContent>
        <CodeMirror
          extensions={[html()]}
          onChange={onChangeHtml}
          value={htmlValue}
        />
      </ScrollableTabContent>
    ),
    key: 'article-template',
    label: 'Article Template',
  }

  const uploadAssets = {
    content: (
      <ScrollableTabContent>
        <UploadAsset
          files={articleTemplate.files}
          groupTemplateId={articleTemplate.groupId}
          onCopyAsImage={onCopyAsImage}
          tag="isCms"
        />
      </ScrollableTabContent>
    ),
    key: 'template-assets',
    label: 'Template Assets',
  }

  const manuscriptMetadata = {
    content: (
      <ScrollableTabContent>
        <ManuscriptMetadata
          displayShortIdAsIdentifier={displayShortIdAsIdentifier}
          formWithSubmissionFieldsOnly={formWithSubmissionFieldsOnly}
        />
      </ScrollableTabContent>
    ),
    key: 'manuscript-metadata',
    label: 'Article Metadata',
  }

  return (
    <StyledManuscript>
      <HeadingWithAction>
        <FlexRow>
          <Heading>{t('cmsPage.article.title')}</Heading>
          <FormActionButton onClick={onPublish} primary type="button">
            {submitButtonText}
          </FormActionButton>
        </FlexRow>
      </HeadingWithAction>
      <ErrorBoundary>
        <HiddenTabs
          defaultActiveKey="article-template"
          sections={[
            cssArticle,
            htmlTemplate,
            uploadAssets,
            manuscriptMetadata,
          ]}
        />
      </ErrorBoundary>
    </StyledManuscript>
  )
}

export default withRouter(Article)
