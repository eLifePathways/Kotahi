/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th } from '@coko/client'
import { Accordion } from '../../../../shared'

const AlertSuccess = styled.div`
  background: ${th('colorSuccessLight')};
  border-left: 3px solid ${th('colorSuccess')};
  color: ${th('colorSuccessDark')};
  line-height: 1.8;
  padding: 0.5em 1em 0.5em 0.5em;
  width: 600px;
`

const AlertError = styled(AlertSuccess)`
  background: ${th('colorWarningLight')};
  border-left-color: ${th('colorWarning')};
  color: ${th('colorWarningDark')};
`

const Detail = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

const FullWidthAccordion = styled(Accordion)`
  width: 100%;
`

const Alert = ({ children, type, detail }) => {
  if (type === 'success') {
    return (
      <AlertSuccess>
        {detail ? (
          <FullWidthAccordion caretIsOnRight isOpenInitially label={children}>
            <Detail>{detail}</Detail>
          </FullWidthAccordion>
        ) : (
          children
        )}
      </AlertSuccess>
    )
  }

  if (type === 'error') {
    return (
      <AlertError>
        {detail ? (
          <Accordion caretIsOnRight isOpenInitially label={children}>
            <Detail>{detail}</Detail>
          </Accordion>
        ) : (
          children
        )}
      </AlertError>
    )
  }

  throw new Error('Unknown alert type')
}

export default Alert
