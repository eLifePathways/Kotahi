/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th } from '@coko/client'

import Icon from './Icon'

const Filename = styled.span`
  color: ${props => {
    if (props.error) return props.theme.colorError
    if (props.uploaded) return props.theme.colorPrimary
    return props.theme.colorTextPlaceholder
  }};
  display: inline-flex;
  overflow-wrap: break-word;
  padding: 0;
  word-break: break-all;
`

const IconContainer = styled.span`
  margin: 0 ${th('gridUnit')};

  svg {
    height: ${th('fontSizeBase')};
    stroke: ${props =>
      props.theme[props.uploaded ? 'colorPrimary' : 'colorText']};
    width: ${th('fontSizeBase')};
  }
`

const Link = styled.a`
  align-items: center;
  display: flex;
  text-decoration: none;

  &:link:hover ${Filename} {
    text-decoration: underline;
  }
`

const Attachment = ({ file, error, uploaded }) => (
  <Link download={uploaded && file.name} href={uploaded && file.url}>
    <IconContainer uploaded={uploaded}>
      <Icon>paperclip</Icon>
    </IconContainer>
    <Filename error={error} uploaded={uploaded}>
      {error || (uploaded ? file.name : 'Uploading...')}
    </Filename>
  </Link>
)

export default Attachment
