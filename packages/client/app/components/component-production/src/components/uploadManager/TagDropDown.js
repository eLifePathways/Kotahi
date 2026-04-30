/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Dropdown } from '../../../../pubsweet'

export const TagDropdown = ({ updateFileFn, tags }) => {
  const { t } = useTranslation()

  const Tags = {
    isCms: t('common.cms'),
    isPdf: t('common.pdf'),
  }

  const options = [
    {
      id: 1,
      onClick: () => {
        updateFileFn({ addTags: ['isCms'], removeTags: ['isPdf'] })
      },
      title: t('common.cms'),
    },
    {
      id: 2,
      onClick: () => {
        updateFileFn({ addTags: ['isPdf'], removeTags: ['isCms'] })
      },
      title: t('common.pdf'),
    },
    {
      id: 3,
      onClick: () => {
        updateFileFn({ addTags: ['isPdf', 'isCms'] })
      },
      title: `${t('common.cms')}/${t('common.pdf')}`,
    },
  ]

  const currentTag = tags.filter(tag => ['isPdf', 'isCms'].includes(tag))

  return (
    <Dropdown itemsList={options} primary>
      {currentTag.length > 1
        ? `${t('common.cms')} / ${t('common.pdf')}`
        : Tags[currentTag[0]]}
    </Dropdown>
  )
}

TagDropdown.propTypes = {
  updateFileFn: PropTypes.func.isRequired,
}
