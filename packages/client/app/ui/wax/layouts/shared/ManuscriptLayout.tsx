import type { CSSProperties, ReactNode } from 'react'
import styled from 'styled-components'
import { th, grid } from '@coko/client'

import { useWax, WaxSurface } from '../../editor'
import { getComments } from '../../features/comments'
import { findNotes } from '../../features/notes'
import {
  findTrackedChanges,
  type TrackPermissions,
} from '../../features/trackChanges'
import {
  CommentsPanel,
  NotesPanel,
  TrackChangesPanel,
  WordCount,
} from '../../ui'
import {
  EditorArea,
  EditorContainer,
  EditorDiv,
  FullWaxEditorGrid,
  Grid,
  InfoContainer,
  Menu,
  ProductionEditorDiv,
  ReadOnlyEditorDiv,
  SideMenu,
  WaxSurfaceScroll,
} from '../styles/editorStyles'
import EditorElements from '../styles/editorElements'
import { fullScreenStyle, TrackCommentOptions } from './toolbars'

const CommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 35%;
`

const CommentTrackToolsContainer = styled.div<{
  $authorComments?: boolean
}>`
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
    ${(props): string | false => props.$authorComments && 'display: none;'}
  }
`

const CommentTrackTools = styled.div`
  display: flex;
  font-size: 12px;
  margin-left: auto;
  position: relative;
  /* white-space: nowrap; */
  z-index: 1;
`

const CommentTrackOptions = styled.div`
  bottom: 5px;
  display: flex;
  margin-left: 10px;
  max-width: 100%;
  /* overflow-x: auto; */
  position: relative;
`

const NotesAreaContainer = styled.div`
  /* stylelint-disable selector-class-pattern */
  background: ${th('color.backgroundA')};
  bottom: ${grid(-2)};
  box-shadow: 0 ${grid(-0.3)} ${grid(0.5)} ${grid(-0.2)} gray;
  display: flex; /* this is so that comments on notes appear beside the notes */
  grid-column-start: editorCol;
  grid-row-start: notesRow;
  /* height: 20vh;
  overflow-y: scroll;
  position: sticky; */
  width: 100%;

  &.productionnotes {
    grid-column-start: initial;
    grid-row-start: initial;
    position: relative;
  }

  .ProseMirror {
    display: inline;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

const ReadOnlyNotesAreaContainer = styled.div`
  background: ${th('color.backgroundA')};
  border-top: 1px solid ${th('color.gray90')};
  grid-column-start: editorCol;
  grid-row-start: notesRow;
  width: 100%;

  .ProseMirror {
    display: inline;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

const NotesContainer = styled.div`
  counter-reset: footnote-view;
  display: flex;
  flex-direction: column;
  padding-bottom: ${grid(4)};
  padding-left: 32px;
  width: calc(100% - ${grid(4)});

  & > div > div > div:first-child {
    margin-top: 4px; /* fix alignment of numbers */
  }
`

const Notes = ({ readonly }: { readonly: boolean }): ReactNode => {
  const count: number = useWax(({ state }) =>
    state ? findNotes(state).length : 0,
  )
  if (!count) return null
  const Container = readonly ? ReadOnlyNotesAreaContainer : NotesAreaContainer

  return (
    <Container className="productionnotes panelWrapper">
      <NotesContainer id="notes-container">
        <NotesPanel />
      </NotesContainer>
    </Container>
  )
}

export type CommentsArea = {
  user: { userId: string; displayName: string; username: string }
  permissions: TrackPermissions
  hideTools?: boolean
  toolsPosition?: CSSProperties['position']
}

const Comments = ({
  user,
  permissions,
  hideTools,
  toolsPosition,
}: CommentsArea): ReactNode => {
  const count: number = useWax(({ state }) =>
    state ? getComments(state).length + findTrackedChanges(state).length : 0,
  )

  return (
    <CommentsContainer>
      <CommentTrackToolsContainer
        $authorComments={hideTools}
        style={toolsPosition ? { position: toolsPosition } : undefined}
      >
        <CommentTrackTools>
          {count} COMMENTS AND SUGGESTIONS
          <CommentTrackOptions>
            <TrackCommentOptions permissions={permissions} user={user} />
          </CommentTrackOptions>
        </CommentTrackTools>
      </CommentTrackToolsContainer>
      <CommentsPanel showTitle user={user} />
      <TrackChangesPanel permissions={permissions} user={user} />
    </CommentsContainer>
  )
}

type ManuscriptLayoutProps = {
  readonly: boolean
  fullScreen: boolean
  toolbar: ReactNode
  sideMenu?: ReactNode
  comments?: CommentsArea
}

export const FullLayout = ({
  readonly,
  fullScreen,
  toolbar,
}: Omit<ManuscriptLayoutProps, 'sideMenu' | 'comments'>): ReactNode => (
  <div id="wax-container" style={fullScreenStyle(fullScreen)}>
    <Grid $readonly={readonly}>
      {readonly ? null : <Menu className="waxmenu">{toolbar}</Menu>}
      <FullWaxEditorGrid $useComments={false}>
        {readonly ? (
          <ReadOnlyEditorDiv className="wax-surface-scroll panelWrapper">
            <WaxSurface />
          </ReadOnlyEditorDiv>
        ) : (
          <EditorDiv $hideComments className="wax-surface-scroll panelWrapper">
            <WaxSurface />
          </EditorDiv>
        )}
        <Notes readonly={readonly} />
        <InfoContainer>
          <WordCount />
        </InfoContainer>
      </FullWaxEditorGrid>
    </Grid>
  </div>
)

export const ProductionLayout = ({
  readonly,
  fullScreen,
  toolbar,
  sideMenu,
  comments,
}: ManuscriptLayoutProps): ReactNode => (
  <div id="main-wax-editor" style={fullScreenStyle(fullScreen)}>
    <Grid $production $readonly={readonly}>
      <Menu className="waxmenu">{toolbar}</Menu>
      <ProductionEditorDiv>
        {sideMenu ? <SideMenu>{sideMenu}</SideMenu> : null}
        <EditorArea className="editorArea production">
          <WaxSurfaceScroll className="panelWrapper">
            <EditorContainer>
              <WaxSurface />
            </EditorContainer>
            {comments ? <Comments {...comments} /> : null}
          </WaxSurfaceScroll>
          <Notes readonly={readonly} />
        </EditorArea>
        <InfoContainer>
          <WordCount />
        </InfoContainer>
      </ProductionEditorDiv>
    </Grid>
  </div>
)
