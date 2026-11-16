import styled from 'styled-components'

export const CommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 35%;
`

export const CommentsContainerNotes = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 35%;
`

export const CommentTrackToolsContainer = styled.div`
  /* background: white; */
  align-self: flex-end;
  display: flex;
  /* margin-right: 30px; */
  padding-top: 5px;
  position: fixed;
  user-select: none;
  z-index: 0;
  /* z-index: 1; */

  & button {
    font-size: 15px;
  }

  & ~ div > div > div > button {
    ${props => props.authorComments && 'display: none;'}
  }
`

export const CommentTrackTools = styled.div`
  display: flex;
  font-size: 12px;
  margin-left: auto;
  position: relative;
  /* white-space: nowrap; */
  z-index: 1;
`

export const CommentTrackOptions = styled.div`
  bottom: 5px;
  display: flex;
  margin-left: 10px;
  max-width: 100%;
  /* overflow-x: auto; */
  position: relative;
`
