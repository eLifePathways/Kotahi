/* eslint-disable react/prop-types */

import { Trans } from 'react-i18next'

const DescriptionField = ({ id, description }) => {
  if (!description) return null

  return (
    <p id={id}>
      <Trans components={{ strong: <strong /> }} i18nKey={description} />
    </p>
  )
}

export default DescriptionField
