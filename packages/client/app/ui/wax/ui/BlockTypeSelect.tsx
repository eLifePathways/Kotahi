import type { ReactNode } from 'react'
import type { Command, EditorState } from 'prosemirror-state'
import styled from 'styled-components'
import { grid } from '@coko/client'

import Select from '../../shared/Select'
import { useWax } from '../editor'
import {
  canSetHeading,
  isHeadingActive,
  setHeading,
  type HeadingLevel,
} from '../features/headings'
import {
  canSetParagraph,
  isParagraphActive,
  setParagraph,
} from '../features/paragraph'
import { canSetTitle, isTitleActive, setTitle } from '../features/title'

type BlockType = {
  value: string
  label: string
  node: string
  command: Command
  isActive: (state: EditorState) => boolean
  isEnabled: (state: EditorState) => boolean
}

const heading = (level: HeadingLevel): BlockType => ({
  value: `heading${level}`,
  label: `Heading ${level}`,
  node: `heading${level}`,
  command: setHeading(level),
  isActive: isHeadingActive(level),
  isEnabled: canSetHeading(level),
})

const blockTypes: BlockType[] = [
  {
    value: 'paragraph',
    label: 'Paragraph',
    node: 'paragraph',
    command: setParagraph,
    isActive: isParagraphActive,
    isEnabled: canSetParagraph,
  },
  {
    value: 'title',
    label: 'Title',
    node: 'title',
    command: setTitle,
    isActive: isTitleActive,
    isEnabled: canSetTitle,
  },
  heading(2),
  heading(3),
  heading(4),
  heading(5),
  heading(6),
]

const StyledSelect = styled(Select)`
  min-width: ${grid(20)};
  width: auto;
`

type BlockTypeSelectProps = {
  className?: string
}

const BlockTypeSelect = ({ className }: BlockTypeSelectProps): ReactNode => {
  const view = useWax(s => s.view)

  const options = useWax(
    ({ state }) =>
      state
        ? blockTypes
            .filter(type => state.schema.nodes[type.node])
            .map(type => ({
              value: type.value,
              label: type.label,
              disabled: !type.isActive(state) && !type.isEnabled(state),
            }))
        : [],
    (a, b) => JSON.stringify(a) === JSON.stringify(b),
  )

  const current: string | undefined = useWax(({ state }) =>
    state
      ? blockTypes.find(
          type => state.schema.nodes[type.node] && type.isActive(state),
        )?.value
      : undefined,
  )

  const handleChange = (value: unknown): void => {
    const type = blockTypes.find(t => t.value === value)
    if (!view || !type) return
    type.command(view.state, view.dispatch, view)
    view.focus()
  }

  return (
    <StyledSelect
      aria-label="Block type"
      className={className}
      onChange={handleChange}
      options={options}
      placeholder="Block type"
      size="small"
      value={current}
    />
  )
}

export default BlockTypeSelect
