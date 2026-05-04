import styled from 'styled-components'

export const CommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 35%;
`

export const FullCommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 250px;
  ${props => props.readOnlyComments && 'pointer-events: none;'}
  ${props => props.readOnlyComments && 'user-select: none;'}
  /* z-index: 999; */

  & > div {
    left: 0; /* 30px; */
    ${props => props.readOnlyComments && 'pointer-events: none;'}
    ${props => props.readOnlyComments && 'user-select: none;'}
    position: relative;
    right: initial;

    &:first-child {
      left: 0;
      right: 0;
    }
  }

  & ~ div div svg {
    /* THIS IS TO KILL INSERT COMMENT THING */
    ${props => props.authorComments && 'display: none;'}
  }
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
