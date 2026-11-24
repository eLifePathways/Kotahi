import type { ReactNode } from 'react'
import styled from 'styled-components'

import FullWaxEditor, { type FullWaxEditorProps } from './FullWaxEditor'

const StyledEditor = styled(FullWaxEditor)`
  div.wax-surface-scroll {
    min-width: 70%;
  }
`

type FullWaxFieldProps = FullWaxEditorProps & {
  onChange?: (html: string) => void
}

const noComments = (): [] => []

const FullWaxField = ({
  onChange,
  saveSource,
  ...props
}: FullWaxFieldProps): ReactNode => (
  <StyledEditor
    {...props}
    commentsToolPosition="static"
    hideImages
    hideNotes
    saveSource={saveSource || onChange}
    setComments={noComments}
    useComments
  />
)

export default FullWaxField
