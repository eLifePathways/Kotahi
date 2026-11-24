import type { CSSProperties, ReactNode } from 'react'

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
  CommentsContainer,
  CommentTrackOptions,
  CommentTrackTools,
  CommentTrackToolsContainer,
} from '../styles/commentsStyles'
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
import {
  NotesAreaContainer,
  NotesContainer,
  ReadOnlyNotesAreaContainer,
} from '../styles/notesStyles'
import { fullScreenStyle, TrackCommentOptions } from './toolbars'

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
