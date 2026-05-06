/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next'
import { LayoutMainHeading, LayoutSecondaryHeading } from '../style'
import PageOrder from './PageOrder'

const Header = ({ cmsLayout, onPageOrderUpdated }) => {
  const { t } = useTranslation()
  return (
    <div>
      <LayoutMainHeading>
        {t('cmsPage.layout.Header')}
        <LayoutSecondaryHeading>
          {t('cmsPage.layout.useCheckbox')}
        </LayoutSecondaryHeading>
      </LayoutMainHeading>
      <PageOrder
        initialItems={cmsLayout.flaxHeaderConfig}
        onPageOrderUpdated={onPageOrderUpdated}
      />
    </div>
  )
}

export default Header
