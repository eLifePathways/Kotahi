import styled from 'styled-components'
import ReactDropzone from 'react-dropzone'

/* eslint-disable-next-line no-unused-vars */
export const Dropzone = styled(({ disableUpload, ...props }) => (
  <ReactDropzone {...props} />
))`
  border: none;
  cursor: pointer;
  ${({ disableUpload }) => disableUpload && 'pointer-events: none;'};
`
