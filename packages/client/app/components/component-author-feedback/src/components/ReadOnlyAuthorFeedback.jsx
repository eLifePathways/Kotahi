/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next'
import _ from 'lodash'
import styled from 'styled-components'
import { grid } from '@coko/client'
import { PaddedContent, Attachment } from '../../../shared'
import { Legend } from '../../../component-submit/src/style'
import SubmittedStatus from './SubmittedStatus'
import SimpleWaxEditor from '../../../wax-collab/src/SimpleWaxEditor'

const Content = styled(PaddedContent)`
  margin-bottom: ${grid(1)};
  margin-top: ${grid(1)};
  padding: ${grid(1)} ${grid(3)};
`

const ReadOnlyAuthorFeedback = ({ authorFeedback, allFiles }) => {
  const { t } = useTranslation()

  const authorFeedbackFiles = authorFeedback.fileIds
    ? _(allFiles).keyBy('id').at(authorFeedback.fileIds).value()
    : []

  return (
    <>
      <Content>
        <Legend>{t('productionPage.Feedback')}</Legend>
        <SimpleWaxEditor
          key={authorFeedback.text}
          readonly
          value={authorFeedback.text}
        />
      </Content>
      <Content>
        <Legend>{t('productionPage.Attachments')}</Legend>
        {authorFeedbackFiles.map(file => (
          <Attachment file={file} key={file.storedObjects[0].url} uploaded />
        ))}
      </Content>
      <Content>
        <SubmittedStatus authorFeedback={authorFeedback} />
      </Content>
    </>
  )
}

export default ReadOnlyAuthorFeedback
