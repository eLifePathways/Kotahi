/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { grid } from '@coko/client'
import { useTranslation } from 'react-i18next'
import ReadonlyFormTemplate from '../metadata/ReadonlyFormTemplate'
import {
  Heading,
  Title,
  Icon,
  PlainOrRichText,
  WidthLimiter,
} from '../../../../shared'
import { color } from '../../../../../theme'

const Page = styled.div`
  background: ${color.backgroundC};
  height: 100vh;
  overflow-y: scroll;
  padding: ${grid(2)};
  width: 100%;
`

const IconLink = styled.div`
  align-items: center;
  color: ${color.brand1.base};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  margin: ${grid(2)};
  width: fit-content;
`

const ReviewPreview = ({
  manuscript,
  submissionForm,
  threadedDiscussionProps,
}) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <Page>
      <WidthLimiter>
        <Heading>{t('reviewPreviewPage.Summary')}</Heading>
        <Title>
          <PlainOrRichText value={manuscript.submission.$title} />
        </Title>
        <ReadonlyFormTemplate
          form={submissionForm}
          formData={manuscript}
          hideSpecialInstructions
          manuscript={manuscript}
          showEditorOnlyFields={false}
          threadedDiscussionProps={threadedDiscussionProps}
        />
        <IconLink onClick={() => navigate(-1)}>
          <Icon color={color.brand1.base()} inline size={2}>
            arrow-left
          </Icon>
          {t('reviewPreviewPage.Back')}
        </IconLink>
      </WidthLimiter>
    </Page>
  )
}

ReviewPreview.propTypes = {
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    submission: PropTypes.shape({
      $title: PropTypes.string,
    }).isRequired,
  }).isRequired,
  submissionForm: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        title: PropTypes.string,
        shortDescription: PropTypes.string,
        includeInReveiwPreview: PropTypes.string,
      }).isRequired,
    ).isRequired,
  }).isRequired,
}

export default ReviewPreview
