/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Dropdown } from '../../../pubsweet'

export const DownloadDropdown = ({
  manuscriptSource,
  manuscriptId,
  makePdf,
  makeJats,
  isAuthorProofingVersion,
}) => {
  const { t } = useTranslation()

  const options = [
    {
      id: 1,
      onClick: () => {
        // eslint-disable-next-line
        console.log('HTML Selected')
        // eslint-disable-next-line
        console.log('HTML:\n\n', manuscriptSource)

        // Raw HTML file opens in new tab
        const blob = new Blob([manuscriptSource], {
          type: 'text/html;charset=utf8',
        })

        const url = URL.createObjectURL(blob)
        window.open(url)
        URL.revokeObjectURL(url)
      },
      title: 'HTML',
    },
    {
      id: 2,
      onClick: () => {
        // eslint-disable-next-line
        console.log('PDF Selected')
        makePdf('title')
      },
      title: 'PDF',
    },
    {
      id: 3,
      onClick: () => {
        // eslint-disable-next-line
        console.log('JATS selected')
        makeJats(manuscriptId)
      },
      title: 'JATS',
    },
  ]

  return manuscriptSource ? (
    <Dropdown
      itemsList={isAuthorProofingVersion ? [options[0], options[1]] : options}
      primary
    >
      {t('productionPage.Download')}
    </Dropdown>
  ) : null
}

DownloadDropdown.propTypes = {
  manuscriptSource: PropTypes.string.isRequired,
  manuscriptId: PropTypes.string.isRequired,
  makePdf: PropTypes.func.isRequired,
  makeJats: PropTypes.func.isRequired,
}
