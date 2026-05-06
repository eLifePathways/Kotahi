import styled from 'styled-components'
import FullWaxEditor from '../../../../wax-collab/src/FullWaxEditor'

const FullWaxEditorStyled = styled(FullWaxEditor)`
  div.wax-surface-scroll {
    min-width: 70%;
  }
`

const FullWaxField = input => {
  const { onChange, saveSource } = input
  return (
    <FullWaxEditorStyled
      {...input}
      commentsToolPosition="static"
      hideImages
      hideNotes
      saveSource={saveSource || onChange}
      setComments={() => []}
      useComments
    />
  )
}

export default FullWaxField
