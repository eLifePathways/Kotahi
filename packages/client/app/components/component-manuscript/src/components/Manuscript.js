/* eslint-disable react/prop-types */

import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import FullWaxEditor from '../../../wax-collab/src/FullWaxEditor'

const Info = styled.span`
  align-items: center;
  display: flex;
  height: 500px;
  justify-content: center;
  list-style: none;
  margin: 0 2em;
  padding: 0;
`

const Columns = styled.div`
  display: grid;
  /* stylelint-disable-next-line string-quotes */
  grid-template-areas: 'manuscript chat';
  grid-template-columns: ${({ chatProps }) => (chatProps ? '3fr 2fr' : '3fr')};
  height: 100%;
  overflow: hidden;
  width: 100%;
`

const ManuscriptContainer = styled.div`
  grid-area: manuscript;
  overflow-y: scroll;
  padding: 2em;

  #wax-container {
    max-width: 1200px;
    min-height: 0;

    & > div > div {
      display: block;
    }
  }
`

const Manuscript = ({ file, content, currentUser, manuscript }) => {
  return (
    <Columns>
      {file &&
      file.storedObjects[0].mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
        <ManuscriptContainer>
          <FullWaxEditor
            readonly
            setComments={() => JSON.parse(manuscript.meta.comments) || []}
            user={currentUser}
            value={content}
          />
        </ManuscriptContainer>
      ) : (
        <Info>No supported view of the file</Info>
      )}
    </Columns>
  )
}

export default withRouter(Manuscript)
