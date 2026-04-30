/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { StyledButton } from '../style'
import LabelDropdown from './LabelDropdown'

const CustomStatusContainer = styled.div`
  display: flex;
  width: 100%;
`

const LabelsOrSelectButton = ({
  values,
  manuscript,
  setReadyToEvaluateLabel,
  unsetCustomStatus,
  options,
  doUpdateManuscript,
}) => {
  const { t } = useTranslation()

  if (values?.length)
    return (
      <CustomStatusContainer>
        <LabelDropdown
          doUpdateManuscript={doUpdateManuscript}
          manuscript={manuscript}
          options={options}
          unsetCustomStatus={unsetCustomStatus}
          values={values}
        />
      </CustomStatusContainer>
    )

  return (
    <StyledButton
      onClick={e => {
        e.stopPropagation()
        setReadyToEvaluateLabel(manuscript.id)
      }}
      primary
    >
      {t('manuscriptsPage.Select')}
    </StyledButton>
  )
}

export default LabelsOrSelectButton
