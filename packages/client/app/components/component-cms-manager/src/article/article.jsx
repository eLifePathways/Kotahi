/* eslint-disable react-hooks/exhaustive-deps, react-hooks/use-memo */
/* eslint-disable react/prop-types */

import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { grid, th } from '@coko/client'
import { debounce } from 'lodash'
import { useTranslation } from 'react-i18next'
import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'

import {
  HiddenTabsContainer,
  Tab,
  TabContainer,
  ErrorBoundary,
} from '../../../shared'

import { FormActionButton } from '../style'
import Page from '../../../../ui/shared/Page'
import { FlexRow } from '../../../../globals'

import UploadAsset from '../../../component-production/src/components/uploadManager/UploadAsset'
import ManuscriptMetadata from './ManuscriptMetadata'

const Tabs = styled.div`
  display: flex;
  margin-top: ${grid(1)};
`

const TabRow = styled(FlexRow)`
  width: 100%;
`

const PublishButton = styled(FormActionButton)`
  margin-bottom: ${grid(1)};
  margin-left: auto;
  margin-right: 0;
`

const ScrollableTabContent = styled.section`
  background-color: ${th('color.backgroundA')};
  border-radius: ${th('borderRadius')};
  height: calc(100vh - 200px);

  overflow: auto;
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

  const [activeTab, setActiveTab] = useState('article-template')

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

  const sections = [
    {
      key: 'article-css',
      label: 'Article Css',
      content: (
        <ScrollableTabContent>
          <CodeMirror
            extensions={[css()]}
            onChange={onChangeCss}
            value={cssValue}
          />
        </ScrollableTabContent>
      ),
    },
    {
      key: 'article-template',
      label: 'Article Template',
      content: (
        <ScrollableTabContent>
          <CodeMirror
            extensions={[html()]}
            onChange={onChangeHtml}
            value={htmlValue}
          />
        </ScrollableTabContent>
      ),
    },
    {
      key: 'template-assets',
      label: 'Template Assets',
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
    },
    {
      key: 'manuscript-metadata',
      label: 'Article Metadata',
      content: (
        <ScrollableTabContent>
          <ManuscriptMetadata
            displayShortIdAsIdentifier={displayShortIdAsIdentifier}
            formWithSubmissionFieldsOnly={formWithSubmissionFieldsOnly}
          />
        </ScrollableTabContent>
      ),
    },
  ]

  return (
    <Page title={t('cmsPage.article.title')}>
      <ErrorBoundary>
        <HiddenTabsContainer $sticky={false}>
          <TabRow>
            <Tabs>
              {sections.map(({ key, label }) => (
                <TabContainer key={key} onClick={() => setActiveTab(key)}>
                  <Tab $active={activeTab === key}>
                    <div>{label}</div>
                  </Tab>
                </TabContainer>
              ))}
            </Tabs>
            <PublishButton onClick={onPublish} primary type="button">
              {submitButtonText}
            </PublishButton>
          </TabRow>
        </HiddenTabsContainer>
        {sections.map(section => (
          <div
            key={section.key}
            style={{ display: activeTab === section.key ? 'block' : 'none' }}
          >
            {section.content}
          </div>
        ))}
      </ErrorBoundary>
    </Page>
  )
}

export default Article
