/* eslint-disable react/prop-types */

import { Trans } from 'react-i18next'

const DescriptionField = ({ id, description }) => {
  if (!description) return null

  return (
    <p id={id}>
      <Trans components={[<strong key="0" />]} i18nKey={description} />
    </p>
  )
}

export default DescriptionField
