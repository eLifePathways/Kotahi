import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { th, grid } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { color } from '../../../../theme'
import ReadOnlyAuthorFeedback from '../../../component-author-feedback/src/components/ReadOnlyAuthorFeedback'
import { SectionContent, SectionHeader, Title } from '../../../shared'

const Info = styled.div`
  border-radius: ${th('borderRadius')};
  color: ${color.gray5};
  font-size: ${th('fontSizeBase')};
  margin: ${grid(3)};
  padding: ${grid(2)} ${grid(2)};
`

const PreviousFeedbackSubmissions = ({ version }) => {
  const { t } = useTranslation()

  return version?.authorFeedback?.previousSubmissions?.length > 0 ? (
    <SectionContent key={`manuscript-version-${version.id}`}>
      <SectionHeader>
        <Title>{t('productionPage.Previous Feedback Submissions')}</Title>
      </SectionHeader>
      {version?.authorFeedback?.previousSubmissions.map(
        (previousSubmission, index) => (
          <React.Fragment
            key={`author-feedback-previous-version-${previousSubmission?.submitted}`}
          >
            {index !== 0 && <hr />}
            <ReadOnlyAuthorFeedback
              allFiles={version.files}
              authorFeedback={previousSubmission}
            />
          </React.Fragment>
        ),
      )}
    </SectionContent>
  ) : (
    <SectionContent>
      <Info>{t('productionPage.No feedback submissions')}</Info>
    </SectionContent>
  )
}

PreviousFeedbackSubmissions.propTypes = {
  version: PropTypes.shape({
    id: PropTypes.string.isRequired,
    files: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        storedObjects: PropTypes.arrayOf(PropTypes.object.isRequired),
      }).isRequired,
    ).isRequired,
    authorFeedback: PropTypes.shape({
      previousSubmissions: PropTypes.arrayOf(
        PropTypes.shape({
          text: PropTypes.string,
          fileIds: PropTypes.arrayOf(PropTypes.string),
        }).isRequired,
      ),
    }).isRequired,
  }).isRequired,
}

export default PreviousFeedbackSubmissions
