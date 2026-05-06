/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next'
import { VerticalBar, FlexCenter, StatusInfoText, NewEditText } from '../style'
import { convertTimestampToDateTimeString } from '../../../../shared/dateUtils'

const PublishStatus = ({ cmsComponent }) => {
  const isPublished = () => !!cmsComponent.published

  const isEdited = () =>
    !cmsComponent.published || cmsComponent.published < cmsComponent.edited

  const { t } = useTranslation()

  return (
    <StatusInfoText>
      {isEdited() && (
        <FlexCenter>
          <NewEditText>{t('cmsPage.pages.New edits on page')}</NewEditText>{' '}
          <VerticalBar />
        </FlexCenter>
      )}
      <FlexCenter>
        {t('cmsPage.pages.Edited on', {
          date: convertTimestampToDateTimeString(cmsComponent.edited),
        })}
        <VerticalBar />
      </FlexCenter>
      <FlexCenter>
        {isPublished()
          ? t('cmsPage.pages.Published on', {
              date: convertTimestampToDateTimeString(cmsComponent.published),
            })
          : t('cmsPage.pages.Not published yet')}
      </FlexCenter>
    </StatusInfoText>
  )
}

export default PublishStatus
