/* eslint-disable react/prop-types */

import { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../../../pubsweet'
import ReadonlyFormTemplate from '../metadata/ReadonlyFormTemplate'
import { ensureJsonIsParsed } from '../../../../../shared/objectUtils'
import { SectionHeader, Title } from '../style'
import { LooseRow, SectionContent } from '../../../../shared'
import theme, { color } from '../../../../../theme'

const Heading = styled.h4``

const Container = styled.div`
  & > div {
    margin-bottom: 12px;
  }
`

const StyledStrong = styled.strong`
  color: ${color.gray40};
`

const UnsubmittedBannerBlock = styled.div`
  background: ${color.warning.tint50};
  border-radius: 8px;
  color: ${color.warning.shade50};
  font-size: ${theme.fontSizeBaseSmall};
  font-style: italic;
  line-height: ${theme.lineHeightBaseSmall};
  padding: 2px 20px;
  width: fit-content;
`

// Due to migration to new Data Model
// Attachement component needs different data structure to work
// needs to change the pubsweet ui Attachement to support the new Data Model
/*
const filesToAttachment = file => ({
  name: file.name,
  url: file.storedObjects[0].url,
})
*/

const localizeReviewRecommendations = (jsonData, t) => {
  const clonedData = JSON.parse(JSON.stringify(jsonData))

  if (clonedData?.verdict) {
    clonedData.verdict = t(`reviewVerdict.${clonedData.verdict}`)
  }

  return clonedData
}

const UnsubmittedBanner = () => {
  const { t } = useTranslation()
  return (
    <UnsubmittedBannerBlock>
      {t('reviewPage.neverSubmitted')}
    </UnsubmittedBannerBlock>
  )
}

const Review = ({
  review,
  reviewForm,
  user,
  showEditorOnlyFields,
  showUserInfo = true,
  threadedDiscussionProps,
  sharedReviews,
  isOldUnsubmitted = false,
}) => {
  const { t } = useTranslation()
  let localizedData
  if (review) localizedData = localizeReviewRecommendations(review?.jsonData, t)

  const [open, setOpen] = useState(true)

  const renderContent = () => (
    <ReadonlyFormTemplate
      form={reviewForm}
      formData={ensureJsonIsParsed(localizedData) ?? {}}
      isCollaborativeForm={!!review?.isCollaborative}
      showEditorOnlyFields={
        showEditorOnlyFields ||
        user.groupRoles.includes('groupAdmin') ||
        user.groupRoles.includes('groupManager')
      }
      threadedDiscussionProps={threadedDiscussionProps}
    />
  )

  const renderReviewerInfo = () =>
    review?.user && (
      <div>
        <Heading>
          <strong>{review.user.username}</strong>
        </Heading>
        {review.user.defaultIdentity.identifier}
      </div>
    )

  const renderAnonymousReviewer = () => (
    <div>
      <Heading>
        <Title>{t('reviewPage.Anonymous Reviewer')}</Title>
      </Heading>
    </div>
  )

  if (isOldUnsubmitted)
    return sharedReviews ? (
      <SectionContent>
        <SectionHeader>
          <UnsubmittedBanner />
        </SectionHeader>
      </SectionContent>
    ) : (
      <Container>
        <UnsubmittedBanner />
      </Container>
    )

  return (
    <>
      {!sharedReviews ? (
        <Container>
          {review &&
            !review?.isHiddenReviewerName &&
            showUserInfo &&
            renderReviewerInfo()}

          <LooseRow>
            <Icon
              color="#9e9e9e"
              onClick={() => setOpen(prevOpen => !prevOpen)}
            >
              {open ? 'chevron-up' : 'chevron-down'}
            </Icon>
            {review?.isHiddenReviewerName && showUserInfo && (
              <section>
                <StyledStrong>
                  {t('reviewPage.Anonymous Reviewer')}
                </StyledStrong>
              </section>
            )}
          </LooseRow>

          {open && renderContent()}
        </Container>
      ) : (
        <SectionContent>
          <SectionHeader>
            {review && !review?.isHiddenReviewerName && showUserInfo
              ? renderReviewerInfo()
              : renderAnonymousReviewer()}
          </SectionHeader>

          {open && renderContent()}
        </SectionContent>
      )}
    </>
  )
}

Review.propTypes = {
  review: PropTypes.shape({}),
  user: PropTypes.shape({
    groupRoles: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  }),
}

Review.defaultProps = {
  review: null,
  user: {
    groupRoles: [],
  },
}
export default Review
