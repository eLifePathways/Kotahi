/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th, grid } from '@coko/client'

const ErrorBox = styled.div`
  background-color: ${th('colorFurniture')};
  border-radius: ${th('borderRadius')};
  color: ${th('color.error.shade15')};
  font-size: ${th('fontSizeHeading5')};
  margin: ${grid(6)};
  padding: ${grid(4)} ${grid(6)};
`

const PageError = ({ errorCode }) => {
  let message

  switch (errorCode) {
    case 404:
      message = '404 Page not found.'
      break

    case 403:
      message = '403 Access denied: User privileges required.'
      break

    default:
      message =
        'Something went wrong! Please contact your system administrator for assistance.'
      break
  }

  return <ErrorBox>{message}</ErrorBox>
}

export default PageError
