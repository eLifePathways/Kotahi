import type { ReactNode } from 'react'
import {
  BookOutlined,
  FileTextOutlined,
  MessageOutlined,
} from '@ant-design/icons'

import CommandButton from './CommandButton'
import { insertCallout } from '../features/callout'
import {
  canSetReference,
  isReferenceActive,
  setReference,
} from '../features/citation'
import { insertNote } from '../features/notes'

export const NoteButton = (): ReactNode => (
  <CommandButton
    command={insertNote}
    icon={<FileTextOutlined />}
    isEnabled={(state): boolean => !!state.schema.nodes.footnote}
    title="Insert note"
  />
)

export const CalloutButton = (): ReactNode => (
  <CommandButton
    command={insertCallout}
    icon={<MessageOutlined />}
    isEnabled={(state): boolean => !!state.schema.nodes.callout}
    title="Reference callout"
  />
)

export const ReferenceButton = (): ReactNode => (
  <CommandButton
    command={setReference}
    icon={<BookOutlined />}
    isActive={isReferenceActive}
    isEnabled={canSetReference}
    title="Reference"
  />
)
