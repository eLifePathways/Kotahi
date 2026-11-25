import { useState, type ReactNode } from 'react'
import { Input } from 'antd'
import { CommentOutlined } from '@ant-design/icons'
import { sortBy } from 'lodash'
import styled from 'styled-components'
import { grid } from '@coko/client'

import Button from '../../shared/Button'
import ButtonGroup from '../../shared/ButtonGroup'
import { useWax } from '../editor'
import {
  addComment,
  canAddComment,
  getActiveComment,
  getComments,
  replyToComment,
  resolveComment,
  type Comment,
} from '../features/comments'
import CommandButton from './CommandButton'
import {
  PanelEmpty,
  PanelHeading,
  PanelItem,
  PanelList,
  PanelMeta,
} from './Panel'
import selectRange from './selectRange'

type CommentUser = { userId: string; displayName: string }

export const AddCommentButton = (): ReactNode => (
  <CommandButton
    command={addComment()}
    icon={<CommentOutlined />}
    isEnabled={canAddComment}
    title="Add comment"
  />
)

const Entry = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(0.5)};
`

type ReplyFormProps = {
  comment: Comment
  showTitle: boolean
  user: CommentUser
}

const ReplyForm = ({ comment, showTitle, user }: ReplyFormProps): ReactNode => {
  const { view } = useWax()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState(comment.data.title)
  const isNew = comment.data.conversation.length === 0

  const post = (): void => {
    if (!view || !content.trim()) return
    replyToComment(
      comment.id,
      { content, timestamp: Date.now(), ...user },
      showTitle ? title : undefined,
    )(view.state, view.dispatch)
    setContent('')
  }

  const resolve = (): void => {
    if (view) resolveComment(comment.id)(view.state, view.dispatch)
    view?.focus()
  }

  return (
    <Entry onClick={(event): void => event.stopPropagation()}>
      {showTitle && isNew ? (
        <Input
          aria-label="Comment title"
          onChange={(event): void => setTitle(event.target.value)}
          placeholder="Title"
          value={title}
        />
      ) : null}
      <Input.TextArea
        aria-label={isNew ? 'Comment' : 'Reply'}
        autoSize={{ minRows: 2 }}
        onChange={(event): void => setContent(event.target.value)}
        placeholder={isNew ? 'Write a comment' : 'Reply'}
        value={content}
      />
      <ButtonGroup justify="right">
        <Button onClick={resolve} size="small">
          {isNew ? 'Cancel' : 'Resolve'}
        </Button>
        <Button
          disabled={!content.trim()}
          onClick={post}
          size="small"
          type="primary"
        >
          Post
        </Button>
      </ButtonGroup>
    </Entry>
  )
}

type CommentsPanelProps = {
  user: CommentUser
  showTitle?: boolean
  className?: string
}

const CommentsPanel = ({
  user,
  showTitle = false,
  className,
}: CommentsPanelProps): ReactNode => {
  const { view, state } = useWax()
  const comments: Comment[] = getComments(state)
  const activeId = getActiveComment(state)?.id

  return (
    <PanelList aria-label="Comments" className={className} role="region">
      <PanelHeading>Comments</PanelHeading>
      {comments.length === 0 ? <PanelEmpty>No comments</PanelEmpty> : null}
      {sortBy(comments, c => c.from).map(comment => {
        const active = comment.id === activeId

        return (
          <PanelItem
            active={active}
            key={comment.id}
            label={comment.data.title || 'Comment'}
            onSelect={(): void => selectRange(view, comment.from)}
          >
            {showTitle && comment.data.title ? (
              <strong>{comment.data.title}</strong>
            ) : null}
            {comment.data.conversation.map(entry => (
              <Entry key={entry.timestamp}>
                <PanelMeta>
                  {entry.displayName} ·{' '}
                  {new Date(entry.timestamp).toLocaleString()}
                </PanelMeta>
                <div>{entry.content}</div>
              </Entry>
            ))}
            {active ? (
              <ReplyForm
                comment={comment}
                key={comment.data.conversation.length}
                showTitle={showTitle}
                user={user}
              />
            ) : null}
          </PanelItem>
        )
      })}
    </PanelList>
  )
}

export default CommentsPanel
